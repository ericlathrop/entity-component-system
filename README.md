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

This is an example game loop:

```javascript
var EntityComponentSystem = require("entity-component-system").EntityComponentSystem;
var EntityPool = require("entity-component-system").EntityPool;

var ecs = new EntityComponentSystem();

function drawBackground(entities, elapsed) { /* ... */ }
ecs.add(drawBackground);

function drawEntity(entity, elapsed) { /* ... */ }
ecs.addEach(drawEntity, "sprite"); // only run on entities with a "sprite" component

var entities = new EntityPool();
function spriteFactory() { return { "image": null }; }
entities.registerComponent("sprite", spriteFactory);
entities.load(/* some JSON */);

var lastTime = -1;
var render = function(time) {
  if (this.lastTime === -1) {
    this.lastTime = time;
  }
  var elapsed = time - this.lastTime;
  this.lastTime = time;

  ecs.run(entities, elapsed);
  window.requestAnimationFrame(render);
};
window.requestAnimationFrame(render);
```

# EntityComponentSystem

An `EntityComponentSystem` holds the systems (code) and allows you to `run`
them on the entities inside an `EntityPool`.

## add(system)

Adds a "system" function to the ECS so it will be called once every time `run`
is called.

* `system` is a function that operates on all entities. `system` has the format:

    ```javascript
    function mySystem(entityPool, elapsedTime) { /* ... */ }
    ```

    * `entityPool` is the `EntityPool` of entities to operate on.
    * `elapsedTime` is the elapsed time since the last call to `run`.


## addEach(system, search)

Adds a "system" function to the ECS so it will be called once for each entity
returned from `EntityPool.find(search)` in the `EntityPool` passed to `run`.

* `system` is a function that operates on a single entity matching `search`.
  `system` has the format:

    ```javascript
    function mySystem(entityId, elapsedTime) { /* ... */ }
    ```

    * `entityId` is the id of an entity to operate on.
    * `elapsedTime` is the elapsed time since the last call to `run`.

* `search` is the name of a search that was previously registered with `registerSearch`. `system` is invoked once for every entity in the results of `search`.

## run(entityPool, elapsedTime)

Invokes all systems in the order they were added to the `EntityComponentSystem`.

* `entityPool` is the collection of entities to operate on.
* `elapsedTime` is the time passed since you last called `run`.

## runs()

Returns the number of times `run` was called.

## timings()

Returns an array of each system's name and time it ran in milliseconds. The
system names are gathered from the names of functions passed to `add` and
`addEach`. An example return value:

```json
{
  "drawBackground": 0.02,
  "drawEntity": 5.00
}
```

## resetTimings()

Resets the timing information and number of runs back to zero.

# EntityPool

An `EntityPool` holds the entities and components for an
`EntityComponentSystem`. `EntityPool` provides ways to add, remove, modify, and
search for entities. `EntityPool` also has hooks where you can provide callbacks
to be notified of changes.

`EntityPool` also implements the [Object Pool
pattern](http://gameprogrammingpatterns.com/object-pool.html) to reduce
stuttering caused by garbage collection.

## create()

Creates a new entity, and returns the entity's id.

```javascript
var player = entities.create(); // => 1
```

## destroy(id)

Removes all the components for an entity, and deletes the entity. The
`onRemoveComponent` callbacks are fired for each component that is removed.

* `id` is the id of the entity to destroy.

```javascript
entities.destroy(player);
```

## registerComponent(component, factory, reset, size)

Registers a component type.

* `component` is the name of the component to register.
* `factory` is a factory function which returns a newly allocated instance of
  the component. For example:

    ```javascript
    function createPosition() {
      return {
        x: 0,
        y: 0
      };
    }
    ```

* `reset` is an optional function which alters a previously used component
  instance to a clean state so it can be reused on a new entity. For example:

    ```javascript
    function resetPosition(position) {
      position.x = 0;
      position.y = 0;
    }
    ```

* `size` is an optional number of instances to allocate initially.

## addComponent(id, component)

Adds a new component to an entity, and returns it. If the component is newly added,
the `onAddComponent` callbacks are fired. If the component already existed, it is reset.

* `id` is the id of the entity to add the component to.
* `component` is the name of the component to add.

```javascript
var sprite = entities.addComponent(player, "sprite");
sprite.image = "something.png";
```

## getComponent(id, component)

Returns the component value for an entity.

* `id` is the id of the entity to get the component from.
* `component` is the name of the component to get.

```javascript
var sprite = entities.getComponent(player, "sprite");
sprite.image = "something.png";
```

## setComponent(id, component, value)

Sets a primitive value for a component. To change a component that holds an
object, use `getComponent` instead.

* `id` is the id of the entity to set the component on.
* `component` is the name of the component to set.
* `value` is the primitive value to set.

```javascript
entities.setComponent(player, "health", 100);
```

## removeComponent(id, component)

Removes a component from an entity. The `onRemoveComponent` callbacks are fired
for the removed component.

* `id` is the id of the entity to remove the component from.
* `component` is the name of the component to remove.

```javascript
entities.removeComponent(player, "health");
```

## onAddComponent(component, callback)

Registers a callback to be called when `component` is added to any entity.
`callback` looks like:

```javascript
function myAddCallback(id, component, value) { /* ... */ }
```

## onRemoveComponent(component, callback)

Registers a callback to be called when `component` is removed from any entity.
`callback` looks like:

```javascript
function myRemoveCallback(id, component, removedValue) { /* ... */ }
```

## registerSearch(search, components)

Registers a named search for entities that have all components listed in the
`components` array.

* `search` is the name of the search to register.
* `components` is an array of component names that an entity must possess to be
  included in the results.

```javascript
entities.registerSearch("collectables", ["size", "collisions"]);
```

## find(search)

Returns a list of entity ids for all entities that match the search. See
`registerSearch`.

* `search` is the name of the search previously registered with
  `registerSearch`.

```javascript
var collectables = entities.find("collectables"); // => [1, 2, 3, ...]
```

## load(entities)

Load entities into an entity pool from an array of objects. `load` should only
be used to fill an empty `EntityPool`.

* `entities` is some JSON-compatible object returned by `save`. The format looks
  like:

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

## save()

Returns an object suitable for saving all entities in the `EntityPool` to a JSON
file. See `load()`.

# Install

With [npm](https://www.npmjs.com/) do:

```
npm install --save entity-component-system
```

# License

MIT
