(function(){

    var defaults = {
        // draw meta data (fps, steps, etc)
        meta: true,
        // refresh rate of meta info
        metaRefresh: 200,

        width: 600,
        height: 600
    };

    // Service
    Physics.renderer = Decorator('renderer', {

        init: function( options ){

            var el = typeof options.el === 'string' ? document.getElementById(options.el) : options.el
                ;

            this.options = Physics.util.extend({}, defaults, options);

            this.el = el ? el : document.body;

            this.drawMeta = Physics.util.throttle( Physics.util.bind(this.drawMeta, this), this.options.metaRefresh );
        },

        // prototype methods
        render: function( bodies, stats ){

            var body
                ,view
                ,pos
                ;

            if (this.beforeRender){

                this.beforeRender();
            }

            if (this.options.meta){
                this.drawMeta( stats );
            }

            for ( var i = 0, l = bodies.length; i < l; ++i ){
                
                body = bodies[ i ];
                view = body.view || ( body.view = this.createView(body.geometry) );

                if ( !body.hidden ){
                    this.drawBody( body, view );
                }
            }
        },

        // methods that should be overridden
        createView: function( geometry ){

            // example:
            // var el = document.createElement('div');
            // el.style.height = geometry.height + 'px';
            // el.style.width = geometry.width + 'px';
            // return el;
        },

        drawMeta: function( stats ){
            
            // example:
            // this.els.fps.innerHTML = stats.fps.toFixed(2);
            // this.els.steps.innerHTML = stats.steps;
        },

        drawBody: function( body, view ){

            // example (pseudocode):
            // view.angle = body.state.angle
            // view.position = body.state.position
        }

        
    });

}());