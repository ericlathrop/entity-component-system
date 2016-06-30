"use strict";

var test = require("tape");

var ECS = require("./entity-component-system");
var Pool = require("./entity-pool");
var present = require("present");

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
	entities.setComponent(id, "name", "jimmy");

	var ecs = new ECS();
	var done = function(arg, arg2) {
		t.deepEqual(arg, id);
		t.deepEqual(arg2, "arg2");
	};
	ecs.addEach(done, "name");
	ecs.run(entities, "arg2");
});

test("runs returns number of runs", function(t) {
	t.plan(1);

	var ecs = new ECS();
	ecs.run();
	t.equal(ecs.runs(), 1);
});

function waitForTimeToChange() {
	var start = present();
	while (present() === start) {} // eslint-disable-line no-empty
}

test("timings returns timing information for each system", function(t) {
	t.plan(2);

	var ecs = new ECS();
	ecs.add(waitForTimeToChange);
	ecs.run();
	var timings = ecs.timings();
	t.equal(timings[0].name, "waitForTimeToChange");
	t.ok(timings[0].time > 0, "should be greater than 0");
});

test("resetTimings resets timing information to zero", function(t) {
	t.plan(1);

	var ecs = new ECS();
	ecs.add(waitForTimeToChange);
	ecs.run();
	ecs.resetTimings();
	var timings = ecs.timings();
	t.equal(timings[0].time, 0);
});
