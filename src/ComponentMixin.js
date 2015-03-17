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
var SHOULD_COMPONENT_UPDATE_FUNCTION = 'shouldComponentUpdate';
var STORE_ON_CHANGE = 'onChange';

/**
 * Make sure an item is not a non immutable object.  The only exceptions are valid
 * react elements.
 * @param  {String}  key  The item to test's key
 * @param  {Any}  item  The item to test
 * @param  {Object}  component  The component
 * @param  {Object}  objectsToIgnore  Objects to skip a check for
 * @return {Boolean}    True if non-immutable object, else false.
 */
function checkNonImmutableObject(key, item, component, objectsToIgnore) {
    objectsToIgnore = objectsToIgnore || {};
    if (item
        && typeof item === 'object'
        && !isReactElement(item)
        && !isImmutable(item)
        && !objectsToIgnore[key]) {
        console.warn('WARN: component: ' + component.constructor.displayName
            + ' received non-immutable object: ' + key);
    }
}

/**
 * Check that all an objects fields are either primitives or immutable objects.
 * @param  {Object} object    The object to check
 * @param  {Object} component The component being checked
 * @param  {Object}  objectsToIgnore  Objects to skip a check for
 * @return {Undefined} none
 */
function checkObjectProperties(object, component, objectsToIgnore) {
    if (!object || typeof object !== 'object') {
        return;
    }
    Object.keys(object).forEach(function objectIterator(key) {
        checkNonImmutableObject(key, object[key], component, objectsToIgnore);
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
 * @param  {Object}  objectsToIgnore  Objects to skip a check for
 * @return {Boolean}      True if the objects are shallowly equavalent, else false.
 */
function shallowEqualsImmutable(item1, item2, component, objectsToIgnore) {
    if (item1 === item2) {
        return true;
    }
    // if either item was immutable it should have passed the previous check
    if (isImmutable(item1) || isImmutable(item2)) {
        return false;
    }
    var i;
    var key;
    var item1Keys = Object.keys(item1);
    for (i = 0; i < item1Keys.length; i++) {
        key = item1Keys[i];
        var item2Prop = item2[key];
        checkNonImmutableObject(key, item2Prop, component, objectsToIgnore);
        if (!item2.hasOwnProperty(key) || item1[key] !== item2Prop) {
            return false;
        }
    }
    // Test for item2's keys missing from item1.
    var item2Keys = Object.keys(item2);
    for (i = 0; i < item2Keys.length; i++) {
        key = item2Keys[i];
        if (!item1.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

/**
 * React mixin for making components state/props immutable using the immutable.js library.  This
 * mixin ensures that the state and props of the component always contain immutable objects, allowing
 * us to implement a fast version of shouldComponentUpdate (reducing render calls).  The mixin
 * expects that the component uses the method 'getStateOnChange' instead of 'getInitialState'
 * in order to ensure that state is an immutable object.  Additionally, this component overrides
 * the 'setState' method so that it works correctly with an immutable state.
 * @class ImmutableMixin
 */
module.exports = {

    /**
     * Used as the default shouldComponentUpdate function.  Checks whether the props/state of the
     * component has actually changed so that we know whether or not to run the render() method.
     * Since all state/props are immutable, we can use a simple reference check in the majority of cases.
     * @method shouldUpdate
     * @param  {Object} nextProps The new props object for the component.
     * @param  {Object} nextState The new state object for the component.
     * @return {Boolean}           True if the component should run render(), else false.
     */
    immutableShouldUpdate: function (nextProps, nextState) {
        var objectsToIgnore = this.objectsToIgnore;
        var propsEqual = shallowEqualsImmutable(this.props, nextProps, this, objectsToIgnore.props);
        var stateEqual = shallowEqualsImmutable(this.state, nextState, this, objectsToIgnore.state);
        return !(stateEqual && propsEqual);
    },

    /**
     * A default onChange function that sets the the components state from the getStateOnChange
     * method.  This is only set if a component does not implement its own onChange function.
     * @method  defaultOnChange
     * @return {undefined} Does not return anything
     */
    defaultOnChange: function () {
        this.setState(this[GET_STATE_FUNCTION].apply(this, arguments));
    },

    /**
     * Sets up a few of the immutable methods and then returns the state of the component,
     * after checking it has immutable props.  If shouldComponentUpdate() is not defined, then just
     * sets the state to null.
     * @method  getInitialState
     * @return {Object} The initial state of the component.
     */
    getInitialState: function () {
        var objectsToIgnore = this.constructor.ignoreImmutableCheck || {};
        this.objectsToIgnore = objectsToIgnore;
        checkObjectProperties(this.props, this, objectsToIgnore.props);
        if (!this[STORE_ON_CHANGE]) {
            this[STORE_ON_CHANGE] = this.defaultOnChange;
        }
        if (!this[SHOULD_COMPONENT_UPDATE_FUNCTION]) {
            this[SHOULD_COMPONENT_UPDATE_FUNCTION] = this.immutableShouldUpdate;
        }
        var getInitialState = this[GET_STATE_FUNCTION];
        if (getInitialState) {
            var state = getInitialState();
            checkObjectProperties(state, this, objectsToIgnore.state);
            return state;
        }
        return null;
    }
};
