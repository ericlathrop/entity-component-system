"use strict";

function ECS() {
	this.lastId = 0;
	this.entities = {};
	this.systems = {};
}
ECS.prototype.addEntity = function() {
	var id = this.lastId;
	this.entities[id] = {};
	this.lastId++;
	return id;
};
ECS.prototype.getEntity = function(entity) {
	return this.entities[entity];
};
ECS.prototype.removeEntity = function(entity) {
	delete this.entities[entity];
};
ECS.prototype.addComponent = function(entity, name, component) {
	this.entities[entity][name] = component;
};
ECS.prototype.removeComponent = function(entity, name) {
	delete this.entities[entity][name];
};
ECS.prototype.addSystem = function(name, system) {
	if (!this.systems[name]) {
		this.systems[name] = [];
	}
	this.systems[name].push(system);
};
ECS.prototype.run = function(name) {
	var args = Array.prototype.slice.call(arguments, 1);
	var ecs = this;
	this.systems[name].forEach(function(system) {
		Object.keys(ecs.entities).forEach(function(entity) {
			system.apply(ecs, [ecs.entities[entity]].concat(args));
		});
	});
};

module.exports = ECS;
