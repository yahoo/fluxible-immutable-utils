/*
 * Copyright (c) 2015, Yahoo Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

module.exports = {
    merge: function merge(dest, src) {
        dest || (dest = {});

        src && typeof src === 'object' && Object.keys(src).forEach(function mergeCb(prop) {
            dest[prop] = src[prop];
        });

        return dest;
    }
};
