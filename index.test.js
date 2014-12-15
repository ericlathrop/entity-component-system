"use strict";

var test = require("tape");

var ECS = require("./index");

test("addEntity returns entityId", function(t) {
	t.plan(1);

	var ecs = new ECS();
	var actual = ecs.addEntity();

	t.notEqual(actual, undefined);
});

test("getEntity with nonexistant entity returns undefined", function(t) {
	t.plan(1);

	var ecs = new ECS();
	var actual = ecs.getEntity("notFound");

	t.equal(actual, undefined);
});

test("getEntity with existing entity returns empty object", function(t) {
	t.plan(1);

	var ecs = new ECS();
	var entity = ecs.addEntity();
	var actual = ecs.getEntity(entity);

	t.deepEqual(actual, {});
});

test("getEntities with existing entity returns array of entities", function(t) {
	t.plan(1);

	var ecs = new ECS();
	ecs.addEntity();
	var actual = ecs.getEntities();

	t.deepEqual(actual, [{}]);
});

test("removeEntity with existing entity deletes entity", function(t) {
	t.plan(1);

	var ecs = new ECS();
	var entity = ecs.addEntity();
	ecs.removeEntity(entity);
	var actual = ecs.getEntity(entity);

	t.equal(actual, undefined);
});

test("addComponent with nonexistant entity throws", function(t) {
	t.plan(1);

	var ecs = new ECS();
	t.throws(function() {
		ecs.addComponent("notFound", "component", {});
	});
});

test("addComponent with existing entity adds component", function(t) {
	t.plan(1);

	var ecs = new ECS();
	var entity = ecs.addEntity();
	ecs.addComponent(entity, "component", {});
	t.deepEqual(ecs.getEntity(entity), { component: {} });
});

test("removeComponent with nonexistant entity throws", function(t) {
	t.plan(1);

	var ecs = new ECS();
	t.throws(function() {
		ecs.removeComponent("notFound", "component");
	});
});

test("removeComponent with existing entity removes component", function(t) {
	t.plan(1);

	var ecs = new ECS();
	var entity = ecs.addEntity();
	ecs.addComponent(entity, "component", {});
	ecs.removeComponent(entity, "component");
	t.deepEqual(ecs.getEntity(entity), {});
});

test("run with system with setup calls setup", function(t) {
	t.plan(1);

	var ecs = new ECS();
	ecs.addEntity();
	var done = function(arg) {
		t.deepEqual(arg, "arg");
	};
	ecs.addSystem("simulation", { setup: done });
	ecs.run("simulation", "arg");
});

test("run with entity and system calls system with entity", function(t) {
	t.plan(1);

	var ecs = new ECS();
	var id = ecs.addEntity();
	var done = function(entity) {
		t.deepEqual(entity, ecs.getEntity(id));
	};
	ecs.addSystem("simulation", { each: done });
	ecs.run("simulation");
});

test("run with args calls system with args", function(t) {
	t.plan(1);

	var ecs = new ECS();
	ecs.addEntity();
	var done = function(entity, arg) { // jshint ignore:line
		t.equal(arg, 8);
	};
	ecs.addSystem("simulation", { each: done });
	ecs.run("simulation", 8);
});

test("run with nonexistant group doesn't throw", function(t) {
	t.plan(1);

	var ecs = new ECS();
	t.doesNotThrow(function() {
		ecs.run("simulation");
	});
});
