/*
 * Copyright (c) 2015, Yahoo Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var Immutable = require('immutable');
var isImmutable = Immutable.Iterable.isIterable;
var isReactElement = require('react/addons').isValidElement;
var GET_STATE_FUNCTION = 'getStateOnChange';
var utils = require('../internals/utils');

var IGNORE_IMMUTABLE_CHECK = 'ignoreImmutableCheck';
var IGNORE_EQUALITY_CHECK_FLAG = 'SKIP_SHOULD_UPDATE';

/**
 * Make sure an item is not a non immutable object.  The only exceptions are valid
 * react elements and objects specifically set to be ignored.
 * @param  {String}  key  The item to test's key
 * @param  {Any}  item  The item to test
 * @param  {Object}  component  The component
 * @return {Boolean}    True if non-immutable object, else false.
 */
function checkNonImmutableObject(key, item, component) {
    if (item
        && typeof item === 'object'
        && !isReactElement(item)
        && !isImmutable(item)
    ) {
        console.warn('WARN: component: ' + component.constructor.displayName
            + ' received non-immutable object: ' + key);
    }
}

/**
 * Check that all an objects fields are either primitives or immutable objects.
 * @param  {Object} object    The object to check
 * @param  {Object} component The component being checked
 * @param  {Object}  ignoreImmutableCheckKeys  Objects to skip a check for
 * @return {Undefined} none
 */
function checkObjectProperties(object, component, ignoreImmutableCheckKeys) {
    if (component.ignoreAllWarnings || !object || typeof object !== 'object') {
        return;
    }
    var ignoreImmutableCheck;
    Object.keys(object).forEach(function objectIterator(key) {
        ignoreImmutableCheck = ignoreImmutableCheckKeys[key];
        if (!ignoreImmutableCheck) {
            checkNonImmutableObject(key, object[key], component);
        }
    });
}

/**
 * Tests whether the two objects are shallowly equivalent using the Immutable.is method.
 * If we pass in two objects that have properties that are vanilla (not Immutable) objects,
 * this method will always return false, therefore make sure you are passing in immutable
 * objects to your props.
 * @param  {Object} item1 The first object to compare
 * @param  {Object} item2 The second object to compare
 * @param  {Object} component The component being examined
 * @param  {Object}  ignoreImmutableCheckKeys  Objects to skip when checking if immutable
 * @return {Boolean}      True if the objects are shallowly equavalent, else false.
 */
function shallowEqualsImmutable(item1, item2, component, ignoreImmutableCheckKeys) {
    if (item1 === item2) {
        return true;
    }
    if (!item1 || !item2) {
        return false;
    }

    var i;
    var key;
    var ignoreImmutableCheck;
    var ignoreAllWarnings = component.ignoreAllWarnings;
    var item1Keys = Object.keys(item1);
    var item2Keys = Object.keys(item2);
    var item1Prop;
    var item2Prop;

    // Different key set length, no need to proceed..check it here because we still
    // want to check all of item2's objects to see if any are non-immutable.
    if (item1Keys.length !== item2Keys.length) {
        return false;
    }
    // check item2keys so that we can also check for any non-immutable objects
    for (i = 0; i < item2Keys.length; i++) {
        key = item2Keys[i];
        ignoreImmutableCheck = ignoreImmutableCheckKeys[key];
        item2Prop = item2[key];
        item1Prop = item1[key];

        if (!ignoreAllWarnings && !ignoreImmutableCheck) {
            checkNonImmutableObject(key, item2Prop, component);
        }
        if (ignoreImmutableCheck !== IGNORE_EQUALITY_CHECK_FLAG
                && (!item1.hasOwnProperty(key) || item1Prop !== item2Prop)) {
            return false;
        }
    }

    return true;
}

/**
 * Merge either an already defined object or a constructor object over the default
 * values.  This function is used to create the ignoreImmutableCheck object
 * which has a 'props' and 'state' key.
 * @param  {Object} defaultObject   And object with default values.
 * @param  {Object} config     A config used by the mixin.
 * @param  {String} objectName The name/key of the object we are creating.
 * @param  {Object} component  The component this object is being attached to.
 * @return {Object}            The newly created object.
 */
