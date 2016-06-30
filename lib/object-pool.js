"use strict";

function ObjectPool(factory, size) {
  if (typeof factory !== "function") {
    console.error("Pool expects a factory function, got ", factory);
  }
  this.factory = factory;
  this.size = size || 1;
  this.dead = [];

  for (var i = 0; i < size; i++) {
    this.dead.push(factory());
  }
}
ObjectPool.prototype.alloc = function() {
  var factory = this.factory;
  var obj;
  if (this.dead.length > 0) {
    obj = this.dead.pop();
  } else {
    obj = factory();
    /* we assume the number "alive" (not stored here)
     * must be equal to this.size, so by creating
     * that many more objects, (including obj above),
     * we double the size of the pool.
     */
    for (var i = 0; i < this.size - 1; i++) {
      this.dead.push(factory());
    }
    this.size *= 2;
  }
  return obj;
};
ObjectPool.prototype.free = function(obj) {
  this.dead.push(obj);
};

module.exports = ObjectPool;
