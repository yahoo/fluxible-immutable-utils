/*
 * Copyright (c) 2015, Yahoo Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var createStore = require('fluxible/utils/createStore');
var Immutable = require('immutable');

function merge(dest, src) {
    Object.keys(src).forEach(function (prop) {
        dest[prop] = src[prop];
    });

    return dest;
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
 */
module.exports = function createImmutableStore(spec) {
    return createStore(merge({
        initialize: function initialize() {
            this._state = Immutable.Map();
        },

        rehydrate: function rehydrate(state) {
            this._state = Immutable.fromJS(state);
        },

        dehydrate: function dehydrate() {
            return this._state;
        },

        setState: function setState(newState, event, payload) {
            if (this._state === newState) {
                return false;
            }

            this._state = newState;
            if (event) {
                this.emit(event, payload);
            } else {
                this.emitChange(payload);
            }
            return true;
        },

        mergeState: function mergeState(stateFragment, event, payload) {
            return this.setState(
                this._state.merge(stateFragment),
                event,
                payload
            );
        }
    }, spec));
};
