/*
 * Copyright (c) 2015, Yahoo Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

'use strict';

var React = require('react');
var connectToStores = require('fluxible/addons/connectToStores');
var utils = require('../internals/utils');

function getIgnoredProps(ignore) {
    if (!Array.isArray(ignore)) {
        return ignore || {};
    }

    var ignoredProps = {};

    ignore.forEach(function (prop) {
        ignoredProps[prop] = true;
    });

    return ignoredProps;
}

function shallowEquals(obj1, obj2) {
    if (obj1.length !== obj2.length) {
        return false;
    }

    for (var key in obj1) {
        if (obj1.hasOwnProperty(key) && obj1[key] !== obj2[key]) {
            return false;
        }
    }

    return true;
}

module.exports = function createImmutableContainer(Component, options) {
    options = options || {};
    var ignore = options.ignore;
    var ignoreWarnings = options.ignoreWarnings;
    var getStateFromStores = options.getStateFromStores;
    var stores = options.stores || Object.keys(getStateFromStores || {});
    var componentName = Component.displayName || Component.name;

    var ImmutableComponent = React.createClass({
        displayName: componentName + ':Immutable',

        getDefaultProps: function () {
            return {};
        },

        checkImmutable: function (prop) {
            if (
                !this._ignoredProps[prop] &&
                utils.isNonImmutable(this.props[prop])
            ) {
                utils.warnNonImmutable(this, prop);
            }
        },

        checkAllImmutable: function () {
            if (!ignoreWarnings) {
                Object.keys(this.props).forEach(this.checkImmutable);
            }
        },

        componentWillMount: function () {
            this._ignoredProps = getIgnoredProps(ignore);
            this.checkAllImmutable();
        },

        componentWillUpdate: function () {
            this.checkAllImmutable();
        },

        shouldComponentUpdate: function (nextProps) {
            return !shallowEquals(this.props, nextProps);
        },

        render: function () {
            return React.createElement(Component, this.props);
        }
    });

    return stores.length ?
        connectToStores(ImmutableComponent, stores, getStateFromStores) :
        ImmutableComponent;
};
