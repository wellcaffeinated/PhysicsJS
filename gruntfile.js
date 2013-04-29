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
            'src/core/*.js',
            'src/geometries/*.js',
            'src/bodies/*.js',
            'src/behaviors/*.js',
            'src/integrators/*.js',
            'src/renderers/*.js',
            'src/outro.js'
        ],
        pkg : pkg,
        uglifyFiles : {}
    };

    // setup dynamic filenames
    config.versioned = [config.pkg.name, config.pkg.version].join('-');
    config.dist = ['dist/', '.js'].join(config.versioned);
    config.uglifyFiles[['dist/', '.min.js'].join(config.versioned)] = config.dist;

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
                src : config.sources,
                dest : config.dist
            }
        },
        watch: {
          files: 'src/**/*.js',
          tasks: ['lodash', 'concat']
        },
        uglify : {
            options : { mangle : true },
            dist : {
                files : config.uglifyFiles
            }
        },
        jasmine : {
            tests : {
                src : ['dist/', '.js'].join(config.versioned),
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
            iife: '(function(window,Physics,undefined){%output%;lodash.extend(Physics.util, lodash);}(this,Physics));',
            include: ['extend', 'throttle', 'bind', 'sortedIndex']
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
    grunt.registerTask('default', ['clean', 'concat', 'jshint', 'uglify', 'jasmine']);

    
};