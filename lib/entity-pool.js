"use strict";

function EntityPool() {
	this.nextId = 0;
	this.entities = {};
}
EntityPool.prototype.create = function() {
	var id = this.nextId++;
	this.entities[id] = {};
	return id;
};
EntityPool.prototype.get = function(id, component) {
	return this.entities[id][component];
};
EntityPool.prototype.set = function(id, component, value) {
	this.entities[id][component] = value;
};


module.exports = EntityPool;
