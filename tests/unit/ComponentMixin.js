/*globals describe,it,beforeEach*/
'use strict';

var jsx = require('jsx-test');
var expect = require('chai').expect;
var React = require('react');
var Immutable = require('immutable');
var isImmutable = Immutable.Iterable.isIterable;
var ImmutableMixin = require('../../src/ComponentMixin');
var Component;

describe('ImmutableMixin component functions', function () {
    it('should call getStateOnChange to initialize state', function (done) {
        Component = React.createClass({
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
        Component = React.createClass({
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
        Component = React.createClass({
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

    describe('when rendered w/ props', function () {
        var component;
        var state;
        var props;

        beforeEach(function () {
            props = {foo: 'bar'};
            state = Immutable.fromJS({baz: 'foo'});

            Component = React.createClass({
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

        it('should return false in shouldComponentUpdate if props/state are equal', function () {
            expect(component.props.foo).to.equal('bar');
            expect(isImmutable(component.state)).to.equal(true);
            expect(component.shouldComponentUpdate(props, state)).to.equal(false);
        });
        it('should return true in shouldComponentUpdate if a current prop value is changed', function () {
            props.foo = 'baz';
            expect(component.props.foo).to.equal('bar');
            expect(component.shouldComponentUpdate(props, state)).to.equal(true);
        });
        it('should return true in shouldComponentUpdate if a new prop value is added', function () {
            props.test = 'baz';
            expect(component.props.foo).to.equal('bar');
            expect(component.shouldComponentUpdate(props, state)).to.equal(true);
        });
        it('should return true in shouldComponentUpdate if state is changed', function () {
            state = state.set('test', 'baz');
            expect(component.state.get('baz')).to.equal('foo');
            expect(component.shouldComponentUpdate(props, state)).to.equal(true);
        });
    });
});
