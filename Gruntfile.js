module.exports = function(grunt) {
    grunt.initConfig({
        babel: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'dist/ImmutableStore.js': 'lib/ImmutableStore.js'
                }
            }
        },
        clean: {
            build: ['dist/*.js', 'dist/*.js.map']
        },  
        mochaTest: {
            test: {        
                options: {
                  reporter: 'spec',
                  recursive: true
                },                
                src: ['tests/**/*.js']
            }
        }  
    });

    // libs
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mocha-test');

    // tasks
    grunt.registerTask('default', ['clean:build', 'babel', 'mochaTest']);
};