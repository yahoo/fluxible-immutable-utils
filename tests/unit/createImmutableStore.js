/*
 * Copyright (c) 2015, Yahoo Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
/*globals describe,it,beforeEach*/
'use strict';

var expect = require('chai').expect;
var createImmutableStore = require('../../src/createImmutableStore');

describe('createImmutableStore', function () {
    var Store = createImmutableStore({
        storeName: 'ImmutableStore'
    });

    beforeEach(function () {
        this.store = new Store();
    });

    describe('#initialize', function () {
        it('defines a immutable _state', function () {
            expect(this.store._state.toJS()).to.deep.equal({});
        });
    });

    describe('#rehydrate', function () {
        it('sets the state', function () {
            var state = {list: [1, 2, 3], error: null};
            this.store.rehydrate(state);

            expect(this.store._state.toJS()).to.deep.equal(state);
        });
    });

    describe('#dehydrate', function () {
        it('gets the initial state', function () {
            expect(this.store.dehydrate()).to.deep.equal(this.store._state);
            expect(this.store.dehydrate().toJS()).to.deep.equal({});
        });

        it('gets the rehydrated state', function () {
            var state = {list: [1, 2, 3], error: null};
            this.store.rehydrate(state);

            expect(this.store.dehydrate()).to.deep.equal(this.store._state);
        });
    });

    describe('#setState', function () {
        it('updates the state and emits a "change" event', function (done) {
            this.store.on('change', function () {
                expect(this._state.toJS()).to.deep.equal({list: [1, 2, 3]});
                done();
            }.bind(this.store));

            this.store.setState(this.store._state.set('list', [1, 2, 3]));
        });

        it('updates the state and emit a custom event', function (done) {
            this.store.on('rename', function () {
                expect(this._state.toJS()).to.deep.equal({name: '_mo'});
                done();
            }.bind(this.store));

            this.store.setState(this.store._state.set('name', '_mo'), 'rename');
        });

        it('updates the state and passes a custom payload', function (done) {
            var payload = {name: '_mo', type: 'AnyPlayload'};

            this.store.on('rename', function (data) {
                expect(this._state.toJS()).to.deep.equal({name: '_mo'});
                expect(data).to.deep.equal(payload);
                done();
            }.bind(this.store));

            this.store.setState(this.store._state.set('name', '_mo'), 'rename', payload);
        });

        it('only emits the chage if there are changes', function (done) {
            var count = 0;

            this.store.emit = function () {
                count++;
            };

            this.store.setState(this.store._state.mergeDeep({list: [1, 2, 3]}));
            this.store.setState(this.store._state.mergeDeep({list: [1, 2, 3]}));
            this.store.setState(this.store._state.mergeDeep({list: [1, 2, 3]}));

            expect(this.store._state.toJS()).to.deep.equal({list: [1, 2, 3]});
            expect(count).to.equal(1);
            done();
        });
    });

    describe('#mergeState', function () {
        beforeEach(function () {
            this.store.setState(this.store._state.set('list1', [1, 2, 3]));
        });

        it('replaces the list with a new list', function (done) {
            this.store.on('change', function () {
                expect(this._state.toJS()).to.deep.equal({
                    list1: [4]
                });
                done();
            }.bind(this.store));

            this.store.mergeState({'list1': [4]});
        });

        it('merges the state and emits a "change" event', function (done) {
            this.store.on('change', function () {
                expect(this._state.toJS()).to.deep.equal({
                    list1: [1, 2, 3],
                    list2: [4, 5, 6]
                });
                done();
            }.bind(this.store));

            this.store.mergeState({'list2': [4, 5, 6]});
        });

        it('merges the state and emit a custom event', function (done) {
            this.store.on('custom', function () {
                expect(this._state.toJS()).to.deep.equal({
                    list1: [1, 2, 3],
                    list2: [4, 5, 6]
                });
                done();
            }.bind(this.store));

            this.store.mergeState({'list2': [4, 5, 6]}, 'custom');
        });

        it('merges the state and passes a custom payload', function (done) {
            var payload = {name: '_mo', type: 'AnyPlayload'};

            this.store.on('change', function (data) {
                expect(this._state.toJS()).to.deep.equal({
                    list1: [1, 2, 3],
                    list2: [4, 5, 6]
                });
                expect(data).to.deep.equal(payload);
                done();
            }.bind(this.store));

            this.store.mergeState({'list2': [4, 5, 6]}, 'change', payload);
        });

        it('only emits the change if there the stateFragment is different', function (done) {
            var count = 0;

            this.store.emit = function () {
                count++;
            };

            this.store.mergeState({list2: [4, 5, 6]});
            this.store.mergeState({list2: [4, 5, 6]});
            this.store.mergeState({list2: [4, 5, 6]});

            expect(this.store._state.toJS()).to.deep.equal({
                list1: [1, 2, 3],
                list2: [4, 5, 6]
            });
            expect(count).to.equal(1);
            done();
        });
    });
});
