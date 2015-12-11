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
EntityPool.prototype.get = function(id, component) {
	return this._entities[id][component];
};
EntityPool.prototype.remove = function(id, component) {
	delete this._entities[id][component];
	removeFromArray(this.searchResults[component], id);
};
EntityPool.prototype.set = function(id, component, value) {
	this._entities[id][component] = value;
	if (this.searchToComponents[component] === undefined) {
		this.searchToComponents[component] = [component];
		this.componentToSearches[component] = component;
		this.searchResults[component] = [id];
	} else {
		this.searchResults[component].push(id);
	}
};
EntityPool.prototype.find = function(search) {
	return this.searchResults[search] || [];
};

function removeFromArray(array, item) {
	var i = array.indexOf(item);
	if (i !== -1) {
		array.splice(i, 1);
	}
	return array;
}

module.exports = EntityPool;
