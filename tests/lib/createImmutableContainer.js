/*globals describe, xdescribe, it, beforeEach, afterEach */

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

    xdescribe('#shouldComponentUpdate', function () {
//        var component;
//        var props;
//        var state;
//
//        beforeEach(function () {
//            props = {foo: 'bar', list: Immutable.fromJS(['baz', 'foo'])};
//            state = {list: Immutable.fromJS(['baz', 'foo'])};
//
//            var Component = React.createClass({
//                mixins: [ImmutableMixin],
//                getStateOnChange: function () {
//                    return state;
//                },
//                render: function () {
//                    return null;
//                }
//            });
//
//            component = jsx.renderComponent(Component, props);
//        });
//
//        function assertComponentUpdate(newProps, newState, expected) {
//            expect(
//                component.shouldComponentUpdate(newProps, newState)
//            ).to.equal(expected);
//        }
//
//        it('should return false if props/state are equal', function () {
//            assertComponentUpdate(props, state, false);
//            assertComponentUpdate({foo: 'bar', list: props.list}, state, false);
//            assertComponentUpdate(props, {list: state.list}, false);
//        });
//
//        it('should return true if a current prop value is changed', function () {
//            assertComponentUpdate({foo: 'fubar', list: props.list}, state, true);
//            assertComponentUpdate({foo: 'bar', list: state.list}, state, true);
//            assertComponentUpdate({}, state, true);
//        });
//
//        it('should return true if a new prop value is added', function () {
//            assertComponentUpdate(props, state, false);
//            props.test = 'baz';
//            assertComponentUpdate(props, state, true);
//        });
//
//        it('should return true if a new prop value is removed', function () {
//            assertComponentUpdate(props, state, false);
//            delete props.foo;
//            assertComponentUpdate(props, state, true);
//        });
//
//        it('should return true if state is changed', function () {
//            assertComponentUpdate(props, {list: props.list}, true);
//            assertComponentUpdate(props, {foo: 'bar', list: state.list}, true);
//        });
//
//        it('should return true if state is null', function () {
//            assertComponentUpdate(props, null, true);
//            assertComponentUpdate(props, {foo: 'bar', list: state.list}, true);
//        });
//
//        it('allows the shouldComponentUpdate to be overridden', function () {
//            var Component = React.createClass({
//                mixins: [ImmutableMixin],
//                shouldComponentUpdate: function () {
//                    return 'override';
//                },
//                render: function () {
//                    return null;
//                }
//            });
//
//            component = jsx.renderComponent(Component, props);
//            assertComponentUpdate({}, {}, 'override');
//        });
    });
});
