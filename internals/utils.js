/*
 * Copyright (c) 2015, Yahoo Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var Immutable = require('immutable');
var isImmutable = Immutable.Iterable.isIterable;
var isReactElement = require('react/addons').isValidElement;

function isNonImmutable(item) {
    return (
        item
        && typeof item === 'object'
        && !isReactElement(item)
        && !isImmutable(item)
    );
}

function warnNonImmutable(component, prop) {
    console.warn('Component ' +
        '"' + component.constructor.displayName + '"' +
        ' received non-immutable object for ' +
        '"' + prop + '"');
}

function merge(dest, src) {
    dest || (dest = {});

    src && typeof src === 'object' && Object.keys(src).forEach(function mergeCb(prop) {
        dest[prop] = src[prop];
    });

    return dest;
}

module.exports = {
    merge: merge,
    isNonImmutable: isNonImmutable,
    warnNonImmutable: warnNonImmutable
};
