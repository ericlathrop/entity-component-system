"use strict";

function EntityComponentSystem() {
	this.systems = [];
}
EntityComponentSystem.prototype.add = function(code) {
	this.systems.push(code);
};
EntityComponentSystem.prototype.addEach = function(code, requirements) {
	this.systems.push(function(entities) {
		var args = arguments;
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			if (requirements && !entityHasComponents(requirements, entity)) {
				return;
			}
			args[0] = entity;
			code.apply(undefined, args);
		}
	});
};
EntityComponentSystem.prototype.run = function() {
	var args = arguments;
	this.systems.forEach(function(system) {
		system.apply(undefined, args);
	});
};

function entityHasComponents(components, entity) {
	for (var i = 0; i < components.length; i++) {
		if (!entity.hasOwnProperty(components[i])) {
			return false;
		}
	}
	return true;
}

module.exports = EntityComponentSystem;
