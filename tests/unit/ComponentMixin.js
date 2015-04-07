/*globals describe,it*/
'use strict';

var jsx = require('jsx-test');
var expect = require('chai').expect;
var React = require('react');
var Immutable = require('immutable');
var isImmutable = Immutable.Iterable.isIterable;
var ImmutableMixin = require('../../src/ComponentMixin');

describe('ImmutableMixin component functions', function () {
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

        var component = jsx.renderComponent(Component, {});
        expect(component).to.be.an('object');
    });
    it('shouldn\'t crash if getStateOnChange is not there', function () {
        var Component = React.createClass({
            mixins: [ImmutableMixin],
            render: function () {
                return null;
            }
        });
        var component = jsx.renderComponent(Component, {});
        expect(component).to.be.an('object');

        // This shouldn't throw
        component.onChange({foo: 'bar'});
    });
    it('should replace onChange with a function that sets state', function () {
        var Component = React.createClass({
            mixins: [ImmutableMixin],
            getStateOnChange: function (obj) {
                return obj || {};
            },
            render: function () {
                return null;
            }
        });

        var component = jsx.renderComponent(Component, {});
        component.onChange({foo: 'bar'});
        expect(component.state.foo).to.equal('bar');
    });
    it('should return false in shouldComponentUpdate if props/state are equal', function () {
        var props = {foo: 'bar'};
        var state = Immutable.fromJS({baz: 'foo'});
        var Component = React.createClass({
            mixins: [ImmutableMixin],
            getStateOnChange: function () {
                return state;
            },
            render: function () {
                return null;
            }
        });

        var component = jsx.renderComponent(Component, props);
        expect(component.props.foo).to.equal('bar');
        expect(isImmutable(component.state)).to.equal(true);
        expect(component.shouldComponentUpdate(props, state)).to.equal(false);
    });
    it('should return true in shouldComponentUpdate if a current prop value is changed', function () {
        var props = {foo: 'bar'};
        var state = Immutable.fromJS({baz: 'foo'});
        var Component = React.createClass({
            mixins: [ImmutableMixin],
            getStateOnChange: function () {
                return state;
            },
            render: function () {
                return null;
            }
        });

        var component = jsx.renderComponent(Component, props);
        props.foo = 'baz';
        expect(component.props.foo).to.equal('bar');
        expect(component.shouldComponentUpdate(props, state)).to.equal(true);
    });
    it('should return true in shouldComponentUpdate if a new prop value is added', function () {
        var props = {foo: 'bar'};
        var state = Immutable.fromJS({baz: 'foo'});
        var Component = React.createClass({
            mixins: [ImmutableMixin],
            getStateOnChange: function () {
                return state;
            },
            render: function () {
                return null;
            }
        });

        var component = jsx.renderComponent(Component, props);
        props.test = 'baz';
        expect(component.props.foo).to.equal('bar');
        expect(component.shouldComponentUpdate(props, state)).to.equal(true);
    });
    it('should return true in shouldComponentUpdate if state is changed', function () {
        var props = {foo: 'bar'};
        var state = Immutable.fromJS({baz: 'foo'});
        var Component = React.createClass({
            mixins: [ImmutableMixin],
            getStateOnChange: function () {
                return state;
            },
            render: function () {
                return null;
            }
        });

        var component = jsx.renderComponent(Component, props);
        state = state.set('test', 'baz');
        expect(component.state.get('baz')).to.equal('foo');
        expect(component.shouldComponentUpdate(props, state)).to.equal(true);
    });
});
