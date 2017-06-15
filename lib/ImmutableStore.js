/*
 * Copyright (c) 2015, Yahoo Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var BaseStore = require('fluxible/addons/BaseStore');
var Immutable = require('immutable');
var inherits = require('inherits');

function ImmutableStore(dispatcher) {
    this._state = Immutable.Map();
    BaseStore.call(this, dispatcher);
};

inherits(ImmutableStore, BaseStore);

ImmutableStore.prototype.dehydrate = function() {
    return this._state;
}

ImmutableStore.prototype.get = function(key) {
    return Array.isArray(key) ? this._state.getIn(key) : this._state.get(key);
}

ImmutableStore.prototype.getState = function() {
    return this.dehydrate();
}

ImmutableStore.prototype.mergeState = function(stateFragment, event, payload) {
    return this.setState(
        this._state.merge(stateFragment),
        event,
        payload
    );
}

ImmutableStore.prototype.rehydrate = function(state) {
    this._state = Immutable.fromJS(state);
}

ImmutableStore.prototype.setState = function(newState, event, payload) {
    newState = Immutable.fromJS(newState);

    if (this._state.equals(newState)) {
        return false;
    }

    this._state = newState;

    if (event){
        this.emit(event, payload);
    }
    else {
        this.emitChange(payload);
    }

    return true;
}

module.exports = ImmutableStore;
