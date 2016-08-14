var ObjectPool = require("./object-pool");
var NoSuchComponentPoolException = require("./no-such-component-pool-exception");

function EntityPool() {
  this.entities = {};
  this.nextId = 0;
  this.entityPool = new ObjectPool(function() {
    return { id: this.nextId++ };
  }.bind(this));
  this.componentPools = {};
  this.resetFunctions = {};
  this.searchToComponents = {};
  this.componentToSearches = {};
  this.searchResults = {};
  this.callbacks = {};
}
EntityPool.prototype.create = function() {
  var entity = this.entityPool.alloc();
  this.entities[entity.id] = entity;
  return entity.id;
};
EntityPool.prototype.destroy = function(id) {
  var entity = this.entities[id];
  Object.keys(entity).forEach(function(component) {
    if (component === "id") {
      return;
    }
    this.removeComponent(id, component);
  }.bind(this));
  delete this.entities[id];
  this.entityPool.free(entity);
};
EntityPool.prototype.registerComponent = function(component, factory, reset, size) {
  this.componentPools[component] = new ObjectPool(factory, size);
  this.resetFunctions[component] = reset;
};
// private
EntityPool.prototype.resetComponent = function(id, component) {
  var reset = this.resetFunctions[component];
  if (typeof reset === "function") {
    reset(this.entities[id][component]);
  }
};
EntityPool.prototype.getComponent = function(id, component) {
  return this.entities[id][component];
};
EntityPool.prototype.removeComponent = function(id, component) {
  var oldValue = this.entities[id][component];
  if (oldValue === undefined) {
    return;
  }

  if (!isPrimitive(oldValue)) {
    this.resetComponent(id, component);
    this.componentPools[component].free(oldValue);
  }
  delete this.entities[id][component];

  for (var i = 0; i < this.componentToSearches[component].length; i++) {
    var search = this.componentToSearches[component][i];
    removeFromArray(this.searchResults[search], id);
  }
  this.fireCallback("remove", id, component, oldValue);
};
EntityPool.prototype.addComponent = function(id, component) {
  if (!this.componentPools[component]) {
    throw new NoSuchComponentPoolException(
      "You can't call EntityPool.prototype.addComponent(id, component) " +
      "for a component name that hasn't been registered with " +
      "EntityPool.prototype.registerComponent(component, factory[, reset][, size])."
    );
  }

  var predefinedValue = this.entities[id][component];
  if (predefinedValue && !isPrimitive(predefinedValue)) {
    this.resetComponent(id, component);
    return predefinedValue;
  }

  var value = this.componentPools[component].alloc();
  this.setComponentValue(id, component, value);

  return value;
};
EntityPool.prototype.setComponent = function(id, component, value) {
  if (!isPrimitive(value)) {
    throw new TypeError(
      "You can't call EntityPool.prototype.setComponent(id, component, value) with " +
      "a value that isn't of a primitive type (i.e. null, undefined, boolean, " +
      "number, string, or symbol). For objects or arrays, use " +
      "EntityPool.prototype.addComponent(id, component) and modify " +
      "the result it returns."
    );
  }

  if (!isPrimitive(this.entities[id][component])) {
    throw new Error(
      "You can't set a non-primitive type component to a primitive value. " +
      "If you must do this, remove the existing component first with " +
      "EntityPool.prototype.removeComponent(id, component)."
    );
  }

  if (typeof value === "undefined") {
    this.removeComponent(id, component);
  } else {
    this.setComponentValue(id, component, value);
  }
};
// private
EntityPool.prototype.setComponentValue = function(id, component, value) {
  var existingValue = this.entities[id][component];
  if (typeof existingValue !== "undefined" && existingValue === value) {
    return;
  }

  this.entities[id][component] = value;
  if (this.searchToComponents[component] === undefined) {
    this.mapSearch(component, [component]);
  }
  for (var i = 0; i < this.componentToSearches[component].length; i++) {
    var search = this.componentToSearches[component][i];
    if (objectHasProperties(this.searchToComponents[search], this.entities[id])) {
      this.searchResults[search].push(id);
    }
  }

  if (typeof existingValue === "undefined") {
    this.fireCallback("add", id, component, value);
  }
};
// private
EntityPool.prototype.addCallback = function(type, component, callback) {
  this.callbacks[type] = this.callbacks[type] || {};
  this.callbacks[type][component] = this.callbacks[type][component] || [];
  this.callbacks[type][component].push(callback);
};
// private
EntityPool.prototype.fireCallback = function(type, id, component) {
  if (this.callbackQueue) {
    this.callbackQueue.push(Array.prototype.slice.call(arguments, 0));
    return;
  }
  var cbs = this.callbacks[type] || {};
  var ccbs = cbs[component] || [];
  var args = Array.prototype.slice.call(arguments, 3);
  for (var i = 0; i < ccbs.length; i++) {
    ccbs[i].apply(this, [id, component].concat(args));
  }
};
// private
EntityPool.prototype.fireQueuedCallbacks = function() {
  var queue = this.callbackQueue || [];
  delete this.callbackQueue;
  for (var i = 0; i < queue.length; i++) {
    this.fireCallback.apply(this, queue[i]);
  }
};

