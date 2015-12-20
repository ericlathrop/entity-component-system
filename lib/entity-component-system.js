"use strict";

var present = require("present");

function EntityComponentSystem() {
	this.systems = [];
	this.systemNames = [];
	this.systemTimes = [];
	this.runCount = 0;
}
EntityComponentSystem.prototype.add = function(code) {
	this.systems.push(code);
	this.systemNames.push(code.name);
	this.systemTimes.push(0);
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
	this.systemNames.push(code.name);
	this.systemTimes.push(0);
};
EntityComponentSystem.prototype.run = function() {
	var args = arguments;
	for (var i = 0; i < this.systems.length; i++) {
		var start = present();
		this.systems[i].apply(undefined, args);
		var end = present();
		this.systemTimes[i] += end - start;
	}
	this.runCount++;
};
EntityComponentSystem.prototype.runs = function() {
	return this.runCount;
};
EntityComponentSystem.prototype.timings = function() {
	return this.systemNames.map(function(name, i) {
		return {
			name: name,
			time: this.systemTimes[i]
		};
	}.bind(this));
};
EntityComponentSystem.prototype.resetTimings = function() {
	this.systemTimes = this.systemTimes.map(function() {
		return 0;
	});
};

module.exports = EntityComponentSystem;
