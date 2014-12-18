"use strict";

var test = require("tape");

var ECS = require("./index");

test("run with system and entities calls system with entities", function(t) {
	t.plan(1);

	var entities = [{}];
	var ecs = new ECS();
	var done = function(arg) {
		t.deepEqual(arg, entities);
	};
	ecs.add(done);
	ecs.run(entities);
});

test("run with each system and entities calls system with each entity", function(t) {
	t.plan(1);

	var entities = [{}];
	var ecs = new ECS();
	var done = function(arg) {
		t.deepEqual(arg, entities[0]);
	};
	ecs.addEach(done);
	ecs.run(entities);
});
