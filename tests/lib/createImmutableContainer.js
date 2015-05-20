/*globals describe,it,beforeEach,afterEach*/

'use strict';

require('jsx-test');
var expect = require('chai').expect;
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
});
