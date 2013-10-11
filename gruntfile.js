/*global module:false*/

module.exports = function(grunt) {
    "use strict";
    var pkg, config;

    pkg = grunt.file.readJSON('package.json');

    config = {
        banner : [
            '/**\n',
            ' * <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n',
            ' * <%= pkg.description %>\n',
            ' * http://wellcaffeinated.net/PhysicsJS\n',
            ' *\n',
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n',
            ' * Licensed <%= pkg.license %>\n',
            ' */\n'
        ].join(''),

        sources : [
            'src/intro.js',
            'lib/lodash.js',
            'src/util/*.js',
            'src/math/*.js',

            'src/core/behavior.js',
            'src/core/body.js',
            'src/core/geometry.js',
            'src/core/geometry-helpers.js',
            'src/core/integrator.js',
            'src/core/renderer.js',
            'src/core/world.js',

            // default integrator
            'src/integrators/verlet.js',

            // default geometry
            'src/geometries/point.js',
            
            'src/outro.js'
        ],

        moduleSources : [
            'src/geometries/*.js',
            '!src/geometries/point.js',
            'src/bodies/*.js',
            'src/behaviors/*.js',
            'src/integrators/*.js',
            '!src/integrators/verlet.js',
            'src/renderers/*.js'
        ],

        pkg : pkg,
        uglifyFiles : {}
    };

    // setup dynamic filenames
    config.versioned = [config.pkg.name.toLowerCase(), config.pkg.version].join('-');
    config.versionedFull = [config.pkg.name.toLowerCase(), 'full', config.pkg.version].join('-');
    config.dist = ['dist/', '.js'].join(config.versioned);
    config.distFull = ['dist/', '.js'].join(config.versionedFull);
    config.uglifyFiles[['dist/', '.min.js'].join(config.versioned)] = config.dist;
    config.uglifyFiles[['dist/', '.min.js'].join(config.versionedFull)] = config.distFull;

    // build source globs for full package
    config.sourcesFull = [].concat(config.sources);
    Array.prototype.splice.apply(config.sourcesFull, [-1, 0].concat(config.moduleSources));

    // remove the exclusions. we want it to match all files.
    for ( var i = 0, l = config.sourcesFull.length; i < l; ++i ){
        
        if (config.sourcesFull[ i ].charAt(0) === '!'){
            config.sourcesFull.splice( i, 1 );
            i--;
            l--;
        }
    }

    // search for pragmas to figure out dependencies and add a umd declaration
    function wrapDefine( src, path ){

        path = path.replace('src/', '');

        var deps = ['physicsjs'];
        var l = path.split('/').length;
        var pfx = l > 0 ? (new Array( l )).join('../') : './';
        src.replace(/@requires\s([\w-_\/]+)/g, function( match, dep ){

            // just get the dependency
            deps.push( pfx + dep );
            // no effect
            return match;
        });

        return grunt.template.process(config.banner, config) + "(function (root, factory) {\n" +
        "    var deps = ['" + deps.join("', '") + "'];\n" +
        "    if (typeof exports === 'object') {\n" +
        "        // Node. \n" +
        "        var mods = deps.map(require);\n" +
        "        module.exports = factory.call(root, mods[ 0 ]);\n" +
        "    } else if (typeof define === 'function' && define.amd) {\n" +
        "        // AMD. Register as an anonymous module.\n" +
        "        define(deps, function( p ){ return factory.call(root, p); });\n" +
        "    } else {\n" +
        "        // Browser globals (root is window). Dependency management is up to you.\n" +
        "        root.Physics = factory.call(root, root.Physics);\n" +
        "    }\n" +
        "}(this, function ( Physics ) {\n" +
        "    'use strict';\n" +
        "    " + src.replace(/\n/g, '\n    ') + '\n' +
        '    // end module: ' + path + '\n' +
        '    return Physics;\n' +
        "})); // UMD ";
    }

    // Project configuration.
    grunt.initConfig({
        pkg : config.pkg,
        lint : {
            files : ['gruntfile.js', 'test/*.js', 'src/*']
        },
        clean : {
            dist : ['dist/']
        },
        concat : {
            options : {
                stripBanners : true,
                banner : config.banner
            },
            dist : {
                options: {
                    process: function(src, path){

                        return '\n// ---\n// inside: ' + path + '\n\n' + src;
                    }
                },
                src : config.sources,
                dest : config.dist
            },
            distFull : {
                options: {
                    process: function(src, path){

                        return '\n// ---\n// inside: ' + path + '\n\n' + src;
                    }
                },
                src : config.sourcesFull,
                dest : config.distFull
            }
        },
        copy: {
            modules: {
                options: {
                    processContent: wrapDefine
                },
                expand: true,
                cwd: 'src/',
                src: config.moduleSources.join(' ').replace(/src\//g, '').split(' '),
                dest: 'dist/'
            },
            examples: {
                src: config.distFull,
                dest: 'examples/' + config.pkg.name.toLowerCase() + '-full.js'
            }
        },
        watch: {
          files: 'src/**/*.js',
          tasks: ['lodash', 'concat', 'copy']
        },
        uglify : {
            options : { mangle : true, banner: config.banner },
            dist : {
                files : config.uglifyFiles
            }
        },
        jasmine : {
            tests : {
                src : config.distFull,
                options : {
                    specs : 'test/spec/*.spec.js',
                    template : 'test/grunt.tmpl'
                }
            },
            requireJSTests : {
                options : {
                    helpers: 'test/requirejs.spec.helper.js',
                    specs : 'test/requirejs.spec.js',
                    template : require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfig: {
                            baseUrl: 'dist/',
                            paths: {
                                'physicsjs': 'physicsjs-'+config.pkg.version
                            }
                        }
                    }
                }
            }
        },
        jshint : {
            options : {
                jshintrc : 'jshint.json'
            },
            source : 'src/*/*.js'
        },
        lodash: {
            // modifiers for prepared builds
            // backbone, csp, legacy, mobile, strict, underscore
            // modifier: 'backbone',
            // output location
            dest: 'lib/lodash.js',
            // define a different Lo-Dash location
            // useful if you wanna use a different Lo-Dash version (>= 0.7.0)
            // by default, lodashbuilder uses always the latest version
            // of Lo-Dash (that was in npm at the time of lodashbuilders installation)
            // src: 'node_modules/lodash',
            // More information can be found in the [Lo-Dash custom builds section](http://lodash.com/#custom-builds)
            // category: ['collections', 'functions']
            exports: ['none'],
            iife: '(function(window){%output%;lodash.extend(Physics.util, lodash);}(this));',
            include: ['isObject', 'isFunction', 'isArray', 'isPlainObject', 'uniqueId', 'each', 'random', 'extend', 'clone', 'throttle', 'bind', 'sortedIndex', 'shuffle']
            // minus: ['result', 'shuffle']
            // plus: ['random', 'template'],
            // template: './*.jst'
            // settings: '{interpolate:/\\{\\{([\\s\\S]+?)\\}\\}/g}'
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-lodash');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // build a js file with an array containing the modules path name
    grunt.registerTask('jasmine-module-list', function(){

        var cfg = {
            modules: grunt.file.expand({ cwd: 'dist/' }, config.moduleSources.join(' ').replace(/src\//g, '').split(' ') )
        };

        grunt.file.write('test/requirejs.spec.helper.js', 'var cfg = ' + JSON.stringify( cfg ) + ';' );

    });

    // Default task.
    grunt.registerTask('default', ['clean', 'concat', 'copy', 'jshint', 'uglify', 'jasmine-module-list', 'jasmine']);

    
};
