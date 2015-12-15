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

test("destroy deletes a whole entity", function(t) {
	t.plan(1);

	t.throws(function() {
		var pool = new EntityPool();
		var id = pool.create();
		pool.destroy(id);
		pool.get(id, "id");
	});
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

test("registerSearch with two components and entities already added returns entities", function(t) {
	t.plan(1);

	var pool = new EntityPool();
	var id = pool.create();
	pool.set(id, "name", "jimmy");
	pool.set(id, "age", 8);
	pool.registerSearch("peopleWithAge", ["name", "age"]);
	var results = pool.find("peopleWithAge");

	t.deepEqual(results, [id]);
});

test("registerSearch with two components and entities added after returns entities", function(t) {
	t.plan(1);

	var pool = new EntityPool();
	var id = pool.create();
	pool.registerSearch("peopleWithAge", ["name", "age"]);
	pool.set(id, "name", "jimmy");
	pool.set(id, "age", 8);
	var results = pool.find("peopleWithAge");

	t.deepEqual(results, [id]);
});

test("registerSearch twice with same name throws", function(t) {
	t.plan(1);

	t.throws(function() {
		var pool = new EntityPool();
		pool.registerSearch("search", ["search"]);
		pool.registerSearch("search", ["search"]);
	});
});

test("remove removes an entity from a complex search", function(t) {
	t.plan(1);

	var pool = new EntityPool();
	var id = pool.create();
	pool.registerSearch("peopleWithAge", ["name", "age"]);
	pool.set(id, "name", "jimmy");
	pool.set(id, "age", 8);
	pool.remove(id, "age");
	var results = pool.find("peopleWithAge");

	t.deepEqual(results, []);
});

test("load creates an entity", function(t) {
	t.plan(1);

	var pool = new EntityPool();
	pool.load([{ id: 1, name: "jimmy" }]);
	var name = pool.get(1, "name");

	t.deepEqual(name, "jimmy");
});

test("load increments next id", function(t) {
	t.plan(1);

	var pool = new EntityPool();
	pool.load([{ id: 1, name: "jimmy" }]);
	var id = pool.create();

	t.deepEqual(id, 2);
});
