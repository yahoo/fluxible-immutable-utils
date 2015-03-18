/*
 * Copyright (c) 2015, Yahoo Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

function requireCreateStore() {
    try {
        return require('fluxible/addons/createStore');
    } catch(err) {
        return require('fluxible/utils/createStore');
    }
}

var createStore = requireCreateStore();
var Immutable = require('immutable');

function merge(dest, src) {
    Object.keys(src).forEach(function cb(prop) {
        dest[prop] = src[prop];
    });

    return dest;
}

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
    if (this._state === newState) {
        return false;
    }

    this._state = Immutable.fromJS(newState);
    if (event) {
        this.emit(event, payload);
    } else {
        this.emitChange(payload);
    }
    return true;
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
    return createStore(merge({
        initialize: initialize,
        rehydrate: rehydrate,
        dehydrate: dehydrate,
        setState: setState
    }, spec));
};
