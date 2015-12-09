"use strict";

var test = require("tape");

var ECS = require("./entity-component-system");

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

test("run with each system and array of entities calls system with each entity", function(t) {
	t.plan(2);

	var entities = [{}];
	var ecs = new ECS();
	var done = function(arg, arg2) {
		t.deepEqual(arg, entities[0]);
		t.deepEqual(arg2, "arg2");
	};
	ecs.addEach(done);
	ecs.run(entities, "arg2");
});

test("run with each system and object of entities calls system with each entity", function(t) {
	t.plan(1);

	var entities = { 1337: {} };
	var ecs = new ECS();
	var done = function(arg) {
		t.deepEqual(arg, entities[1337]);
	};
	ecs.addEach(done);
	ecs.run(entities);
});

test("run with each system and requirements and entity with requirements calls system", function(t) {
	t.plan(1);
	var ecs = new ECS();
	ecs.addEach(function(entity) {
		t.equal(entity.name, "me");
	}, ["name"]);
	ecs.run([{}, {"name": "me"}]);
});
