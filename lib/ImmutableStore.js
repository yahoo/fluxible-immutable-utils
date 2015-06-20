// TODO: Change these to import syntax when available
var BaseStore = require('fluxible/addons').BaseStore;
var Immutable = require('immutable');

class ImmutableStore extends BaseStore {
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
       return this._state.toJS(); 
    }
}

export default ImmutableStore;