function mergeDefaultValues(defaultObject, config, objectName, component) {
    var objectToCreate = component[objectName]
        || component.constructor[objectName]
        || config[objectName]
        || {};
    // merge any custom configs over defaults
    objectToCreate.props = utils.merge(defaultObject.props, objectToCreate.props);
    objectToCreate.state = utils.merge(defaultObject.state, objectToCreate.state);

    // assign any values that are for both props and state.
    Object.keys(objectToCreate).forEach(function keyIterator(key) {
        if (key !== 'props' && key !== 'state') {
            var val = objectToCreate[key];
            objectToCreate.props[key] = val;
            objectToCreate.state[key] = val;
        }
    });
    return objectToCreate;
}

var defaults = {
    /**
     * Get default ignoreImmutableCheck objects. This is not a hardcoded object
     * since it might be mutable
     * @return {Object} by default avoid props.children
     */
    getIgnoreImmutableCheck: function () {
        return {
            props: {
                // Always ignore children props since it's special
                children: true
            }
        };
    },

    /**
     * Used as the default shouldComponentUpdate function.  Checks whether the props/state of the
     * component has actually changed so that we know whether or not to run the render() method.
     * Since all state/props are immutable, we can use a simple reference check in the majority of cases.
     * @method shouldUpdate
     * @param  {Object} nextProps The new props object for the component.
     * @param  {Object} nextState The new state object for the component.
     * @return {Boolean}           True if the component should run render(), else false.
     */
    shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
        var ignoreImmutableCheck = this.ignoreImmutableCheck;
        var propsEqual = shallowEqualsImmutable(this.props, nextProps, this, ignoreImmutableCheck.props);
        var stateEqual = shallowEqualsImmutable(this.state, nextState, this, ignoreImmutableCheck.state);
        return !(stateEqual && propsEqual);
    },

    /**
     * A default onChange function that sets the the components state from the getStateOnChange
     * method.  This is only set if a component does not implement its own onChange function.
     * @method  defaultOnChange
     * @return {undefined} Does not return anything
     */
    onChange: function onChange() {
        if (this[GET_STATE_FUNCTION]) {
            this.setState(this[GET_STATE_FUNCTION].apply(this, arguments));
        }
    }
};

/**
 * React mixin for making components state/props immutable using the immutable.js library.  This
 * mixin ensures that the state and props of the component always contain immutable objects, allowing
 * us to implement a fast version of shouldComponentUpdate (reducing render calls).  The mixin
 * expects that the component uses the method 'getStateOnChange' instead of 'getInitialState'
 * in order to ensure that state is an immutable object.  Additionally, this component overrides
 * the 'setState' method so that it works correctly with an immutable state.
 * @class ImmutableMixin
 */

/**
 * A constructor function for the ComponentMixin that takes an optional config.
 * The config can specify values for 'ignoreImmutableCheck' and 'ignoreAllWarnings'.
 * @param  {Object} config An optional config used by the mixin.
 * @return {Object}        The mixin object
 */
module.exports = function (config) {
    config = config || {};
    return {
        componentWillMount: function () {
            this.ignoreImmutableCheck = mergeDefaultValues(
                defaults.getIgnoreImmutableCheck(), config, IGNORE_IMMUTABLE_CHECK, this);
            this.ignoreAllWarnings = this.ignoreAllWarnings
                || this.constructor.ignoreAllWarnings
                || config.ignoreAllWarnings
                || false;

            // Set default methods if the there is no override
            this.onChange = this.onChange || defaults.onChange.bind(this);
            this.shouldComponentUpdate = this.shouldComponentUpdate || defaults.shouldComponentUpdate.bind(this);
            // Checks the props and state to raise warnings
            checkObjectProperties(this.props, this, this.ignoreImmutableCheck.props);
            checkObjectProperties(this.state, this, this.ignoreImmutableCheck.state);
        },

        getInitialState: function () {
            return this[GET_STATE_FUNCTION] ? this[GET_STATE_FUNCTION]() : {};
        }
    };
};
