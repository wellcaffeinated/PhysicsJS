(function(){

    var defaults = {
        // draw meta data (fps, steps, etc)
        meta: false,
        // refresh rate of meta info
        metaRefresh: 200,

        // width of viewport
        width: 600,
        // height of viewport
        height: 600,
        // automatically resize the renderer
        autoResize: true
    };

    /** related to: Physics.util.decorator
     * Physics.renderer( name[, options] ) -> Renderer
     * - name (String): The name of the renderer to create
     * - options (Object): The configuration for that renderer ( depends on renderer ).
       Available options and defaults:

       ```javascript
        {
            // draw meta data (fps, steps, etc)
            meta: false,
            // refresh rate of meta info
            metaRefresh: 200,

            // width of viewport
            width: 600,
            // height of viewport
            height: 600
            // automatically resize the renderer
            autoResize: true
        }
       ```
     *
     * Factory function for creating Renderers.
     *
     * Visit [the PhysicsJS wiki on Renderers](https://github.com/wellcaffeinated/PhysicsJS/wiki/Renderers)
     * for usage documentation.
     **/
    Physics.renderer = Decorator('renderer', {

        /** belongs to: Physics.renderer
         * class Renderer
         *
         * The base class for renderers created by [[Physics.renderer]] factory function.
         **/

        /** internal
         * Renderer#init( options )
         * - options (Object): The configuration options passed by the factory
         *
         * Initialization. Internal use.
         **/
        init: function( options ){

            var self = this
                ,el = typeof options.el === 'string' ? document.getElementById(options.el) : options.el
                ;

            this.options = Physics.util.options(defaults);
            this.options( options );

            this.el = el ? el : document.body;
            this.container = el && el.parentNode ? el.parentNode : document.body;
            this.drawMeta = Physics.util.throttle( Physics.util.bind(this.drawMeta, this), this.options.metaRefresh );

            window.addEventListener('resize', Physics.util.throttle(function(){
                if ( self.options.autoResize ){
                    self.resize();
                }
            }), 100);
        },

        /**
         * Renderer#resize( [width, height] ) -> this
         * - width (Number): The width in px
         * - height (Number): The height in px
         *
         * Set the dimensions of the renderer.
         *
         * If no dimensions are specified it will auto resize.
         **/
        resize: function( width, height ){

            if ( width === undefined && height === undefined ){
                width = this.container.offsetWidth;
                height = this.container.offsetHeight;
            }

            this.width = width || 0;
            this.height = height || 0;
            // should be implemented in renderers
        },

        /**
         * Renderer#setWorld( world ) -> this
         * - world (Object): The world (or null)
         *
         * Set which world to apply to.
         *
         * Usually this is called internally. Shouldn't be a need to call this yourself usually.
         **/
        setWorld: function( world ){

            if ( this.disconnect && this._world ){
                this.disconnect( this._world );
            }

            this._world = world;

            if ( this.connect && world ){
                this.connect( world );
            }

            return this;
        },

        /**
         * Renderer#render( bodies, meta ) -> this
         * - bodies (Array): Array of bodies in the world (by reference!)
         * - meta (Object): meta information
         *
         * Render the world bodies and meta. Called by world.render()
         **/
        render: function( bodies, meta ){

            var body
                ,view
                ,pos
                ;

            if (this.beforeRender){

                this.beforeRender();
            }

            this._world.emit('beforeRender', {
                renderer: this,
                bodies: bodies,
                meta: meta
            });

            if (this.options.meta){
                this.drawMeta( meta );
            }

            this._interpolateTime = meta.interpolateTime;

            for ( var i = 0, l = bodies.length; i < l; ++i ){

                body = bodies[ i ];
                view = body.view || ( body.view = this.createView(body.geometry, body.styles) );

                if ( !body.hidden ){
                    this.drawBody( body, view );
                }
            }

            return this;
        },

        /**
         * Renderer#createView( geometry, styles ) -> Mixed
         * - geometry (Geometry): geometry The geometry
         * - styles (Object|String): The styles configuration
         * + (Mixed): Whatever the renderer needs to render the body.
         *
         * Create a view for the specified geometry.
         *
         * The view is used to render the body. It is a cached version
         * of the body that gets moved and rotated according to the simulation.
         *
         * The styles are used to modify the appearance of the view.
         * They depend on the renderer.
         *
         * Override this when creating renderers.
         **/
        createView: function( geometry, styles ){

            // example:
            // var el = document.createElement('div');
            // el.style.height = geometry.height + 'px';
            // el.style.width = geometry.width + 'px';
            // return el;
            throw 'You must override the renderer.createView() method.';
        },

        /**
         * Renderer#drawMeta( meta )
         * - meta (Object): The meta data
         *
         * Draw the meta data.
         *
         * The meta data will look like this:
         *
         * ```javascript
         * meta = {
         *     fps: 60, // the frames per second
         *     ipf: 4 // the number of iterations per frame
         * };
         * ```
         *
         * Override this when creating renderers.
         **/
        drawMeta: function( meta ){

            // example:
            // this.els.fps.innerHTML = meta.fps.toFixed(2);
            // this.els.steps.innerHTML = meta.steps;
            throw 'You must override the renderer.drawMeta() method.';
        },

        /**
         * Renderer#drawBody( body, view )
         * - body (Object): The body to draw
         * - view (Object): The view for the body
         *
         * Draw specified body using specified view.
         *
         * Override this when creating renderers.
         **/
        drawBody: function( body, view ){

            // example (pseudocode):
            // view.angle = body.state.angle
            // view.position = body.state.position
            throw 'You must override the renderer.drawBody() method.';
        }


    });

}());
