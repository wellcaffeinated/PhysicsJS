var panino = require('panino');
var jade = require('jade');
var md = require('marked');
var sync = require('synchronize');
var pyg = require('pygmentize-bundled');
var TypeLinks = {
    "Array" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
    "Boolean" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean",
    "Date" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date",
    "Error" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error",
    "EvalError" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/EvalError",
    "RangeError" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RangeError",
    "ReferenceError" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ReferenceError",
    "SyntaxError" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SyntaxError",
    "TypeError" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError",
    "URIError" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/URIError",
    "Function" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function",
    "Infinity" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Infinity",
    "JSON" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON",
    "Math" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math",
    "NaN" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NaN",
    "Number" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number",
    "Object" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object",
    "RegExp" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp",
    "String" : "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String",
    "void": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void",
    "undefined": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined"
};

module.exports = function( grunt ){

    var linkReg = /\[\[[\s]*([^\[\]]*)[\s]*\]\]/g;

    function find( obj, fn ){
        for ( var key in obj ){

            if ( fn( obj[ key ], key ) ){
                return obj[ key ];
            }
        }

        return null;
    }

    function makeSectionHash( item, hash ){

        hash = hash || {};
        var arr, ch;

        if ( !item || !item.children || !item.children.length ){
            return hash;
        }

        for ( var i = 0, l = item.children.length; i < l; ++i ){

            ch = item.children[ i ];

            if ( ch.belongs_to ){
                arr = (hash[ ch.belongs_to ] = hash[ ch.belongs_to ] || []);
                item.children.splice( i, 1 );
                i--;
                l--;
                arr.push( ch );
            }

            makeSectionHash( ch, hash );
        }

        return hash;
    }

    function organizeSections( item ){
        var hash = makeSectionHash( item )
            ,found
            ,orphans = []
            ,findRecurse = function( obj, id ){
                var i, l, val;
                if ( !obj ){
                    return false;
                }
                if ( obj.id === id ){
                    return obj;
                }
                if ( obj.children ){
                    for ( i = 0, l = obj.children.length; i < l; ++i ){

                        val = findRecurse( obj.children[ i ], id );
                        if ( val ){
                            return val;
                        }
                    }
                }
                return false;
            }
            ;

        for ( var id in hash ){
            found = findRecurse( item, id );

            if ( found ){
                found.children = found.children || [];
                found.children.push.apply(found.children, hash[ id ]);
            } else {
                orphans.push( hash[ id ] );
            }
        }

        if ( orphans.length ){
            console.log('found orphans!', orphans.length, orphans);
            // item.children.push({
            //     id: 'orphans',
            //     name: 'orphans',
            //     children: orphans,
            //     path: 'orphans'
            // });
        }
    }

    function preProcess( data ){

        organizeSections( data.tree );
        data.tree.children = data.tree.children.filter(function(a){ return !a.superclass; });
    }

    function attrClean( str ){
        if ( typeof str !== 'string' ){
            return '';
        }
        var mapping = {
            ' ': '_'
            ,'.': '-'
            ,'#': '$'
        };
        return str.replace(/[\.\s]/g, function(ch){
            return mapping[ ch ] || '?';
        });
    }

    grunt.registerMultiTask('docs', 'Auto-generate documentation', function(){

        var options = this.options({
            template: ''
            ,debugFile: ''
            ,fileRoot: ''
            // ,additionalObjs : "./additionalObjects.json"
            // ,parseOptions   : "./nodeParseOptions.json"
        });
        var done = this.async();

        var wrapHLJS = function( str ){
            return '<span class="hljs">'+str+'</span>';
        };

        if (!grunt.file.isFile(options.template)) {
            grunt.log.error('Template file "' + options.template + '" not found.');
            return;
        }

        this.files.forEach(function( file ){

            var contents = file.src.filter(function(filepath) {
                // Remove nonexistent files (it's up to you to filter or warn here).
                if (!grunt.file.exists(filepath)) {
                  grunt.log.warn('Source file "' + filepath + '" not found.');
                  return false;
                } else {
                  return true;
                }
            });

            if (!grunt.file.isDir(file.dest)){
                grunt.log.error('Destination "' + file.dest + '" must be a directory.');
                return;
            }

            panino.parse(contents, options, function (err, ast) {

                preProcess( ast );

                sync.fiber(function(){
                    if (err) {
                        grunt.log.error(err);
                        return;
                    }

                    if ( options.debugFile ){
                        grunt.file.write(options.debugFile, JSON.stringify(ast, 2, 2));
                    }

                    md.setOptions({
                        highlight: function (code, lang) {
                            var level = code.match(/^\n\s*/);
                            if ( level ){
                                code = code.replace(/^\n\s*/,'').replace(new RegExp('\n'+level[0], 'g'), '\n');
                            }
                            var ret = sync.await(pyg({ lang: lang, format: 'html' }, code, sync.defer()));
                            return ret.toString();
                        }
                    });

                    function getPath( id ){
                        var item = find(ast.list, function( item ){ return item.id === id });
                        if ( item ){
                            return item.path;
                        }
                        return false;
                    }

                    function linkify( text ){
                        return text.replace(linkReg, function( match, id ){

                            var path = getPath( id );
                            path = getLinkPath( path || id );
                            if ( path ){
                                return '['+id+']('+path+')';
                            }
                            return id;
                        });
                    }

                    function getLinkPath( type, item ){
                        if ( type === 'this' ){
                            return '#'+attrClean(item.name_prefix.replace(/#/g, ''));
                        }
                        if ( type in TypeLinks ){
                            return TypeLinks[type];
                        }
                        return '#'+attrClean( type );
                    }

                    function childrenSort( a, b ){
                        return a.id === 'Physics' ? -1 :
                            b.id === 'Physics' ? 1 :
                                a.type === 'constructor' ? -1 :
                                    b.type === 'constructor' ? 1 :
                                        a.type === 'class' && b.type !== 'class' ? -1 :
                                            b.type === 'class' && a.type !== 'class'? 1 :
                                                a.id > b.id ? 1 :
                                                    -1;
                    }

                    ast.md = md;
                    ast.linkify = linkify;
                    ast.getLinkPath = getLinkPath;
                    ast.getPath = getPath;
                    ast.attrClean = attrClean;
                    ast.childrenSort = childrenSort;
                    ast.fileRoot = options.fileRoot;

                    jade.renderFile(options.template, ast, function (err, html) {
                        if (err) {
                            grunt.log.error(err);
                            return;
                        }

                        grunt.file.write(file.dest + '/index.html', html);
                        grunt.log.ok('Documentation created!');
                        done();
                    });
                });
            });
        });
    });


};
