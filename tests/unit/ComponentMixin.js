/*globals describe,it,beforeEach*/

'use strict';

var jsx = require('jsx-test');
var expect = require('chai').expect;
var React = require('react');
var Immutable = require('immutable');
var ImmutableMixin = require('../../src/ComponentMixin');

describe('ImmutableMixin component functions', function () {
    describe('#getStateOnChange', function () {
        it('should merge the getInitialState with getStateOnChange', function () {
            var Component = React.createClass({
                mixins: [ImmutableMixin],
                getStateOnChange: function () {
                    return {foo: 'bar'};
                },
                getInitialState: function () {
                    return {bar: 'foo'};
                },
                render: function () {
                    return null;
                }
            });

            var component = jsx.renderComponent(Component, {});

            expect(component.state).to.deep.equal({
                bar: 'foo',
                foo: 'bar'
            });
        });

        it('should call getStateOnChange to initialize state', function (done) {
            var Component = React.createClass({
                mixins: [ImmutableMixin],
                getStateOnChange: function () {
                    done();
                    return {};
                },
                render: function () {
                    return null;
                }
            });

            jsx.renderComponent(Component, {});
        });

        it('shouldn\'t crash if getStateOnChange is not there', function () {
            var Component = React.createClass({
                mixins: [ImmutableMixin],
                render: function () {
                    return null;
                }
            });
            var component = jsx.renderComponent(Component, {});

            // This shouldn't throw
            component.onChange({foo: 'bar'});
        });

        it('should pass onChange arguments to getStateOnChange', function () {
            var Component = React.createClass({
                mixins: [ImmutableMixin],
                getStateOnChange: function (data) {
                    return data || {};
                },
                render: function () {
                    return null;
                }
            });

            var component = jsx.renderComponent(Component, {});
            component.onChange({foo: 'bar'});
            expect(component.state).to.deep.equal({foo: 'bar'});
        });
    });

    describe('#shouldComponentUpdate', function () {
        var component;
        var props;
        var state;

        beforeEach(function () {
            props = {foo: 'bar', list: Immutable.fromJS(['baz', 'foo'])};
            state = {list: Immutable.fromJS(['baz', 'foo'])};

            var Component = React.createClass({
                mixins: [ImmutableMixin],
                getStateOnChange: function () {
                    return state;
                },
                render: function () {
                    return null;
                }
            });

            component = jsx.renderComponent(Component, props);
        });

        function assertComponentUpdate(newProps, newState, expected) {
            expect(
                component.shouldComponentUpdate(newProps, newState)
            ).to.equal(expected);
        }

        it('should return false if props/state are equal', function () {
            assertComponentUpdate(props, state, false);
            assertComponentUpdate({foo: 'bar', list: props.list}, state, false);
            assertComponentUpdate(props, {list: state.list}, false);
        });

        it('should return true if a current prop value is changed', function () {
            assertComponentUpdate({foo: 'fubar', list: props.list}, state, true);
            assertComponentUpdate({foo: 'bar', list: state.list}, state, true);
            assertComponentUpdate({}, state, true);
        });

        it('should return true if a new prop value is added', function () {
            props.test = 'baz';
            assertComponentUpdate(props, state, true);
        });

        it('should return true if state is changed', function () {
            assertComponentUpdate(props, {list: props.list}, true);
            assertComponentUpdate(props, {foo: 'bar', list: state.list}, true);
        });
    });
});
