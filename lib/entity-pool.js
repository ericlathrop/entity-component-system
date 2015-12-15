"use strict";

function EntityPool() {
	this.nextId = 0;
	this._entities = {};
	this.searchToComponents = {};
	this.componentToSearches = {};
	this.searchResults = {};
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
	delete this._entities[id][component];
	for (var i = 0; i < this.componentToSearches[component].length; i++) {
		var search = this.componentToSearches[component][i];
		removeFromArray(this.searchResults[search], id);
	}
};
EntityPool.prototype.set = function(id, component, value) {
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
