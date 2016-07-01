"use strict";

var ObjectPool = require("./object-pool");

function EntityPool() {
	this._entities = {};
	this.nextId = 0;
	this._entityPool = new ObjectPool(function() {
		return { id: this.nextId++ };
	}.bind(this));
	this._componentPools = {};
	this.searchToComponents = {};
	this.componentToSearches = {};
	this.searchResults = {};
	this.callbacks = {};
}
EntityPool.prototype.create = function() {
	var entity = this._entityPool.alloc();
	this._entities[entity.id] = entity;
	return entity.id;
};
EntityPool.prototype.destroy = function(id) {
	var entity = this._entities[id];
	Object.keys(entity).forEach(function(component) {
		if (component === "id") {
			return;
		}
		this.removeComponent(id, component);
	}.bind(this));
	delete this._entities[id];
	this._entityPool.free(entity);
};
EntityPool.prototype.registerComponent = function(component, factory, size) {
	this._componentPools[component] = new ObjectPool(factory, size);
};
EntityPool.prototype.getComponent = function(id, component) {
	return this._entities[id][component];
};
EntityPool.prototype.removeComponent = function(id, component) {
	if (this._entities[id][component] === undefined) {
		return;
	}

	var oldValue = this._entities[id][component];
	delete this._entities[id][component];
	if (!isPrimitive(oldValue)) {
		resetComponent(oldValue);
		this._componentPools[component].free(oldValue);
	}

	for (var i = 0; i < this.componentToSearches[component].length; i++) {
		var search = this.componentToSearches[component][i];
		removeFromArray(this.searchResults[search], id);
	}
	this.fireCallback("remove", id, component, oldValue);
};
EntityPool.prototype.addComponent = function(id, component) {
	if (!this._componentPools[component]) {
		throw new NoSuchComponentPoolException(
			"You can't call EntityPool.prototype.addComponent(id, component) " +
			"for a component name that hasn't been registered with " +
			"EntityPool.prototype.registerComponent(component, factory[, size])."
		);
	}

	var predefinedValue = this._entities[id][component];
	if (predefinedValue) {
		resetComponent(predefinedValue);
		return predefinedValue;
	}

	var value = this._componentPools[component].alloc();
	this._setComponentValue(id, component, value);

	return value;
};
EntityPool.prototype.setComponent = function(id, component, value) {
	if (!isPrimitive(value)) {
		throw new TypeError(
			"You can't call EntityPool.prototype.setComponent(id, component, value) with " +
			"a value that isn't of a primitive type (i.e. null, undefined, boolean, " +
			"number, string, or symbol). For objects or arrays, use " +
			"EntityPool.prototype.addComponent(id, component) and modify " +
			"the result it returns."
		);
	}

	if (!isPrimitive(this._entities[id][component])) {
		throw new Error(
			"You can't set a non-primitive type component to a primitive value. " +
			"If you must do this, remove the existing component first with " +
			"EntityPool.prototype.removeComponent(id, component)."
		);
	}

	if (typeof value === "undefined") {
		this.removeComponent(id, component);
	} else {
		this._setComponentValue(id, component, value);
	}
};
// private
EntityPool.prototype._setComponentValue = function(id, component, value) {
	var existingValue = this._entities[id][component];
	if (typeof existingValue !== "undefined" && existingValue === value) {
		return;
	}

	this._entities[id][component] = value;
	if (this.searchToComponents[component] === undefined) {
		this.mapSearch(component, [component]);
	}
	for (var i = 0; i < this.componentToSearches[component].length; i++) {
		var search = this.componentToSearches[component][i];
		if (objectHasProperties(this.searchToComponents[search], this._entities[id])) {
			this.searchResults[search].push(id);
		}
	}
	
	if (typeof existingValue === "undefined") {
		this.fireCallback("add", id, component, value);
	}
}
// private
EntityPool.prototype.addCallback = function(type, component, callback) {
	this.callbacks[type] = this.callbacks[type] || {};
	this.callbacks[type][component] = this.callbacks[type][component] || [];
	this.callbacks[type][component].push(callback);
};
// private
EntityPool.prototype.fireCallback = function(type, id, component) {
	if (this.callbackQueue) {
		this.callbackQueue.push(Array.prototype.slice.call(arguments, 0));
		return;
	}
	var cbs = this.callbacks[type] || {};
	var ccbs = cbs[component] || [];
	var args = Array.prototype.slice.call(arguments, 3);
	for (var i = 0; i < ccbs.length; i++) {
		ccbs[i].apply(this, [id, component].concat(args));
	}
};
// private
EntityPool.prototype.fireQueuedCallbacks = function() {
	var queue = this.callbackQueue || [];
	delete this.callbackQueue;
	for (var i = 0; i < queue.length; i++) {
		this.fireCallback.apply(this, queue[i]);
	}
};

EntityPool.prototype.onAddComponent = function(component, callback) {
	this.addCallback("add", component, callback);
};
EntityPool.prototype.onRemoveComponent = function(component, callback) {
	this.addCallback("remove", component, callback);
};
EntityPool.prototype.find = function(search) {
	return this.searchResults[search] || [];
};
// private
EntityPool.prototype.mapSearch = function(search, components) {
	if (this.searchToComponents[search] !== undefined) {
		throw "the search \"" + search + "\" was already registered";
	}

	this.searchToComponents[search] = components.slice(0);

	for (var i = 0; i < components.length; i++) {
		var c = components[i];
		if (this.componentToSearches[c] === undefined) {
			this.componentToSearches[c] = [search];
		} else {
			this.componentToSearches[c].push(search);
		}
	}

	this.searchResults[search] = [];
};
EntityPool.prototype.registerSearch = function(search, components) {
	this.mapSearch(search, components);
	this.searchResults[search] = objectValues(this._entities)
		.filter(objectHasProperties.bind(undefined, components))
		.map(entityId);
};

EntityPool.prototype.load = function(entities) {
	this.callbackQueue = [];
	entities.forEach(function(entity) {
		var id = entity.id;
		var allocatedEntity = this._entityPool.alloc();
		allocatedEntity.id = id;
		this._entities[id] = allocatedEntity;
		if (this.nextId <= id) {
			this.nextId = id + 1;
		}
		Object.keys(entity).forEach(function(component) {
			if (component === "id") {
				return;
			}
			var valueToLoad = entity[component];
			if (isPrimitive(valueToLoad)) {
				return this.setComponent(id, component, valueToLoad);
			}
			var newComponentObject = this.addComponent(id, component);
			Object.keys(valueToLoad).forEach(function(key) {
				newComponentObject[key] = valueToLoad[key];
			});
		}.bind(this));
	}.bind(this));
	this.fireQueuedCallbacks();
};

EntityPool.prototype.save = function() {
	return objectValues(this._entities);
};

function removeFromArray(array, item) {
	var i = array.indexOf(item);
	if (i !== -1) {
		array.splice(i, 1);
	}
	return array;
}

function resetComponent(value) {
	if (typeof value.reset === 'function') {
		value.reset();
	}
}

function entityId(entity) {
	return entity.id;
}
function objectHasProperties(properties, obj) {
	return properties.every(Object.prototype.hasOwnProperty.bind(obj));
}

function objectValues(obj) {
	return Object.keys(obj).map(function(key) {
		return obj[key];
	});
}

/* returns true if the value is a primitive
 * type a.k.a. null, undefined, boolean,
 * number, string, or symbol.
 */
function isPrimitive(value) {
	return typeof value !== "object" || value === null;
}

function NoSuchComponentPoolException (message) {
	this.message = message;
}

module.exports = EntityPool;
