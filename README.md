#fluxible-immutable-utils

[![npm version](https://badge.fury.io/js/fluxible-immutable-utils.svg)](http://badge.fury.io/js/fluxible-immutable-utils)
[![Build Status](https://travis-ci.org/yahoo/fluxible-immutable-utils.svg?branch=master)](https://travis-ci.org/yahoo/fluxible-immutable-utils)
[![Dependency Status](https://david-dm.org/yahoo/fluxible-immutable-utils.svg)](https://david-dm.org/yahoo/fluxible-immutable-utils)
[![devDependency Status](https://david-dm.org/yahoo/fluxible-immutable-utils/dev-status.svg)](https://david-dm.org/yahoo/fluxible-immutable-utils#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/yahoo/fluxible-immutable-utils/badge.svg)](https://coveralls.io/r/yahoo/fluxible-immutable-utils)

This package provides easy to use mixins/utils for both fluxible stores and react components.

### ComponentMixin
A mixin that provides convenience methods for using Immutable.js inside of react components.  Note that this mixin uses the initializeComponent method for setup, and any components that use this mixin should define a 'getStateOnChange' function for generating component state (see below).

This mixin has several purposes:
-  Checks that the objects in state/props of each component are an Immutable Map.
-  Implements a default shouldComponentUpdate method.
-  Provides a convenience method for dealing with state changes/component 
initialization.

#### Immutalizing State
The mixin uses the initalizeState method to set up all default functions, and checks for a method named 'getStateOnChange' in order to get the initial state object.  If used with fluxible's FluxibleMixin, getStateOnChange will also be called whenever a store is updated (if onChange is not defined).  This allows a reduction in boilerplate by not having to define separate functions for app initialization/store updates (since components should handle state the same in either case).

The mixin expects props/state to remain immutable throughout a component's lifecycle and only shallowly examines the props object when checking for data equality.  Thus it is HIGHLY recommended to pass in immutable objects as props/state to a component using this mixin (the mixin will warn when not doing so).  You may configure which objects to check by setting the ignoreImmutableObjects static property (example below).

#### shouldComponentUpdate
The immutable mixin implements a version of shouldComponentUpdate to prevent needless re-rendering of components when the props/state haven't changed (by checking if the new props/state have been changed from the old props/state).  If a component provides its own shouldComponentUpdate method, then the default implementation will not be used.

#### getStateOnChange
Since ImmutableMixin must use the initializeComponent method for setting up default methods, it cannot be used by the components.  Instead, ImmutableMixin will call the 'getStateOnChange' method in getInitialState.  This method will also be called if used with the FluxibleMixin on store changes (again, only if onChange is not defined) which helps to reduce boilerplate within components.

**API**

#### shouldUpdate (nextProps, nextState)

Utility method that is set as the `shouldComponentUpdate` method in a component unless
it is already defined.  Checks whether the props/state of the component has changed so that we know whether to render or not.

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
    statics: {
        ignoreImmutableCheck:  {
            someKey: true,
            anotherKey: true
        }
    },
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

### createImmutableStore util
The createImmutableStore util creates a store that handles all dehyrdating/rehydrating and setting of state.  This util will ensure that your store's state is always immutable, and will also check for state equality before emitting a change event.
