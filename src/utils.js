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
