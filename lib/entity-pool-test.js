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

test("get with id returns the id", function(t) {
	t.plan(1);

	var pool = new EntityPool();
	var id = pool.create();
	var result = pool.get(id, "id");
	t.equal(result, id);
});

test("set with component can be fetched with get", function(t) {
	t.plan(1);

	var pool = new EntityPool();
	var id = pool.create();
	pool.set(id, "name", "jimmy");
	var name = pool.get(id, "name");

	t.equal(name, "jimmy");
});
test("set with component can be fetched with get", function(t) {
	t.plan(1);

	var pool = new EntityPool();
	var id = pool.create();
	pool.set(id, "name", "jimmy");
	var name = pool.get(id, "name");

	t.equal(name, "jimmy");
});

test("remove with component makes it unable to be fetched", function(t) {
	t.plan(1);

	var pool = new EntityPool();
	var id = pool.create();
	pool.set(id, "name", "jimmy");
	pool.remove(id, "name");
	var name = pool.get(id, "name");

	t.equal(name, undefined);
});

test("find with no matching components returns empty list", function(t) {
	t.plan(1);

	var pool = new EntityPool();
	var id = pool.create();
	pool.set(id, "name", "jimmy");
	var results = pool.find("does-not-exist");

	t.deepEqual(results, []);
});

test("find with matching component returns list with entities", function(t) {
	t.plan(1);

	var pool = new EntityPool();
	var id = pool.create();
	pool.set(id, "name", "jimmy");
	var id2 = pool.create();
	pool.set(id2, "name", "amy");
	var results = pool.find("name");

	t.deepEqual(results, [id, id2]);
});

test("find with deleted component returns empty list", function(t) {
	t.plan(1);

	var pool = new EntityPool();
	var id = pool.create();
	pool.set(id, "name", "jimmy");
	pool.remove(id, "name");
	var results = pool.find("name");

	t.deepEqual(results, []);
});
