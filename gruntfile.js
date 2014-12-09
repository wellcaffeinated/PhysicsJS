/*global module:false*/

module.exports = function(grunt) {
    "use strict";
    var pkg, config;

    pkg = grunt.file.readJSON('package.json');

    config = {
        banner : [
            '/**',
            ' * <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
            ' * <%= pkg.description %>',
            ' * http://wellcaffeinated.net/PhysicsJS',
            ' *',
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>',
            ' * Licensed <%= pkg.license %>',
            ' */\n'
        ].join('\n'),

        extensionWrapper: [
            "(function (root, factory) {",
            "    if (typeof define === 'function' && define.amd) {",
            "        define(['<%= deps.join(\"','\")%>'], factory);",
            "    } else if (typeof exports === 'object') {",
            "        module.exports = factory.apply(root, ['<%= deps.join(\"','\")%>'].map(require));",
            "    } else {",
            "        factory.call(root, root.Physics);",
            "    }",
            "}(this, function (Physics) {",
            "    'use strict';",
            "    <%= src %>",
            "    // end module: <%= path %>",
            "    return Physics;",
            "}));// UMD",
        ].join('\n'),

        sources : [
            'src/intro.js',
            'src/math/*.js',

            'src/util/noconflict.js',
            'src/util/decorator.js',
            'src/util/helpers.js',
            'src/util/scratchpad.js',
            'src/util/pubsub.js',
            'src/util/ticker.js',

            'src/core/query.js',
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
            'src/bodies/point.js',

            'src/outro.js'
        ],

        moduleSources : [
            'src/geometries/*.js',
            '!src/geometries/point.js',
            'src/bodies/*.js',
            '!src/bodies/point.js',
            'src/behaviors/*.js',
            'src/integrators/*.js',
            '!src/integrators/verlet.js',
            'src/renderers/*.js'
        ],

        sourcesIgnore: [
            '!src/renderers/debug.js'
        ],

        rjsHelper: 'test/r.js.spec.helper.js',

        pkg : pkg,
        uglifyFiles : {}
    };

    config.distRequireJS = {
        baseUrl: 'dist/',
        packages: [
            {
                name: 'physicsjs',
                location: '.',
                main: 'physicsjs'
            }
        ],
        paths: {
            'pixi': '../lib/pixi'
        },
        optimize: 'none',
        name: '../' + config.rjsHelper.replace(/\.js$/, ''),
        out: 'test/physicsjs-built.js'
    };

    // setup dynamic filenames
    config.name = config.pkg.name.toLowerCase();
    config.nameFull = config.name + '-full';
    config.versioned = [config.name, config.pkg.version].join('-');
    config.versionedFull = [config.name, 'full', config.pkg.version].join('-');
    config.dev = '_working/physicsjs/'+ config.name + '.js';
    config.devFull = '_working/physicsjs/'+ config.nameFull + '.js';
    config.dist = 'dist/' + config.name + '.js';
    config.distFull = 'dist/' + config.nameFull + '.js';
    config.uglifyFiles['dist/' + config.name + '.min.js'] = config.dist;
    config.uglifyFiles['dist/' + config.nameFull + '.min.js'] = config.distFull;

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
        src.replace(/@requires\s([\w-_\/]+(\.js)?)/g, function( match, dep ){

            var i = dep.indexOf('.js');

            if ( i > -1 ){
                // must be a 3rd party dep
                dep = dep.substr( 0, i );
                deps.push( dep );
            } else {
                // just get the dependency
                deps.push( pfx + dep );
            }
            // no effect
            return match;
        });

        var data = {
            src: src.replace(/\n/g, '\n    '),
            path: path,
            deps: deps
        };

        return grunt.template.process(config.banner, config) +
            grunt.template.process(config.extensionWrapper, {data: data});
    }

    // write out the source file identifier as a comment
    function fileIdentifier(src, path){

        return '\n// ---\n// inside: ' + path + '\n\n' + src;
    }

    // Project configuration.
    grunt.initConfig({
        pkg : config.pkg,
        clean : {
            dist : ['dist/'],
            dev : ['_working/physicsjs/'],
            test: [config.distRequireJS.out]
        },
        concat : {
            options : {
                stripBanners : true,
                banner : config.banner
            },
            dev : {
                options: {
                    process: fileIdentifier
                },
                src : config.sources,
                dest : config.dev
            },
            devFull : {
                options: {
                    process: fileIdentifier
                },
                src : config.sourcesFull,
                dest : config.devFull
            },
            dist : {
                options: {
                    process: fileIdentifier
                },
                src : config.sources,
                dest : config.dist
            },
            distFull : {
                options: {
                    process: fileIdentifier
                },
                src : [].concat(config.sourcesFull).concat(config.sourcesIgnore),
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
            modulesDev: {
                options: {
                    processContent: wrapDefine
                },
                expand: true,
                cwd: 'src/',
                src: config.moduleSources.join(' ').replace(/src\//g, '').split(' '),
                dest: '_working/physicsjs/'
            },
            examples: {
                src: config.distFull,
                dest: 'examples/' + config.pkg.name.toLowerCase() + '-full.js'
            }
        },
        watch: {
          files: 'src/**/*.js',
          tasks: [ 'watchdev' ]
        },
        uglify : {
            options : { mangle : true, banner: config.banner },
            dist : {
                files : config.uglifyFiles
            }
        },
        // for testing builds
        requirejs: {
            compile: {
                options: config.distRequireJS
            }
        },
        jasmine : {
            dev : {
                src : config.devFull,
                options : {
                    helpers: 'lib/raf.js',
                    specs : 'test/spec/*.spec.js',
                    template : 'test/grunt.tmpl'
                }
            },
            devRequireJS : {
                options : {
                    helpers: ['lib/raf.js', 'test/requirejs.spec.helper.js'],
                    specs : 'test/requirejs.spec.js',
                    template : require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfig: {
                            baseUrl: '_working/',
                            packages: [
                                {
                                    name: 'physicsjs',
                                    location: 'physicsjs',
                                    main: 'physicsjs'
                                }
                            ],
                            paths: {
                                'pixi': '../lib/pixi'
                            }
                        }
                    }
                }
            },
            dist : {
                src : config.distFull,
                options : {
                    helpers: 'lib/raf.js',
                    specs : 'test/spec/*.spec.js',
                    template : 'test/grunt.tmpl'
                }
            },
            distRequireJS : {
                options : {
                    helpers: ['lib/raf.js', 'test/requirejs.spec.helper.js'],
                    specs : 'test/requirejs.spec.js',
                    template : require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfig: config.distRequireJS
                    }
                }
            },
            distRequireJSBuild : {
                options : {
                    helpers: 'lib/raf.js',
                    specs : 'test/requirejs.build.spec.js',
                    template : require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfig: {
                            baseUrl: './',
                            paths: {
                                'bundle': config.distRequireJS.out.replace(/\.js$/, ''),
                                'pixi': 'lib/pixi'
                            }
                        }
                    }
                }
            }
        },
        jasmine_node: {
            specNameMatcher: "spec", // load only specs containing specNameMatcher
            projectRoot: "test/node",
            requirejs: false,
            forceExit: true,
            jUnit: {
                report: false,
                savePath : false,
                useDotNotation: true,
                consolidate: true
            }
        },
        jshint : {
            options : {
                jshintrc : 'jshint.json'
            },
            source : 'src/*/*.js'
        },
        docs: {
            api: {
                dest: 'docs/',
                src: ['src/**/*.js'],
                options: {
                    template: 'docs/layout.jade',
                    debugFile: 'docs/debug.json',
                    fileRoot: 'https://github.com/wellcaffeinated/PhysicsJS/tree/master/'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    require('./lib/gendoc.js')(grunt);

    // build a js file with an array containing the modules path name
    grunt.registerTask('jasmine-module-list', function(){

        var cfg = {
            modules: grunt.file.expand({ cwd: './' }, config.moduleSources ).join(' ').replace(/src\//g, 'physicsjs/').replace(/\.js/g, '').split(' ')
        };

        grunt.file.write('test/requirejs.spec.helper.js', 'var cfg = ' + JSON.stringify( cfg ) + ';' );
        grunt.file.write(config.rjsHelper, 'require(' + JSON.stringify( cfg.modules ) + ');' );

    });


    // Run `grunt watch` to create a dev build whenever a file is changed

    // create a build for development
    grunt.registerTask('dev', ['clean:dev', 'concat:dev', 'concat:devFull', 'copy:modulesDev']);
    grunt.registerTask('watchdev', ['clean:dev', 'concat:dev', 'concat:devFull', 'copy:modulesDev']);
    grunt.registerTask('testDev', ['jshint', 'jasmine-module-list', 'jasmine:dev', 'jasmine:devRequireJS']);

    // tests on dist code
    grunt.registerTask('testDist', ['jasmine-module-list', 'jasmine:dist', 'jasmine:distRequireJS', 'requirejs', 'jasmine:distRequireJSBuild', 'clean:test', 'jasmine_node']);

    // create a distribution build
    grunt.registerTask('dist', ['clean:dist', 'concat:dist', 'concat:distFull', 'copy:modules', 'copy:examples', 'jshint', 'uglify', 'testDist']);

    // Default task.
    grunt.registerTask('default', ['dev', 'testDev']);

};
