# entity-component-system

An implementation of the [Entity component system](https://en.wikipedia.org/wiki/Entity_component_system) (ECS) pattern used commonly in video games.

ECS is a way of organizing a system using composition instead of inheritance. It allows you to turn behaviors on and off by adding and removing components to entities.

This module manages the running a list of "systems" over a collection of entities.
An "entity" is an integer id.
A "component" is a chunk of data attached to an entity.
A "system" is a function that processes entities with specific components.

# Example

This is an example video game rendering loop:

```javascript
function drawBackground(entities, context) { /* ... */ }
function drawEntity(entity, context) { /* ... */ }

var EntityComponentSystem = require("entity-component-system").EntityComponentSystem;
var ecs = new EntityComponentSystem();
ecs.add(drawBackground);
ecs.addEach(drawEntity, "sprite"); // only run on entities with a "sprite" component

var EntityPool = require("entity-component-system").EntityPool;
var pool = new EntityPool();
pool.load(/* some JSON */);

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var render = function(time) {
	ecs.run(pool, context);
	window.requestAnimationFrame(render);
};
window.requestAnimationFrame(render);
```

# EntityComponentSystem

An `EntityComponentSystem` holds the systems (code) and allows you to run them with the entities inside an `EntityPool`.

## add(system)

Adds a "system" to the ECS, where a system is a function.
The system is called once every time `run()` is called.
The first parameter passed to the system is the `EntityPool` of entities to operate on.
Any additional parameters are the same as what was passed to `run()`.

## addEach(system, search)

Adds a "system" to the ECS, where a system is a function.
The system is called once for each entity returned from `EntityPool.find(search)` in the `EntityPool` passed to `run()`.
The first parameter passed to the system is an entity id.
Any additional parameters are the same as what was passed to `run()`.

## run(entityPool, [arguments])

Invokes all systems with the specified EntityPool. Any optional extra arguments will be passed through to each system.

# EntityPool

An `EntityPool` holds the entities for an `EntityComponentSystem`. `EntityPool` provides ways to add, remove, modify, and search for entities. `EntityPool` also has hooks where you can provide callbacks to be notified of changes.

## create()

Creates a new entity, and returns the entity's id.

## destroy(id)

Removes all the components for an entity, and deletes the entity. The `onRemoveComponent` callbacks are fired for each component that is removed.

## get(id, component)

Returns the component value for an entity.

## remove(id, component)

Removes a component from an entity. The `onRemoveComponent` callbacks are fired for the removed component.

## set(id, component, value)

Adds or changes a component value for an entity. If the component is newly added, the `onAddComponent` callbacks are fired for the added component.

## onAddComponent(component, callback)

Registers a callback to be called when `component` is added to any entity. The callback is called with the same arguments that `add()` received like `callback(id, component, value)`.

## onRemoveComponent(component, callback)

Registers a callback to be called when `component` is removed from any entity. The callback is called with the same arguments that `remove()` received like `callback(id, component)`.

## find(search)

Returns a list of entity ids for all entities that match the search. See `registerSearch`.

## registerSearch(search, components)

Registers a named `search` for entities that have all components listed in `components`. A search is automatically registered for every individual component that is `add()`ed with the same name as the component. `registerSearch` lets you register searches that require more than one component.

## load(entities)

Load entities from an object. The format looks like:

```json
[
  {
    "id": 1,
    "componentName": "componentValue"
  }
]
```

`load` should be able to load whatever `save` outputs.

## save()

Returns an object suitable for saving all entities in the `EntityPool` to a JSON file. See `load()`.

# Design Goals

1. Perform no allocations during calls to `run()`. This is to avoid triggering garbage collection which can make games stutter.
2. Don't manage entities. This lets users implement object pools to prevent triggering garbage collection.

# Install

With [npm](https://www.npmjs.com/) do:

```
npm install entity-component-system
```

# License

MIT