EntityPool.prototype.onAddComponent = function(component, callback) {
  this.addCallback("add", component, callback);
};
EntityPool.prototype.onRemoveComponent = function(component, callback) {
  this.addCallback("remove", component, callback);
};
EntityPool.prototype.find = function(search) {
  return this.searchResults[search] || [];
};
// private
EntityPool.prototype.mapSearch = function(search, components) {
  if (this.searchToComponents[search] !== undefined) {
    throw "the search \"" + search + "\" was already registered";
  }

  this.searchToComponents[search] = components.slice(0);

  for (var i = 0; i < components.length; i++) {
    var c = components[i];
    if (this.componentToSearches[c] === undefined) {
      this.componentToSearches[c] = [search];
    } else {
      this.componentToSearches[c].push(search);
    }
  }

  this.searchResults[search] = [];
};
EntityPool.prototype.registerSearch = function(search, components) {
  this.mapSearch(search, components);
  this.searchResults[search] = objectValues(this.entities)
    .filter(objectHasProperties.bind(undefined, components))
    .map(entityId);
};

EntityPool.prototype.load = function(entities) {
  this.callbackQueue = [];
  entities.forEach(function(entity) {
    var id = entity.id;
    var allocatedEntity = this.entityPool.alloc();
    allocatedEntity.id = id;
    this.entities[id] = allocatedEntity;
    if (this.nextId <= id) {
      this.nextId = id + 1;
    }
    Object.keys(entity).forEach(function(component) {
      if (component === "id") {
        return;
      }
      var valueToLoad = entity[component];
      if (isPrimitive(valueToLoad)) {
        this.setComponent(id, component, valueToLoad);
        return;
      }
      var newComponentObject = this.addComponent(id, component);
      Object.keys(valueToLoad).forEach(function(key) {
        newComponentObject[key] = valueToLoad[key];
      });
    }.bind(this));
  }.bind(this));
  this.fireQueuedCallbacks();
};

EntityPool.prototype.save = function() {
  return objectValues(this.entities);
};

function removeFromArray(array, item) {
  var i = array.indexOf(item);
  if (i !== -1) {
    array.splice(i, 1);
  }
  return array;
}

function entityId(entity) {
  return entity.id;
}
function objectHasProperties(properties, obj) {
  return properties.every(Object.prototype.hasOwnProperty.bind(obj));
}

function objectValues(obj) {
  return Object.keys(obj).map(function(key) {
    return obj[key];
  });
}

/* returns true if the value is a primitive
 * type a.k.a. null, undefined, boolean,
 * number, string, or symbol.
 */
function isPrimitive(value) {
  return typeof value !== "object" || value === null;
}

module.exports = EntityPool;
