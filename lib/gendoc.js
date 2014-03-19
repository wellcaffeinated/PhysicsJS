var panino = require('panino');
var jade = require('jade');
var md = require('marked');
var sync = require('synchronize');
var pyg = require('pygmentize-bundled');

module.exports = function( grunt ){

    var linkReg = /\[\[[\s]*(.*\w)[\s]*\]\]/;

    function find( obj, fn ){
        for ( var key in obj ){
            
            if ( fn( obj[ key ] ) ){
                return obj[ key ];
            }
        }

        return null;
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
                            var ret = sync.await(pyg({ lang: lang, format: 'html' }, code, sync.defer()));
                            return ret.toString();
                        }
                    });

                    function linkify( text ){
                        return text.replace(linkReg, function( match, id ){

                            var item = find(ast.list, function( item ){ return item.id === id });
                            if ( item ){
                                return '['+id+'](#'+item.path+')';
                            }
                            return id;
                        });
                    }

                    ast.md = md;
                    ast.linkify = linkify;
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
