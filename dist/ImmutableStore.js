/*
 * Copyright (c) 2015, Yahoo Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _fluxibleAddons = require('fluxible/addons');

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var ImmutableStore = (function (_BaseStore) {
    function ImmutableStore(dispatcher) {
        _classCallCheck(this, ImmutableStore);

        _get(Object.getPrototypeOf(ImmutableStore.prototype), 'constructor', this).call(this, dispatcher);
        this._state = _immutable2['default'].Map();
    }

    _inherits(ImmutableStore, _BaseStore);

    _createClass(ImmutableStore, [{
        key: 'dehydrate',
        value: function dehydrate() {
            return this._state;
        }
    }, {
        key: 'rehydrate',
        value: function rehydrate(state) {
            this._state = _immutable2['default'].fromJS(state);
        }
    }, {
        key: 'setState',
        value: function setState(newState, event, payload) {
            newState = _immutable2['default'].fromJS(newState);

            if (this._state.equals(newState)) {
                return false;
            }

            this._state = newState;
            event ? this.emit(event, payload) : this.emitChange(payload);
            return true;
        }
    }, {
        key: 'mergeState',
        value: function mergeState(stateFragment, event, payload) {
            return this.setState(this._state.merge(stateFragment), event, payload);
        }
    }, {
        key: 'getState',
        value: function getState() {
            return this.dehydrate();
        }
    }]);

    return ImmutableStore;
})(_fluxibleAddons.BaseStore);

exports['default'] = ImmutableStore;
module.exports = exports['default'];
//# sourceMappingURL=ImmutableStore.js.map
