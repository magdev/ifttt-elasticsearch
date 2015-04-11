/**
 * Copyright (c) 2015, Marco Grätsch <magdev3.0@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the <organization> nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
module.exports = function(grunt) {
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    
    var outputdir = (grunt.option('outputdir') || process.cwd());
    
    grunt.initConfig({
        outputdir: outputdir,
        pkg: grunt.file.readJSON('package.json'),
        
        jsonlint: {
            src: [ '*.json', 'config/elasticsearch/*.json', 'locales/*.json' ]
        },
        
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            gruntfile : {
                src: 'Gruntfile.js'
            },
            lib: {
                src: [ 'lib/**/*.js' ]
            }
        },
        
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: [ 'jshint:gruntfile' ]
            },
            lib: {
                files: '<%= jshint.lib.src %>',
                tasks: [ 'jshint:lib' ]
            }
        },
        
        simplemocha: {
            options: {
                globals: ['expect'],
                timeout: 3000,
                ignoreLeaks: true,
                ui: 'bdd',
                reporter: 'tap'
            },
            all: { 
                src: ['test/**/*_test.js'] 
            }
        },
        
        less: {
            options:{
                compress:true
            },
            dist: {
                files: {
                    '<%= outputdir %>/public/css/styles.css': 'less/styles.less'
                }
            }
        },
        
        uglify: {
            options: {
                sourceMap: true,
                sourceMapIncludeSources: false,
                sourceMapRoot: 'public/js/',
                preserveComments: false,
                quoteStyle: 1,
                mangle: {
                    except: ['jQuery', 'Share']
                }
            },
            all: {
                files: {
                    'public/js/app.min.js': ['public/js/app.js'],
                    'public/js/push.min.js': ['public/js/push.js']
                }
            }
        }
    });

    grunt.registerTask('default', [ 'less', 'uglify', 'jshint', 'jsonlint', 'simplemocha' ]);
    grunt.registerTask('build', [ 'less', 'uglify', 'jshint', 'jsonlint' ]);
    grunt.registerTask('test', [ 'jshint', 'jsonlint', 'simplemocha' ]);
};
