"use strict";

var test = require("tape");

var ECS = require("./entity-component-system");
var Pool = require("./entity-pool");

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

	var entities = new Pool();
	var id = entities.create();
	entities.set(id, "name", "jimmy");

	var ecs = new ECS();
	var done = function(arg, arg2) {
		t.deepEqual(arg, id);
		t.deepEqual(arg2, "arg2");
	};
	ecs.addEach(done, "name");
	ecs.run(entities, "arg2");
});
