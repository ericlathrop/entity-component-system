# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [4.0.5] - 2017-02-28
### Fixed
- EntityPool.removeComponent() now fires "remove" callback before resetting the
  removed component.

## [4.0.4] - 2016-08-14
### Fixed
- Prevent entity from being in search multiple times when calling
  EntityPool.setComponent() with a primitive value

## [4.0.3] - 2016-08-14
### Fixed
- More specific error message to aid in debugging

## [4.0.2] - 2016-08-14
### Fixed
- Change from NoSuchComponentPoolException to Error so stack traces work

## [4.0.1] - 2016-08-14
### Fixed
- NoSuchComponentPoolException is now a proper Error

## [4.0.0] - 2016-08-14
### Added
- `EntityPool.registerComponent` registers a component factory, enabling object
  pooling.
- `EntityPool.addComponent` adds a component from the object pool to an entity.
  Replaces `set`.
### Changed
- `EntityPool.get` was renamed to `getComponent`
- `EntityPool.remove` was renamed to `removeComponent`
- `EntityPool.set` was renamed to `setComponent`, and should now only be called with primitive values. This makes it harder to break the object pooling behavior, requiring you to use `get` to manipulate components without accidentally allocating new ones.


## [3.0.0] - 2016-06-04
### Changed
- Change dynamic arguments in `EntityComponentSystem.run()` to fixed arguments for dramatic speed improvement

## [2.2.0] - 2015-12-19
### Added
- Add timing APIs so you can see which system is slow

## [2.1.0] - 2015-12-17
### Added
- The `onRemoveComponent` callback is now invoked with the old component value that was removed

## [2.0.1] - 2015-12-17
### Fixed
- Bumped version number because I accidentally published a beta version as 2.0.0

## [2.0.0] - 2015-12-17
### Added
- `EntityPool`
### Removed
- `run()` no longer returns timings of systems

## [1.2.2] - 2015-12-08
### Changed
- Adopted a [code of conduct](CODE_OF_CONDUCT.md)
- Switch from jshint to eslint
- Update development dependencies
