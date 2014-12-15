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
ECS.prototype.getEntities = function() {
	var ecs = this;
	return Object.keys(this.entities).map(function(id) {
		return ecs.entities[id];
	});
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
ECS.prototype.addSystem = function(group, system) {
	getSystemGroup(this, group).push(system);
};
ECS.prototype.run = function(group) {
	var args = Array.prototype.slice.call(arguments, 1);
	var ecs = this;
	getSystemGroup(ecs, group).forEach(runSystem.bind(this, this, args));
};

function getSystemGroup(ecs, group) {
	if (!ecs.systems[group]) {
		ecs.systems[group] = [];
	}
	return ecs.systems[group];
}

function runSystem(ecs, args, system) {
	Object.keys(ecs.entities).forEach(function(entity) {
		system.apply(ecs, [ecs.entities[entity]].concat(args));
	});
}

module.exports = ECS;
