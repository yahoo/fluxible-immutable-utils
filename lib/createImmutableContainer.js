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
                !ignoreWarnings &&
                !this._ignoredProps[prop] &&
                utils.isNonImmutable(this.props[prop])
            ) {
                utils.warnNonImmutable(this, prop);
                return false;
            }

            return true;
        },

        componentWillMount: function () {
            this._ignoredProps = getIgnoredProps(ignore);
            Object.keys(this.props).forEach(this.checkImmutable);
        },

        /**
         * Used as the default shouldComponentUpdate function.  Checks whether the props/state of the
         * component has actually changed so that we know whether or not to run the render() method.
         * Since all state/props are immutable, we can use a simple reference check in the majority of cases.
         * @method shouldUpdate
         * @param  {Object} nextProps The new props object for the component.
         * @param  {Object} nextState The new state object for the component.
         * @return {Boolean}           True if the component should run render(), else false.
         */
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
