(function(window, document, undefined){
    window.URL = window.URL || window.webkitURL;

    // deflate

    var decode = function ( string ) {

        return RawDeflate.inflate( window.atob( string ) );

    };

    var encode = function ( string ) {

        return window.btoa( RawDeflate.deflate( string ) );

    };

    //

    var defaultCode = decode( window.defaultCode );

    var documents = [ { filename: 'Untitled', filetype: 'text/plain', autoupdate: true, code: defaultCode } ];

    if ( localStorage.codeeditor !== undefined ) {

        documents = JSON.parse( localStorage.codeeditor );

    }

    if ( window.location.hash ) {

        var hash = window.location.hash.substr( 1 );
        var version = hash.substr( 0, 2 );

        if ( version == 'A/' ) {

            alert( 'That shared link format is no longer supported.' );

        } else if ( version == 'B/' ) {

            documents[ 0 ].code = decode( hash.substr( 2 ) );

        }

    }

    // preview

    var preview = document.getElementById( 'preview' );

    // editor

    var interval;

    var editor = CodeMirror( document.getElementById( 'editor' ), {

        value: documents[ 0 ].code,
        mode: 'text/html',
        lineNumbers: true,
        matchBrackets: true,
        indentWithTabs: true,
        tabSize: 4,
        indentUnit: 4

    } );

    editor.on( 'change', function() {

        buttonSave.style.display = '';
        buttonDownload.style.display = 'none';

        if ( documents[ 0 ].autoupdate === false ) return;

        clearTimeout( interval );
        interval = setTimeout( update, 500 );

    } );

    var element = editor.getWrapperElement().parentNode;

    // toolbar

    var toolbar = document.getElementById( 'toolbar' );

    var buttonUpdate = document.createElement( 'button' );
    buttonUpdate.className = 'button';

    var checkbox = document.createElement( 'input' );
    checkbox.type = 'checkbox';

    if ( documents[ 0 ].autoupdate === true ) checkbox.checked = true;

    checkbox.style.margin = '-4px 4px -4px 0px';
    checkbox.addEventListener( 'click', function ( event ) {

        event.stopPropagation();

        documents[ 0 ].autoupdate = documents[ 0 ].autoupdate === false;

        localStorage.codeeditor = JSON.stringify( documents );

    }, false );
    buttonUpdate.appendChild( checkbox );
    buttonUpdate.appendChild( document.createTextNode( 'update' ) );

    buttonUpdate.addEventListener( 'click', function ( event ) {

        update();

    }, false );
    toolbar.appendChild( buttonUpdate );

    var buttonHide = document.createElement( 'button' );
    buttonHide.className = 'button';
    buttonHide.textContent = 'hide code';
    buttonHide.addEventListener( 'click', function ( event ) {

        toggle();

    }, false );
    toolbar.appendChild( buttonHide );

    var buttonMenu = document.createElement( 'button' );
    buttonMenu.className = 'button';
    buttonMenu.innerHTML = '<svg width="8" height="8"><path d="M 0,1.5 8,1.5 M 0,4.5 8,4.5 M 0,7.5 8,7.5"></svg>';
    buttonMenu.addEventListener( 'click', function ( event ) {

        menu.style.display = menu.style.display === '' ? 'none' : '';

    }, false );
    toolbar.appendChild( buttonMenu );

    toolbar.appendChild( document.createElement( 'br' ) );

    var menu = document.createElement( 'span' );
    menu.style.display = 'none';
    toolbar.appendChild( menu );

    var buttonSave = document.createElement( 'button' );
    buttonSave.className = 'button';
    buttonSave.textContent = 'save';
    buttonSave.addEventListener( 'click', function ( event ) {

        save();

    }, false );
    menu.appendChild( buttonSave );

    var buttonDownload = document.createElement( 'a' );
    buttonDownload.className = 'button';
    buttonDownload.style.display = 'none';
    buttonDownload.download = 'index.html';
    buttonDownload.textContent = 'download';
    menu.appendChild( buttonDownload );

    var buttonShare = document.createElement( 'button' );
    buttonShare.className = 'button';
    buttonShare.textContent = 'share';
    buttonShare.addEventListener( 'click', function ( event ) {

        var dom = document.createElement( 'input' );
        dom.value = 'http://www.mrdoob.com/projects/htmleditor/#B/' + encode( editor.getValue() );
        dom.style.width = '400px';
        dom.style.padding = '5px';
        dom.style.marginTop = '20px';
        dom.style.border = '0px';

        popup.set( dom );
        popup.show();

        dom.focus();
        dom.select();

    }, false );
    menu.appendChild( buttonShare );

    var buttonReset = document.createElement( 'button' );
    buttonReset.className = 'button';
    buttonReset.textContent = 'reset';
    buttonReset.addEventListener( 'click', function ( event ) {

        if ( confirm( 'Are you sure?' ) === true ) {

            editor.setValue( defaultCode );
            save();

        }

    }, false );
    menu.appendChild( buttonReset );

    var buttonAbout = document.createElement( 'button' );
    buttonAbout.className = 'button';
    buttonAbout.textContent = 'about';
    buttonAbout.addEventListener( 'click', function ( event ) {

        var dom = document.createElement( 'div' );
        dom.style.width = '400px';
        dom.style.padding = '5px';
        dom.style.border = '0px';
        dom.style.textAlign = 'center';
        dom.innerHTML = '<h1>HTML EDITOR<\/h1><a href="https://github.com/mrdoob/htmleditor" target="_blank">Source code</a>.<br>Powered by <a href="http://codemirror.net/" target="_blank">CodeMirror ' + CodeMirror.version + '</a> and <a href="http://esprima.org/" target="_blank">Esprima ' + esprima.version + '</a>.';
        popup.set( dom );
        popup.show();

    }, false );
    menu.appendChild( buttonAbout );


    // popup

    var popup = ( function () {

        var scope = this;

        var element = document.getElementById( 'popup' );
        element.style.display = 'none';

        var buttonClose = ( function () {

            var svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
            svg.setAttribute( 'width', 32 );
            svg.setAttribute( 'height', 32 );

            var path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
            path.setAttribute( 'd', 'M 9,12 L 11,10 L 15,14 L 19,10 L 21,12 L 17,16 L 21,20 L 19,22 L 15,18 L 11,22 L 9,20 L 13,16' );
            path.setAttribute( 'fill', 'rgb(235,235,235)' );
            svg.appendChild( path );

            return svg;

        } )();

        buttonClose.style.position = 'absolute';
        buttonClose.style.top = '5px';
        buttonClose.style.right = '5px';
        buttonClose.style.cursor = 'pointer';
        buttonClose.addEventListener( 'click', function ( event ) {

            scope.hide();

        }, false );
        element.appendChild( buttonClose );

        var content = document.createElement( 'div' );
        element.appendChild( content );

        var update = function () {

            element.style.left = ( ( window.innerWidth - element.offsetWidth ) / 2 ) + 'px';
            element.style.top = ( ( window.innerHeight - element.offsetHeight ) / 2 ) + 'px';

        };

        window.addEventListener( 'load', update, false );
        window.addEventListener( 'resize', update, false );

        //

        this.show = function () {

            element.style.display = '';
            update();

        };

        this.hide = function () {

            element.style.display = 'none';

        };

        this.set = function ( value ) {

            while ( content.children.length > 0 ) {

                content.removeChild( content.firstChild );

            }

            content.appendChild( value );

        };

        return this;

    } )();


    // events

    document.addEventListener( 'drop', function ( event ) {

        event.preventDefault();
        event.stopPropagation();

        var file = event.dataTransfer.files[ 0 ];

        documents[ 0 ].filename = file.name;
        documents[ 0 ].filetype = file.type;

        var reader = new FileReader();

        reader.onload = function ( event ) {

            editor.setValue( event.target.result );

        };

        reader.readAsText( file );

    }, false );

    document.addEventListener( 'keydown', function ( event ) {

        if ( event.keyCode === 83 && ( event.ctrlKey === true || event.metaKey === true ) ) {

            event.preventDefault();
            save();

        }

        if ( event.keyCode === 13 && ( event.ctrlKey === true || event.metaKey === true ) ) {

            update();

        }

        if ( event.keyCode === 27 ) {

            toggle();

        }

    }, false );


    // actions

    var update = function () {

        var value = editor.getValue();

        if ( validate( value ) ) {

            // remove previous iframe

            if ( preview.children.length > 0 ) {

                preview.removeChild( preview.firstChild );

            }

            //

            var iframe = document.createElement( 'iframe' );
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = '0';
            preview.appendChild( iframe );

            var content = iframe.contentDocument || iframe.contentWindow.document;

            // workaround for chrome bug
            // http://code.google.com/p/chromium/issues/detail?id=35980#c12

            value = value.replace( '<script>', '<script>if ( window.innerWidth === 0 ) { window.innerWidth = parent.innerWidth; window.innerHeight = parent.innerHeight; }' );

            content.open();
            content.write( value );
            content.close();

        }

    };

    var errorLines = [];
    var widgets = [];

    var validate = function ( value ) {

        return editor.operation( function () {

            while ( errorLines.length > 0 ) {

                editor.removeLineClass( errorLines.shift(), 'background', 'errorLine' );

            }

            for ( var i = 0; i < widgets.length; i ++ ) {

                editor.removeLineWidget( widgets[ i ] );

            }

            widgets.length = 0;

            // remove html

            var string = '\n';
            var lines = value.split( '\n' );
            var lineCurrent = 0, lineTotal = lines.length;

            while ( lineCurrent < lineTotal && lines[ lineCurrent ].indexOf( '<script>' ) === -1 ) {

                string += '\n';
                lineCurrent ++;

            }

            var lineStart = lineCurrent ++;

            while ( lineCurrent < lineTotal && lines[ lineCurrent ].indexOf( '<\/script>' ) === -1 ) {

                string += lines[ lineCurrent ] + '\n';
                lineCurrent ++;

            }

            //

            try {

                var result = esprima.parse( string, { tolerant: true } ).errors;

                for ( var i = 0; i < result.length; i ++ ) {

                    var error = result[ i ];

                    var message = document.createElement( 'div' );
                    message.className = 'esprima-error';
                    message.textContent = error.message.replace(/Line [0-9]+: /, '');

                    var lineNumber = error.lineNumber - 1;
                    errorLines.push( lineNumber );

                    editor.addLineClass( lineNumber, 'background', 'errorLine' );

                    var widget = editor.addLineWidget(
                        lineNumber,
                        message
                    );

                    widgets.push( widget );

                }

            } catch ( error ) {

                var message = document.createElement( 'div' );
                message.className = 'esprima-error';
                message.textContent = error.message.replace(/Line [0-9]+: /, '');

                var lineNumber = error.lineNumber - 1;
                errorLines.push( lineNumber );

                editor.addLineClass( lineNumber, 'background', 'errorLine' );

                var widget = editor.addLineWidget(
                    lineNumber,
                    message
                );

                widgets.push( widget );

            }

            return errorLines.length === 0;

        });

    };

    var save = function () {

        documents[ 0 ].code = editor.getValue();

        localStorage.codeeditor = JSON.stringify( documents );

        var blob = new Blob( [ editor.getValue() ], { type: documents[ 0 ].filetype } );
        var objectURL = URL.createObjectURL( blob );

        buttonDownload.href = objectURL;

        var date = new Date();
        buttonDownload.download = documents[ 0 ].filename;

        buttonSave.style.display = 'none';
        buttonDownload.style.display = '';

    };

    var toggle = function () {

        if ( element.style.display === '' ) {

            buttonHide.textContent = 'show code';

            element.style.display = 'none';
            buttonUpdate.style.display = 'none';
            buttonShare.display = 'none';

        } else {

            buttonHide.textContent = 'hide code';

            element.style.display = '';
            buttonUpdate.style.display = '';
            buttonShare.display = '';

        }

    };

    update();
})(this, this.document);