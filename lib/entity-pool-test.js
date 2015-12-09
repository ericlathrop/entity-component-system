"use strict";

var test = require("tape");

var EntityPool = require("./entity-pool");

test("create returns an entity id", function(t) {
	t.plan(1);

	var pool = new EntityPool();
	var id = pool.create();
	t.equal(typeof id, "number");
});

test("create returns different ids each time", function(t) {
	t.plan(1);

	var pool = new EntityPool();
	var id1 = pool.create();
	var id2 = pool.create();
	t.notEqual(id1, id2);
});

test("set with component can be fetched with get", function(t) {
	t.plan(1);

	var pool = new EntityPool();
	var id = pool.create();
	pool.set(id, "name", "jimmy");
	var name = pool.get(id, "name");

	t.equal(name, "jimmy");
});
