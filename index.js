"use strict";

function EntityComponentSystem() {
	this.systems = [];
}
EntityComponentSystem.prototype.add = function(code) {
	this.systems.push(code);
};
EntityComponentSystem.prototype.addEach = function(code) {
	this.add(function(entities) {
		var args = arguments;
		entities.forEach(function(entity) {
			args[0] = entity;
			code.apply(undefined, args);
		});
	});
};
EntityComponentSystem.prototype.run = function() {
	var args = arguments;
	this.systems.forEach(function(system) {
		system.apply(undefined, args);
	});
};

module.exports = EntityComponentSystem;
