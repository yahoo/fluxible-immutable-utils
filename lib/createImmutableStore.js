/*
 * Copyright (c) 2015, Yahoo Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var Immutable = require('immutable');
var utils = require('./utils');
var createStore = require('fluxible/addons/createStore');

function initialize() {
    this._state = Immutable.Map();
}

function rehydrate(state) {
    this._state = Immutable.fromJS(state);
}

function dehydrate() {
    return this._state;
}

function setState(newState, event, payload) {
    newState = Immutable.fromJS(newState);

    if (this._state.equals(newState)) {
        return false;
    }

    this._state = newState;
    event ? this.emit(event, payload) : this.emitChange(payload);
    return true;
}

function mergeState(stateFragment, event, payload) {
    return this.setState(
        this._state.merge(stateFragment),
        event,
        payload
    );
}

/**
 * Helper for creating an immutable store class
 *
 * @method createStore
 * @param {Object} spec of the created Store class
 * @param {String} spec.storeName The name of the store
 * @param {Object} spec.handlers Hash of action name to method name of action handlers
 * @param {Function} [spec.initialize] Function called during construction for setting the default `_state` (optional).
 * @return {Store} Store class
 **/
module.exports = function createImmutableStore(spec) {
    return createStore(utils.merge({
        initialize: initialize,
        rehydrate: rehydrate,
        dehydrate: dehydrate,
        setState: setState,
        mergeState: mergeState
    }, spec));
};
