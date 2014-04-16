(function(){
    var url = Array.prototype.filter.call(document.getElementsByTagName('script'), function( el ){
        return el.src.indexOf('physicsjs') > -1;
    })[0].src;
    var htmlContent = [
        '<!doctype html>'
        ,'<html>'
          ,'<head>'
          ,'<style>body { background: #171717; } canvas { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }</style>'
          ,'</head>'
          ,'<body>'
          ,'<script src="'+url+'"></script>'

    ].join( '\n' );

    var els = document.getElementsByClassName('demo');

    Array.prototype.forEach.call(els, function( el ){
        var wrapper = document.createElement('div');
        wrapper.className = 'demo-wrap';

        if (!el){ return; }

        el.parentNode.insertBefore( wrapper, el );
        var thecode = el.innerHTML;
        el.parentNode.removeChild( el );

        var fold = el.dataset && el.dataset.fold;

        // buttons
        var buttons = document.createElement('div');
        buttons.className = 'controls';

        // run button
        var runBtn = document.createElement('button');
        runBtn.className = 'ctrl-run';
        runBtn.innerHTML = 'update';
        buttons.appendChild( runBtn );

        // hide button
        var hideBtn = document.createElement('button');
        hideBtn.className = 'ctrl-hide';
        hideBtn.innerHTML = 'hide code';
        buttons.appendChild( hideBtn );

        wrapper.appendChild( buttons );

        // display area
        var display = document.createElement('div');
        display.className = 'display';
        wrapper.appendChild( display );

        // editor
        var editor = CodeMirror( wrapper, {
            value: thecode,
            mode: 'javascript',
            theme: 'solarized',
            lineNumbers: false,
            matchBrackets: true,
            // foldCode: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            indentWithTabs: false,
            tabSize: 4,
            indentUnit: 4
        });

        if ( fold ){
            fold = fold.split(',');
            editor.foldCode(CodeMirror.Pos(fold[0]|0, fold[1]|0));
        }

        function update( e ){
            var js = editor.getValue();

            var value = htmlContent + '<script>' + js + '</script>' + '</body></html>';

            // remove previous display
            if ( display.children.length > 0 ) {
                display.removeChild( display.firstChild );
            }

            var iframe = document.createElement( 'iframe' );
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = '0';
            display.appendChild( iframe );

            var content = iframe.contentDocument || iframe.contentWindow.document;

            // workaround for chrome bug
            // http://code.google.com/p/chromium/issues/detail?id=35980#c12

            value = value.replace( '<script>', '<script>if ( window.innerWidth === 0 ) { window.innerWidth = parent.innerWidth; window.innerHeight = parent.innerHeight; }' );

            content.open();
            content.write( value );
            content.close();

            if ( e ){
                e.preventDefault();
            }
        }

        var hidden = false;
        function hideCode( e ){
            var ed = editor.getWrapperElement();
            ed.style.display = hidden ? '' : 'none';
            hideBtn.innerHTML = hidden ? 'hide code' : 'show code';
            hidden = !hidden;

            if ( e ){
                e.preventDefault();
            }
        }

        hideBtn.addEventListener('click', hideCode);
        hideBtn.addEventListener('touchstart', hideCode);

        runBtn.addEventListener('click', update);
        runBtn.addEventListener('touchstart', update);
        update();
    });
})();
