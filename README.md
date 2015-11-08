# fluxible-immutable-utils

[![npm version](https://badge.fury.io/js/fluxible-immutable-utils.svg)](http://badge.fury.io/js/fluxible-immutable-utils)
[![Build Status](https://travis-ci.org/yahoo/fluxible-immutable-utils.svg?branch=master)](https://travis-ci.org/yahoo/fluxible-immutable-utils)
[![Dependency Status](https://david-dm.org/yahoo/fluxible-immutable-utils.svg)](https://david-dm.org/yahoo/fluxible-immutable-utils)
[![devDependency Status](https://david-dm.org/yahoo/fluxible-immutable-utils/dev-status.svg)](https://david-dm.org/yahoo/fluxible-immutable-utils#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/yahoo/fluxible-immutable-utils/badge.svg)](https://coveralls.io/r/yahoo/fluxible-immutable-utils)

This package provides easy to use mixins/utils for both fluxible stores and react components.

```bash
$ npm install --save fluxible-immutable-utils
```

## `createImmutableContainer`

This method creates an immutable higher order component.

```js

var MyComponent = React.createClass({
    displayName: 'MyComponent',

    ...
});

var createImmutableContainer = require('fluxible-immutable-utils').createImmutableContainer;

// Wraps your component in an immutable container.
// Prevents renders when props are the same
module.exports = createImmutableContainer(MyComponent);

// Wraps your component in an immutable container that listens to stores
// and pass its state down as props
module.exports = createImmutableContainer(MyComponent, {
    stores: [SomeStore],
    getStateFromStores: {
        SomeStore: function (store) {
            return {
                someState: store.state;
            }
        }
    }
});
```

## `ComponentMixin`
A mixin that provides convenience methods for using Immutable.js inside of react components.  Note that this mixin uses the initializeComponent method for setup, and any components that use this mixin should define a 'getStateOnChange' function for generating component state (see below).

This mixin has several purposes:
-  Checks that the objects in state/props of each component are an Immutable Map.
-  Implements a default shouldComponentUpdate method.
-  Provides a convenience method for dealing with state changes/component
initialization.

### Immutalizing State
The mixin uses the initalizeState method to set up all default functions, and checks for a method named 'getStateOnChange' in order to get the initial state object.  If used with fluxible's FluxibleMixin, getStateOnChange will also be called whenever a store is updated (if onChange is not defined).  This allows a reduction in boilerplate by not having to define separate functions for app initialization/store updates (since components should handle state the same in either case).

The mixin expects props/state to remain immutable throughout a component's lifecycle and only shallowly examines the props object when checking for data equality.  Thus it is HIGHLY recommended to pass in immutable objects as props/state to a component using this mixin (the mixin will warn when not doing so).  You may configure which objects to check by setting the ignoreImmutableObjects static property (example below).

### shouldComponentUpdate
The immutable mixin implements a version of shouldComponentUpdate to prevent needless re-rendering of components when the props/state haven't changed (by checking if the new props/state have been changed from the old props/state).  If a component provides its own shouldComponentUpdate method, then the default implementation will not be used.

### getStateOnChange
Since ImmutableMixin must use the initializeComponent method for setting up default methods, it cannot be used by the components.  Instead, ImmutableMixin will call the 'getStateOnChange' method in getInitialState.  This method will also be called if used with the FluxibleMixin on store changes (again, only if onChange is not defined) which helps to reduce boilerplate within components.

### API

#### shouldUpdate (nextProps, nextState)

Utility method that is set as the `shouldComponentUpdate` method in a component unless it is already defined.  Checks whether the props/state of the component has changed so that we know whether to render or not.

1. {Object} The next props object
2. {Object} The next state object

#### defaultOnChange ()

Utility method that is set as the `onChange` method.  A default onChange function that sets the the components state from the getStateOnChange method.  This is only set if a component does not implement its own onChange function.  Typically used with the fluxibleMixin.

#### getInitialState ()

 Called internally by React.  Sets up a few of the immutable methods and then returns the state of the component, after ensuring it is immutable.  If getStateOnChange() is not defined, then just sets the state to null.

**Example**

```jsx
// MyReactComponent.jsx

var ImmutableMixin = require('fluxible-immutable-utils').ComponentMixin;

module.exports = React.createClass({
    displayName: 'MyReactComponent',
    mixins: [ImmutableMixin],
    getStateOnChange: function () {
        if (!this.state) {
            //initialize here if needed
        }
        return {
            someStateProperty: 'foo'
        };
    },

    render: function () {
        return <span>My React Component</span>;
    }
});

var myObject = {
    foo: 'bar'
};
<MyReactComponent
    someKey={myObject} // fine, because we set this key to be ignored
    aNonImmutableObject={myObject} // will cause a console.warn statement because we are passing a non-immutable object
/>
```

#### Configuring the Mixin
If you are using third party libraries/have a special case where you don't want the mixin to consider some of the keys of props/state, you have two options.  First, you can set the ignoreImmutableCheck object to skip the check for immutability for any keys you decide.  Second, if you want the mixin to also ignore a key when checking for data equality in props/state, you can set the key value to the flag `SKIP_SHOULD_UPDATE`.  You must set these values inside a component's `statics` field (or in a config, see below), and they must be set seperately for props/state.  You can also turn off all warnings by settings the ignoreAllWarnings flag.

**Example**

```jsx
// MyReactComponent.jsx

var ImmutableMixin = require('fluxible-immutable-utils').ComponentMixin;

module.exports = React.createClass({
    displayName: 'MyReactComponent',
    mixins: [ImmutableMixin],
    statics: {
        ignoreAllWarnings: (process.env.NODE_ENV !== 'dev') // turn off all warnings when not in dev mode
        ignoreImmutableCheck:  {
            props: {
                someKey: true // don't check someKey for immutablility in props
            },
            state: {
                anotherKey: 'SKIP_SHOULD_UPDATE' // don't check anotherKey for immutablility in props, AND don't check its value is shouldComponentUpdate
            }

        }
    },

    ...rest of component follows...
});
```

If you want to just pass around a common config, then use:
```jsx
var ImmutableMixin = require('fluxible-immutable-utils').createComponentMixin(myConfig);
```
Where myConfig has the same structure as the statics above.

## `ImmutableStore`

A class to inherit similar to the fluxible addon `BaseStore`. Internally it inherits [`'fluxible/addons/BaseStore`](https://github.com/yahoo/fluxible/blob/master/docs/api/addons/BaseStore.md).

The main use case for this method is to reduce boilerplate when implementing immutable [`fluxible`](fluxible.io) stores.

The helper adds a new property and some helper methods to the created store
* `_state` {[Map](http://facebook.github.io/immutable-js/docs/#/Map)} - The root `Immutable` where all data in the store will be saved.

* `setState(newState, [event], [payload])` {Function} - This method replaces `this._state` with `newState` (unless they were the same) and then calls `this.emit(event, payload)`.
    * If `event` is *falsy* it will call `this.emitChange(payload)`
    * The method also ensures that `_state` remains immutable by auto-converting `newState` to an immutable object.

* `mergeState(newState, [event], [payload])` {Function} - This method does a shallow merge with `this._state` and then calls `this.emit(event, payload)`.
    * If `event` is *falsy* it will call `this.emitChange(payload)`
    * The method also ensures that `_state` remains immutable by auto-converting `newState` to an immutable object.

* `getState()` {Function} - This method returns the `this._state`.

* `get(key)` {Function} - Get a value by key from the store.

and creates defaults for the following [fluxible store](http://fluxible.io/api/stores.html) methods
* [`constructor()`](http://fluxible.io/api/stores.html#constructor) - The default implementations creates a `_state` property on the store and initializes it to [`Immutable.Map`](http://facebook.github.io/immutable-js/docs/#/Map)

* [`rehydrate(state)`](http://fluxible.io/api/stores.html#rehydrate-state-) - The default implementation hydrates `_state`

* [`dehydrate()`](http://fluxible.io/api/stores.html#dehydrate-) - The default implementation simply returns `_state` which is `Immutable` (due to all `Immutable` objects implementing a [`toJSON`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON_behavior) function, `_state` can be directly passed to `JSON.stringify`)

**Note** that all defaults can still be overwritten when creating the store.

**Note 2** Avoid returning a `_state.toJS()` from a store when using it with the createImmutableContainer since an ImmutableContainer expects and uses the Immutable data to do comparisons when deciding to re-render.

### Example Usage

```js
// FooStore.js

import {ImmutableStore} from 'fluxible-immutable-utils';

class FooStore extends ImmutableStore {
    // public accessors
    getBar: function (id) {
        return this._state.get('bar');
    }

    // private mutators, these should only be called via dispatch
    _onNewFoo(data) {
        // data = { foo: 'Hello', bar: 'World' }            
        this.setState(data);        
    }

    _onNewBar(bar) {
        // This will just update bar and leave foo with the same state
        this.mergeState({ bar: bar });
    }
}

FooStore.storeName = 'FooStore';

FooStore.handlers = {
    NEW_FOO: '_onNewFooBar',
    NEW_FOOS: '_onNewBar'  
};

export default FooStore;
```