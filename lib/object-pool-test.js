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
	pool.free(b);
	var c = pool.alloc();

	t.equal(b, c);
});
