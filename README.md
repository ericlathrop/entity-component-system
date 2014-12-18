# entity-component-system

An implementation of the [Entity component system](https://en.wikipedia.org/wiki/Entity_component_system) (ECS) pattern used commonly in video games.

ECS is a way of organizing a system using composition instead of inheritance. It allows you to turn behaviors on and off by adding and removing components to entities.

This module manages the running an array of "systems" over an array of entities. 
An "entity" is a plain-old-javascript object.
A "component" is a piece of data stored on a key inside an entity.
A "system" is a function.

# Example

This is an example video game rendering loop:

```javascript
function drawBackground(entities, context) { /* ... */ }
function drawEntity(entity, context) { /* ... */ }

var ECS = require("entity-component-system");
var ecs = new ECS();
ecs.add(drawBackground);
ecs.addEach(drawEntity, ["sprite"]); // only run on entities with a "sprite" component

var entities = [];
// TODO: create entities and populate the entities array

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var render = function(time) {
	ecs.run(entitues, context);
	window.requestAnimationFrame(render);
};
window.requestAnimationFrame(render);
```

# add(system)

Adds a "system" to the ECS, where a system is a function.
The system is called once every time `run()` is called.
The first parameter passed to the system is the array of entities to operate on.
Any additional parameters are the same as what was passed to `run()`.

# addEach(system, requirements)

Adds a "system" to the ECS, where a system is a function.
The system is called once for each entity in the array of entities passed to `run()`.
The first parameter passed to the system a single entity.
Any additional parameters are the same as what was passed to `run()`.

If `requirements` exists, it should be an array of string key names.
The system will only be invoked for entities that have the keys specified in `requirements`.

# run(entities, [arguments])

Invokes all systems with the specified `entities`. Any optional extra arguments will be passed through to each system.

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
