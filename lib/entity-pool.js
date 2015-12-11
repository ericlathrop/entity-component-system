"use strict";

function EntityPool() {
	this.nextId = 0;
	this._entities = {};
}
EntityPool.prototype.create = function() {
	var id = this.nextId++;
	this._entities[id] = {};
	return id;
};
EntityPool.prototype.get = function(id, component) {
	return this._entities[id][component];
};
EntityPool.prototype.remove = function(id, component) {
	delete this._entities[id][component];
};
EntityPool.prototype.set = function(id, component, value) {
	this._entities[id][component] = value;
};

module.exports = EntityPool;
