/*
 * Copyright (c) 2015, Yahoo Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import {BaseStore} from 'fluxible/addons';
import Immutable from 'immutable';

export default class ImmutableStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);    
        this._state = Immutable.Map();
    }

    dehydrate() {
        return this._state;
    }

    rehydrate(state) {
        this._state = Immutable.fromJS(state);
    }

    setState(newState, event, payload) {
        newState = Immutable.fromJS(newState);

        if (this._state.equals(newState)) {
            return false;
        }

        this._state = newState;
        event ? this.emit(event, payload) : this.emitChange(payload);
        return true;
    }

    mergeState(stateFragment, event, payload) {
        return this.setState(
            this._state.merge(stateFragment),
            event,
            payload
        );
    }

    getState() {
       return this.dehydrate(); 
    }
}
