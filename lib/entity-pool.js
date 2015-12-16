"use strict";

function EntityPool() {
	this.nextId = 0;
	this._entities = {};
	this.searchToComponents = {};
	this.componentToSearches = {};
	this.searchResults = {};
	this.callbacks = {};
}
EntityPool.prototype.create = function() {
	var id = this.nextId++;
	this._entities[id] = { id: id };
	return id;
};
EntityPool.prototype.destroy = function(id) {
	var entity = this._entities[id];
	Object.keys(entity).forEach(function(component) {
		if (component === "id") {
			return;
		}
		this.remove(id, component);
	}.bind(this));
	delete this._entities[id];
};
EntityPool.prototype.get = function(id, component) {
	return this._entities[id][component];
};
EntityPool.prototype.remove = function(id, component) {
	if (this._entities[id][component] === undefined) {
		return;
	}
	delete this._entities[id][component];
	for (var i = 0; i < this.componentToSearches[component].length; i++) {
		var search = this.componentToSearches[component][i];
		removeFromArray(this.searchResults[search], id);
	}
	this.fireCallback("remove", id, component);
};
EntityPool.prototype.set = function(id, component, value) {
	if (value === undefined) {
		return this.remove(id, component);
	}
	var wasUndefined = this._entities[id][component] === undefined;
	this._entities[id][component] = value;
	if (!wasUndefined) {
		this.fireCallback("change", id, component, value);
		return;
	}
	if (this.searchToComponents[component] === undefined) {
		this.mapSearch(component, [component]);
	}
	for (var i = 0; i < this.componentToSearches[component].length; i++) {
		var search = this.componentToSearches[component][i];
		if (objectHasProperties(this.searchToComponents[search], this._entities[id])) {
			this.searchResults[search].push(id);
		}
	}
	this.fireCallback("add", id, component, value);
};
// private
EntityPool.prototype.addCallback = function(type, component, callback) {
	this.callbacks[type] = this.callbacks[type] || {};
	this.callbacks[type][component] = this.callbacks[type][component] || [];
	this.callbacks[type][component].push(callback);
};
// private
EntityPool.prototype.fireCallback = function(type, id, component) {
	var cbs = this.callbacks[type] || {};
	var ccbs = cbs[component] || [];
	var args = Array.prototype.slice.call(arguments, 3);
	for (var i = 0; i < ccbs.length; i++) {
		ccbs[i].apply(this, [id, component].concat(args));
	}
};

EntityPool.prototype.onAddComponent = function(component, callback) {
	this.addCallback("add", component, callback);
};
EntityPool.prototype.onChangeComponent = function(component, callback) {
	this.addCallback("change", component, callback);
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
	entities.forEach(function(entity) {
		var id = entity.id;
		this._entities[id] = { id: id };
		if (this.nextId <= id) {
			this.nextId = id + 1;
		}
		Object.keys(entity).forEach(function(component) {
			this.set(id, component, entity[component]);
		}.bind(this));
	}.bind(this));
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

module.exports = EntityPool;
