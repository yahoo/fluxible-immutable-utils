/*globals describe, it, beforeEach, afterEach */

'use strict';
var Immutable = require('immutable');
var React = require('react');
var createImmutableContainer = require('../../lib/createImmutableContainer');
var createReactClass = require('create-react-class');
var createStore = require('fluxible/addons/createStore');
var expect = require('chai').expect;
var filterInvalidDOMProps = require('filter-invalid-dom-props').default
var jsx = require('jsx-test');
var sinon = require('sinon');

describe('createImmutableContainer', function () {
    var DummyComponent = createReactClass({
        displayName: 'Dummy',

        render: function () {
            return React.createElement('div', filterInvalidDOMProps(this.props));
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
                DummyStore: function () { }
            }
        });

        expect(Component.displayName).to.equal('storeConnector(Dummy:Immutable)');
    });

    describe('#componentWillMount', function () {
        var Component;
        beforeEach(function () {
            Component = createImmutableContainer(DummyComponent, {
                ignore: ['data-items']
            });
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

        it('raises a warning for each non-immutable object', function () {
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

        it('should return true if any prop changes', function () {
            expect(this.component.shouldComponentUpdate({
                name: 'Frodo',
                map: someMap
            })).to.equal(true);
        });

        it('should return true if any prop is removed', function () {
            expect(this.component.shouldComponentUpdate({
                name: 'Bilbo'
            })).to.equal(true);
        });

        it('should return true if a new prop is passed', function () {
            expect(this.component.shouldComponentUpdate({
                name: 'Bilbo',
                map: someMap,
                n: 1
            })).to.equal(true);
        });
    });
});
