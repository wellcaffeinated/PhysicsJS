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
            
            'src/outro.js'
        ],

        moduleSources : [
            'src/geometries/*.js',
            'src/bodies/*.js',
            'src/behaviors/*.js',
            'src/integrators/improved-euler.js',
            'src/renderers/*.js'
        ],

        pkg : pkg,
        uglifyFiles : {}
    };

    // setup dynamic filenames
    config.versioned = [config.pkg.name, config.pkg.version].join('-');
    config.versionedFull = [config.pkg.name, 'full', config.pkg.version].join('-');
    config.dist = ['dist/', '.js'].join(config.versioned);
    config.distFull = ['dist/', '.js'].join(config.versionedFull);
    config.uglifyFiles[['dist/', '.min.js'].join(config.versioned)] = config.dist;
    config.uglifyFiles[['dist/', '.min.js'].join(config.versionedFull)] = config.distFull;

    // search for pragmas to figure out dependencies and add a umd declaration
    function wrapDefine( src, path ){

        path = path.replace('src/', '');

        var deps = ['physicsjs'];
        var l = path.split('/').length;
        var pfx = l > 0 ? (new Array( l )).join('../') : './';
        src.replace(/@requires\s([\w\/]+)/g, function( match, dep ){

            // just get the dependency
            deps.push( pfx + dep );
            // no effect
            return match;
        });

        return "define(['" + deps.join("', '") + "'], function( Physics ){\n\n" + 
                src + '\n' +
                '// end module: ' + path + '\n' +
            "}); // define ";
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

                        return '// Source file: ' + path + '\n' + src;
                    }
                },
                src : config.sources,
                dest : config.dist
            },
            distFull : {
                options: {
                    process: function(src, path){

                        return '// Source file: ' + path + '\n' + src;
                    }
                },
                src : [].concat(config.sources, config.moduleSources),
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
                src: config.moduleSources.join(' ').split(' src/'),
                dest: 'dist/'
            },
            examples: {
                src: config.distFull,
                dest: 'examples/' + config.pkg.name + '-full.js'
            }
        },
        watch: {
          files: 'src/**/*.js',
          tasks: ['lodash', 'concat', 'copy']
        },
        uglify : {
            options : { mangle : true },
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
            iife: '(function(){%output%;lodash.extend(Physics.util, lodash);}());',
            include: ['extend', 'throttle', 'bind', 'sortedIndex', 'shuffle']
            // minus: ['result', 'shuffle']
            // plus: ['random', 'template'],
            // template: './*.jst'
            // settings: '{interpolate:/\\{\\{([\\s\\S]+?)\\}\\}/g}'
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-lodashbuilder');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');



    // Default task.
    grunt.registerTask('default', ['clean', 'concat', 'copy', 'jshint', 'uglify', 'jasmine']);

    
};