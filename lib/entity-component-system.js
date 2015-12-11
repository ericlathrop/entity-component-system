"use strict";

function EntityComponentSystem() {
	this.systems = [];
}
EntityComponentSystem.prototype.add = function(code) {
	this.systems.push(code);
};
EntityComponentSystem.prototype.addEach = function(code, search) {
	this.systems.push(function(entities) {
		var args = arguments;
		var keys = entities.find(search);
		for (var i = 0; i < keys.length; i++) {
			var entity = keys[i];
			args[0] = entity;
			code.apply(undefined, args);
		}
	});
};
EntityComponentSystem.prototype.run = function() {
	var args = arguments;
	for (var i = 0; i < this.systems.length; i++) {
		this.systems[i].apply(undefined, args);
	}
};

module.exports = EntityComponentSystem;
