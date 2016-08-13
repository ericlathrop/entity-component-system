# entity-component-system

An implementation of the [Entity Component
System](https://en.wikipedia.org/wiki/Entity_component_system) (ECS) pattern
used commonly in video games.

ECS is a way of organizing a system using composition instead of inheritance. It
allows you to turn behaviors on and off by adding and removing components to
entities.

This module manages the running of a list of "systems" over a collection of
entities.

* An "entity" is a logical object in a game.
* A "component" is a chunk of data attached to an entity.
* A "system" is a function that runs on all entities with specific components.

The only way to make changes to an entity is to create/edit/delete components
attached to it.


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
function spriteFactory() { return { "image": null }; }
pool.registerComponent("sprite", spriteFactory);
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

An `EntityComponentSystem` holds the systems (code) and allows you to `run`
them on the entities inside an `EntityPool`.

## add(system)

Adds a "system" function to the ECS. `system` is called once every time
`run` is called. `system` looks like:

```javascript
function mySystem(entityPool, elapsedTime) { /* ... */ }
```

* `entityPool` is the `EntityPool` of entities to operate on.
* `elapsedTime` is the elapsed milliseconds since the last call to `run`.


## addEach(system, search)

Adds a "system" function to the ECS. `system` is called once for each entity
returned from `EntityPool.find(search)` in the `EntityPool` passed to `run`.
`system` looks like:

```javascript
function mySystem(entityId, elapsedTime) { /* ... */ }
```

* `entityId` is the id of an entity to operate on.
* `elapsedTime` is the elapsed milliseconds since the last call to `run`.

## run(entityPool, elapsedTime)

Invokes all systems with the specified `EntityPool`, and elapsed time in
milliseconds.

## runs()

Returns the number of times `run` was called.

## timings()

Returns an array of each system's `name` and `time` it ran in milliseconds. The
system names are gathered from the names of functions passed to `add` and
`addEach`.

## resetTimings()

Resets the timing information and number of runs back to zero.

# EntityPool

An `EntityPool` holds the entities for an `EntityComponentSystem`. `EntityPool` provides ways to add, remove, modify, and search for entities. `EntityPool` also has hooks where you can provide callbacks to be notified of changes.

## create()

Creates a new entity, and returns the entity's id.

## destroy(id)

Removes all the components for an entity, and deletes the entity. The `onRemoveComponent` callbacks are fired for each component that is removed.

## registerComponent(component, factory, reset, size)

Registers a component type. The `factory` function returns a newly allocated instance of the component. The optional `reset` function resets a previously used component instance to a clean state so it can be used again for a new entity. The optional `size` specifies how many instances to allocate initially.

## getComponent(id, component)

Returns the component value for an entity.

## removeComponent(id, component)

Removes a component from an entity. The `onRemoveComponent` callbacks are fired for the removed component.

## addComponent(id, component, value)

Adds component to an entity, and returns it. If the component is newly added, the `onAddComponent` callbacks are fired, and `registerSearch` is automatically called for the added component. If the component already existed, it is reset.

```javascript
var sprite = pool.addComponent(someEntity, "sprite");
sprite.image = "something.png";
```

## onAddComponent(component, callback)

Registers a callback to be called when `component` is added to any entity. The callback is called with the same arguments that `add()` received, for example: `callback(id, component, value)`.

## onRemoveComponent(component, callback)

Registers a callback to be called when `component` is removed from any entity. For example: `callback(id, component, oldValue)`.

## find(search)

Returns a list of entity ids for all entities that match the search. See `registerSearch`.

## registerSearch(search, components)

Registers a named `search` for entities that have all components listed in the `components` array, for example: `registerSearch("collectables", ["size", "collisions"])`.

## load(entities)

Load entities into an entity pool from an array of objects.
`load` should only be used to fill an empty Entity Pool.
The format looks like:

```json
[
	{
		"id": 1,
		"componentName": "componentValue"
	},
	{
		"id": 2,
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
