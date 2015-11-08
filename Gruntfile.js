'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        babel: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'lib/ImmutableStore.js': 'src/ImmutableStore.js'
                }
            }
        },
        clean: {
            build: ['lib/ImmutableStore.js', 'lib/ImmutableStore.js.map']
        }
    });

    // libs
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // tasks
    grunt.registerTask('default', ['clean:build', 'babel']);
};
