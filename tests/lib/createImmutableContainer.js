/*globals describe, it, beforeEach, afterEach */

'use strict';

var jsx = require('jsx-test');
var expect = require('chai').expect;
var Immutable = require('immutable');
var React = require('react');
var sinon = require('sinon');
var createImmutableContainer = require('../../lib/createImmutableContainer');
var createStore = require('fluxible/addons/createStore');

describe('createImmutableMixin', function () {
    var DummyComponent = React.createClass({
        displayName: 'Dummy',

        render: function () {
            return React.createElement('div', this.props);
        }
    });

    var DummyStore = createStore({
        storeName: 'DummyStore'
    });

    beforeEach(function () {
        sinon.spy(console, 'warn');
    });

    afterEach(function () {
        console.warn.restore();
    });

    it('wraps the component without the store connector', function () {
        var Component = createImmutableContainer(DummyComponent);

        expect(Component.displayName).to.equal('Dummy:Immutable');
    });

    it('wraps the component with the store connector', function () {
        var Component = createImmutableContainer(DummyComponent, {
            stores: [DummyStore],
            getStateFromStores: {
                DummyStore: function (store) { }
            }
        });

        expect(Component.displayName).to.equal('Dummy:ImmutableStoreConnector');
    });

    describe('#componentWillMount', function () {
        var Component = createImmutableContainer(DummyComponent, {
            ignore: ['data-items']
        });

        it('raise warnings if non immutable props are passed', function () {
            jsx.renderComponent(Component, {stuff: [1, 2, 3]});

            expect(
                console.warn.calledWith('Component "Dummy:Immutable" received non-immutable object for "stuff"')
            ).to.equal(true);
        });

        it('bypasses certain fields if they are ignored', function () {
            jsx.renderComponent(Component, {'data-items': [1, 2, 3]});
            expect(console.warn.callCount).to.equal(0);
        });

        it('raises a warning for each non-imutable object', function () {
            jsx.renderComponent(Component, {
                items: [1, 2, 3],
                stuff: {},
                map: Immutable.Map(),
                number: 1,
                name: 'something'
            });
            expect(console.warn.callCount).to.equal(2);
        });

        it('should never warn if ignoreAllWarnings is true', function () {
            var Component2 = createImmutableContainer(DummyComponent, {
                ignoreWarnings: true
            });

            jsx.renderComponent(Component2, {
                items: [1, 2, 3],
                nonImmutable: {}
            });

            expect(console.warn.callCount).to.equal(0);
        });
    });

    describe('#componentWillUpdate', function () {
        var Component = createImmutableContainer(DummyComponent);
        var component = jsx.renderComponent(Component, {
            items: [1, 2, 3],
            stuff: {},
            map: Immutable.Map(),
            number: 1,
            name: 'something'
        });

        it('raises a warning for each non-imutable object', function () {
            component.componentWillUpdate();
            expect(console.warn.callCount).to.equal(2);
        });
    });

    describe('#shouldComponentUpdate', function () {
        var someMap = Immutable.Map();
        var Component = createImmutableContainer(DummyComponent);

        beforeEach(function () {
            this.component = jsx.renderComponent(Component, {
                name: 'Bilbo',
                map: someMap
            });
        });

        it('should return false if props are equal', function () {
            expect(this.component.shouldComponentUpdate({
                name: 'Bilbo',
                map: someMap
            })).to.equal(false);
        });

        it('should return true if props change', function () {
            expect(this.component.shouldComponentUpdate({
                name: 'Frodo',
                map: someMap
            })).to.equal(true);

            expect(this.component.shouldComponentUpdate({
                name: 'Bilbo'
            })).to.equal(true);
        });
    });
});
