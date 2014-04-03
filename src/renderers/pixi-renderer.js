/**
 * A PIXI renderer
 * Renders physics object with PIXI components
 * @module renderers/pixi
 */
 /* global PIXI */
Physics.renderer('pixi', function( proto ){

    if ( !document ){
        // must be in node environment
        return {};
    }
    
    var Pi2 = Math.PI * 2;

    var defaults = {

        // draw aabbs of bodies for debugging
        debug: false,
        // the element to place meta data into
        metaEl: null,
        offset: {x: 0, y: 0},
        // Provide some default colours
        styles: {
            // Defines the default canvas colour
            color: 0x66FF99,
            
            'point' : '0xE8900C',
            
            'circle' : {
                strokeStyle: '0xE8900C',
                lineWidth: 3,
                fillStyle: '0xD5DE4C',
                angleIndicator: '0xE8900C'
            },
            
            'convex-polygon' : {
                strokeStyle: '0xE8900C',
                lineWidth: 3,
                fillStyle: '0xD5DE4C',
                angleIndicator: '0xE8900C'
            }
        }
    };

    // deep copy callback to extend deeper into options
    var deep = function( a, b ){

        if ( Physics.util.isPlainObject( b ) ){

            return Physics.util.extend({}, a, b, deep );
        }

        return b !== undefined ? b : a;
    };

    return {

        /**
         * Initialization
         * @param  {Object} options Config options passed by initializer
         * @return {void}
         */
        init: function( options ){

            if (typeof PIXI === 'undefined') {
                throw "PIXI obj not present - cannot continue ";
            }
                
            // call proto init
            proto.init.call(this, options);

            // further options
            this.options = Physics.util.extend({}, defaults, this.options, deep);
            this.options.offset = Physics.vector( this.options.offset );

            // Hook in PIXI stage here
            this.stage = new PIXI.Stage(this.options.styles.color);
            this.renderer = new PIXI.autoDetectRenderer(this.options.width, this.options.height);
            
            // Create empty meta object for use later
            this.meta = {};
            
            // add the renderer view element to the DOM according to its type
            if ( this.el.nodeName === 'CANVAS' ){
                this.renderer = new PIXI.autoDetectRenderer(this.options.width, this.options.height, this.el);
            } else {
                this.renderer = new PIXI.autoDetectRenderer(this.options.width, this.options.height);

                if ( this.el !== null ) {
                    this.el.appendChild(this.renderer.view);
                } else {
                    document.body.appendChild(this.renderer.view);
                }
            }
        },
        
        /**
        * Loads textures defined in a spritesheet
        * @param  {Array} assetsToLoad Array of spritesheets to load
        * @param  {Function} callback Function to call when loading is complete
        * @return {void}
        */
        loadSpritesheets: function ( assetsToLoad, callback ){
            if (!assetsToLoad instanceof Array) {
                throw "Spritesheets must be defined in arrays";
            }
            
            var loader = new PIXI.AssetLoader(assetsToLoad);
            
            // Start loading resources!
            loader.load();
            var self = this;
            
            loader.on('onComplete', function(evt){
                self.assetsLoaded = true;
                callback();
            });
        },

        /**
         * Draw a PIXI.DisplayObject to the stage
         * @param  {DisplayObject} body      The body to render
         * @return {void}
         */
        drawBody: function( body ){
            if (body.view !== null){
                // Draw a body here
                var view = body.view;
                var x = body.state.pos.x;
                var y = body.state.pos.y;
                var angle = body.state.angular.pos;
                
                view.position.x = x;
                view.position.y = y;
                view.rotation = angle;
                
                this.renderer.render(this.stage);
            }
        },
        /**
         * Create a circle for use in PIXI stage
         * @param  {Number} x      The x coord
         * @param  {Number} y      The y coord
         * @param  {Number} r      The circle radius
         * @param  {Object|String} styles The styles configuration
         * @return {PIXI.Graphics} A graphic object representing a stage
         */
        createCircle: function(x, y, r, style){
            
            var graphics = new PIXI.Graphics();
            graphics.beginFill(style.fillStyle);
            graphics.lineStyle(style.lineWidth, style.strokeStyle);
            graphics.drawCircle(x, y, r);
            // Center the graphics to the circle
            graphics.pivot.x = (x / 2) + (r / 2);
            graphics.pivot.y = (y / 2) + (r / 2);
            return graphics;
        },
        /**
         * Creates a polygon for PIXI
         * @param  {Array} verts  Array of vectorish vertices
         * @param  {Object|String} styles The styles configuration
         * @param  {Canvas2DContext} ctx    (optional) The canvas context
         * @return {PIXI.Graphics} a graphic object representing a polygon
         */
        createPolygon: function(verts, styles){
        
            var vert = verts[0]
                ,x = vert.x
                ,y = vert.y
                ,l = verts.length
                ;
            var start = {
                x: x,
                y: y
            };
            var graphics = new PIXI.Graphics();
            
            graphics.beginFill(styles.fillStyle);
            graphics.lineStyle(styles.lineWidth, styles.strokeStyle);
        
            graphics.moveTo(x, y);
            
            for ( var i = 1; i < l; ++i ){
                
                vert = verts[ i ];
                x = vert.x;
                y = vert.y;
                graphics.lineTo(x, y);
            }
            
            if (l > 2){
                graphics.lineTo(start.x, start.y);
            }
            
            graphics.endFill();
            return graphics;
        },
        /**
         * Draw a line onto specified canvas context
         * @param  {Vectorish} from   Starting point
         * @param  {Vectorish} to     Ending point
         * @param  {Object|String} styles The styles configuration
         * @return {PIXI.Graphics} a graphics object representing a line
         */
        createLine: function(from, to, styles){
        
            var x = from.x
                ,y = from.y
                ;
        
            var graphics = new PIXI.Graphics();
            graphics.beginFill(styles.fillStyle);
            graphics.lineStyle(styles.lineWidth, styles.strokeStyle);
        
            graphics.moveTo(x, y);
        
            x = to.x;
            y = to.y;
            
            graphics.lineTo(x, y);
            
            graphics.endFill();
            return graphics;
        },
        /**
         * Create a view for specified geometry.
         * @param  {Geometry} geometry The geometry
         * @return {PIXI.DisplayObject}    An image cache of the geometry
         */
        createView: function( geometry ){

            var view = null
                ,aabb = geometry.aabb()
                ,hw = aabb.hw + Math.abs(aabb.x)
                ,hh = aabb.hh + Math.abs(aabb.y)
                ,x = hw + 1
                ,y = hh + 1
                ,name = geometry.name
                ;
            
            var styles = styles || this.options.styles[ name ];
            
            x += styles.lineWidth | 0;
            y += styles.lineWidth | 0;
            
            if (name === 'circle'){
            
                view = this.createCircle(x, y, geometry.radius, styles);
            
            } else if (name === 'convex-polygon'){
            
                view = this.createPolygon(geometry.vertices, styles);
            }
            
            if (styles.angleIndicator){
                
                view.beginFill(styles.angleIndicator);
                view.moveTo((x / 2), (5 + styles.lineWidth));
                view.lineTo((x / 2) + (geometry.radius / 2), geometry.radius);
                // Center the graphics to the circle
                view.endFill();
                
            }
            if (view) {
                this.stage.addChild(view);
                return view;
            } else {
                throw "Invalid view name passed.";
            }

        },

        /**
         * Draw the meta data
         * @param  {Object} meta The meta data
         * @return {void}
         */
        drawMeta: function( meta ){
            if (!this.meta.loaded){
                // define the font style here
                var fontStyles = {
                    font: "18px Snippet", 
                    fill: "white", 
                    align: "left"
                };
                this.meta.fps = new PIXI.Text('FPS: ' + meta.fps.toFixed(2), fontStyles);
                this.meta.fps.position.x = 15;
                this.meta.fps.position.y = 5;
                
                this.meta.ipf = new PIXI.Text('IPF: ' + meta.ipf, fontStyles);
                this.meta.ipf.position.x = 15;
                this.meta.ipf.position.y = 30;
                
                this.stage.addChild(this.meta.fps);
                this.stage.addChild(this.meta.ipf);
                this.meta.loaded = true;
            } else {
                this.meta.fps.setText('FPS: ' + meta.fps.toFixed(2));
                this.meta.ipf.setText('IPF: ' + meta.ipf);
            }
        },

        /**
         * Callback to be run before rendering
         * @private
         * @return {void}
         */
        beforeRender: function(){

            // Do pre-rendering things here (clear stage?)
        },
        /**
         * Create a view for specified geometry.
         * @param  {String} type The type of PIXI.DisplayObject to make
         * @param  {Object} options The specific options to apply to the view
         * @return {PIXI.DisplayObject} An object that is renderable
         */
        createDisplay: function( type, options ){
            var view = null
                ,texture = null
                ;
            switch (type){
                // Create a sprite object
                case 'sprite':
                    texture = PIXI.Texture.fromImage(options.texture);
                    view = new PIXI.Sprite(texture);
                    if (options.anchor ) {
                        view.anchor.x = options.anchor.x;
                        view.anchor.y = options.anchor.y;
                    }
                    // If a container is specified, use add to that container
                    if (options.container) {
                        options.container.addChild(view);
                    } else {
                        // Otherwise just add the view to the stage
                        this.stage.addChild(view);
                    }
                    return view;
                // Create a movieclip object
                case 'movieclip':
                    if (!this.assetsLoaded) {
                        throw "No assets have been loaded. Use loadSpritesheet() first";
                    }
                    var tex = []
                        ,i = 0
                        ;
                    // Populate our movieclip
                    for (i; i < options.frames.length; i++) {
                        texture = PIXI.Texture.fromFrame(options.frames[i]);
                        tex.push(texture);
                    }
                    view = new PIXI.MovieClip(tex);
                    if (options.anchor ) {
                        view.anchor.x = options.anchor.x;
                        view.anchor.y = options.anchor.y;
                    }
                    // If a container is specified, use add to that container
                    if (options.container) {
                        options.container.addChild(view);
                    } else {
                        // Otherwise just add the view to the stage
                        this.stage.addChild(view);
                    }
                    return view;
                // Create a default case
                default: 
                    throw 'Invalid PIXI.DisplayObject passed';
            }
        },
        /**
        * Helper function
        * Centers the anchor to {x: 0.5, y: 0.5} of a view
        * @param  {PIXI.DisplayObject} view The view to center the anchor
        * @return {void}
        */
        centerAnchor: function( view ) {
            if (view !== null){
                view.anchor.x = 0.5;
                view.anchor.y = 0.5;
            }
        }
    };
});
