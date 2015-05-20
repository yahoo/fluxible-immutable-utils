/*
 * Copyright (c) 2015, Yahoo Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

'use strict';

var React = require('react');
var connectToStores = require('fluxible/addons/connectToStores');

module.exports = function createImmutableContainer(Component, options) {
    options = options || {};
    var ignore = options.ignore || [];
    var getStateFromStores = options.getStateFromStores;
    var stores = options.stores || Object.keys(getStateFromStores || {});
    var componentName = Component.displayName || Component.name;

    var ImmutableComponent = React.createClass({
        displayName: componentName + ':Immutable',

        // probably we don't even need component will mount
        componentWillMount: function () {},

        // this guy care about props that is no need to state
        shouldComponentUpdate: function () {
            ignore;
        },

        render: function () {
            return React.createElement(Component, this.props);
        }
    });

    return stores.length ?
        connectToStores(ImmutableComponent, stores, getStateFromStores) :
        ImmutableComponent;
};
