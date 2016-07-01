"use strict";

var test = require("tape");

var ObjectPool = require("./object-pool");

test("objects get reused after being returned to pool", function(t) {
	t.plan(1);

	var pool = new ObjectPool(function() {
		return {};
	});

	var a = pool.alloc();
	var b = pool.alloc();
	pool.free(a);
	var c = pool.alloc();

	t.equal(a, c);
});

test("allocated objects match result of factory function", function(t) {
	t.plan(5);

	function factory() {
		return {
			a: 1,
			b: {
				c: "hello world"
			},
			d: [3, 2, 1]
		};
	}

	var pool = new ObjectPool(factory);

	var allocated = pool.alloc();
	var factoryResult = factory();

	t.equal(allocated.a, factoryResult.a);
	t.equal(allocated.b.c, factoryResult.b.c);
	for (var i = 0; i < 3; i++) {
		t.equal(allocated.d[i], factoryResult.d[i]);
	}
});

test("ObjectPool constructor creates number of objects specified", function(t) {
	t.plan(4);

	var size = 3;

	var pool = new ObjectPool(function() {
		return {};
	}, size);
	var dead = pool.dead;

	for (var i = 0; i < size; i++) {
		t.ok(dead[i]);
	}
	t.notOk(dead[size], "no more objects created than specified");
});

test("object pool size doubles when limit is exceeded", function(t) {
	t.plan(6);

	var size = 2;

	var pool = new ObjectPool(function() {
		return {};
	}, size);

	t.equal(pool.size, 2);
	var o1 = pool.alloc();
	t.equal(pool.size, 2);
	var o2 = pool.alloc();
	t.equal(pool.size, 2);
	var o3 = pool.alloc();
	t.equal(pool.size, 4);
	var o4 = pool.alloc();
	t.equal(pool.size, 4);
	var o5 = pool.alloc();
	t.equal(pool.size, 8);
});
