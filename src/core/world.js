/**
 * class Physics.world
 *
 * The world class and factory function.
 *
 * Example:
 *
 * ```javascript
 * Physics( cfg, function( world ) {
 *     // use world
 *     
 * }); // returns world
 * ```
 **/
(function(){

    var execCallbacks = function execCallbacks( fns, scope, args ){
        
        var fn
            ,ret
            ,cb = function(){
                return execCallbacks( fns, scope, args );
            }
            ;

        while ( fn = fns.shift() ){

            ret = fn.apply(scope, args);

            if (ret && ret.then){
                return ret.then( cb );
            }
        }
    };

    var defaults = {

        // default timestep
        timestep: 1000.0 / 160,
        // maximum number of iterations per step
        maxIPF: 16,
        webworker: false, // NOT YET IMPLEMENTED

        // default integrator
        integrator: 'verlet'
    };

    // begin world definitions
    
    /** alias of: Physics
     * new Physics.world([options, fn(world, Physics)])
     * - options (Object): configuration options
       - options.timestep (Number = 1000.0/160): default timestep
       ...
     * - fn (Function|Array): Callback function or array of callbacks called with this === world
     *
     * World Constructor.
     * 
     * If called with an array of functions, and any functions 
     * return a promise-like object, the remaining callbacks will 
     * be called only when that promise is resolved.
     **/
    var World = function World( cfg, fn ){

        // allow creation of world without "new"
        if (!(this instanceof World)){
            return new World( cfg, fn );
        }
        
        this.init( cfg, fn );
    };

    // extend pubsub
    World.prototype = Physics.util.extend({}, Physics.util.pubsub.prototype, {

        /** internal, see: new Physics.world
         * Physics.world#init( [options, fn(world, Physics)] )
         * - options (Object): configuration options (see constructor)
         * - fn (Function|Array): Callback function or array of callbacks called with this === world
         *
         * Initialization
         **/
        init: function( cfg, fn ){

            var self = this;

            if ( Physics.util.isFunction( cfg ) || Physics.util.isArray( cfg ) ){
                fn = cfg;
                cfg = {};
            }

            this._stats = {
               // statistics (fps, etc)
               fps: 0,
               ipf: 0 
            }; 
            this._bodies = [];
            this._behaviors = [];
            this._integrator = null;
            this._renderer = null;
            this._paused = false;
            this._opts = {};

            // set options
            this.options = Physics.util.options( defaults );
            this.options.onChange(function( opts ){

                // set timestep
                self.timeStep( opts.timestep );
            });
            this.options( cfg );

            // add integrator
            this.add(Physics.integrator( this.options.integrator ));

            // apply the callback function
            if ( Physics.util.isFunction( fn ) ){

                execCallbacks([ fn ], this, [this, Physics] );

            } else if ( Physics.util.isArray( fn ) ){

                execCallbacks(fn, this, [this, Physics] );
            }
        },

        /**
         * Physics.world#options( cfg ) -> Object
         * - options (Object): configuration options (see constructor)
         * + (Object): Options container
         *
         * Set config options. Also access options by `.options.<option>`.
         **/
        options: null,

        /** chainable
         * Physics.world#add( things ) -> this
         * - things (Object|Array): The thing, or array of things (body, behavior, integrator, or renderer) to add.
         * 
         * Multipurpose add method. Add one or many bodies, behaviors, integrators, renderers...
         **/
        add: function( arg ){

            var i = 0
                ,len = arg && arg.length || 0
                ,thing = len ? arg[ 0 ] : arg
                ;

            if ( !thing ){
                return this;
            }

            // we'll either cycle through an array
            // or just run this on the arg itself
            do {
                switch (thing.type){

                    case 'behavior':
                        this.addBehavior(thing);
                    break; // end behavior

                    case 'integrator':
                        this.integrator(thing);
                    break; // end integrator

                    case 'renderer':
                        this.renderer(thing);
                    break; // end renderer

                    case 'body':
                        this.addBody(thing);
                    break; // end body
                    
                    default:
                        throw 'Error: failed to add item of unknown type "'+ thing.type +'" to world';
                    // end default
                }

            } while ( ++i < len && (thing = arg[ i ]) );

            return this;
        },

        /** chainable
         * Physics.world#remove( things ) -> this
         * - things (Object|Array): The thing, or array of things (body, behavior, integrator, or renderer) to remove.
         * 
         * Multipurpose remove method. Remove one or many bodies, behaviors, integrators, renderers...
         **/
        remove: function( arg ){

            var i = 0
                ,len = arg && arg.length || 0
                ,thing = len ? arg[ 0 ] : arg
                ;

            if ( !thing ){
                return this;
            }

            // we'll either cycle through an array
            // or just run this on the arg itself
            do {
                switch (thing.type){

                    case 'behavior':
                        this.removeBehavior( thing );
                    break; // end behavior

                    case 'integrator':
                        if (thing === this._integrator){
                            this.integrator( null );
                        }
                    break; // end integrator

                    case 'renderer':
                        if (thing === this._renderer){
                            this.renderer( null );
                        }
                    break; // end renderer

                    case 'body':
                        this.removeBody( thing );
                    break; // end body
                    
                    default:
                        throw 'Error: failed to remove item of unknown type "'+ thing.type +'" from world';
                    // end default
                }

            } while ( ++i < len && (thing = arg[ i ]) );

            return this;
        },

        /** chainable
         * Physics.world#has( thing ) -> Boolean
         * - thing (Object): The thing to test
         * + (Boolean): `true` if thing is in the world, `false` otherwise.
         * 
         * Determine if a thing has been added to world.
         **/
        has: function( thing ){

            var arr
                ,i
                ,l
                ;

            if ( !thing ){
                return false;
            }

            switch (thing.type){

                case 'behavior':
                    arr = this._behaviors;
                break; // end behavior

                case 'integrator':
                return ( this._integrator === thing );
                // end integrator

                case 'renderer':
                return ( this._renderer === thing );
                // end renderer

                case 'body':
                    arr = this._bodies;
                break; // end body
                
                default:
                    throw 'Error: unknown type "'+ thing.type +'"';
                // end default
            }

            // check array
            return (Physics.util.indexOf( arr, thing ) > -1);
        },

        /** chainable
         * Physics.world#integrator( [integrator] ) -> Integrator|this
         * - integrator (Integrator): The integrator to set on the world
         * + (Integrator): The currently set integrator if `integrator` not specified
         * + (this): for chaining if `integrator` specified
         *
         * Get or Set the integrator
         **/
        integrator: function( integrator ){

            if ( integrator === undefined ){
                return this._integrator;
            }

            // do nothing if already added
            if ( this._integrator === integrator ){
                return this;
            }

            if ( this._integrator ){

                this._integrator.setWorld( null );

                this.emit( 'remove:integrator', {
                    integrator: this._integrator
                });
            }

            if ( integrator ){
                this._integrator = integrator;
                this._integrator.setWorld( this );

                this.emit( 'add:integrator', {
                    integrator: this._integrator
                });
            }

            return this;
        },

        /** chainable
         * Physics.world#renderer( [renderer] ) -> Renderer|this
         * - renderer (Renderer): The renderer to set on the world
         * + (Renderer): The currently set renderer if `renderer` not specified
         * + (this): for chaining if `renderer` specified
         *
         * Get or Set the renderer
         **/
        renderer: function( renderer ){

            if ( renderer === undefined ){
                return this._renderer;
            }

            // do nothing if renderer already added
            if ( this._renderer === renderer ){
                return this;
            }

            if ( this._renderer ){

                this._renderer.setWorld( null );

                this.emit( 'remove:renderer', {
                    renderer: this._renderer
                });
            }

            if ( renderer ){
                this._renderer = renderer;
                this._renderer.setWorld( this );

                this.emit( 'add:renderer', {
                    renderer: this._renderer
                });
            }

            return this;
        },

        /** chainable
         * Physics.world#timeStep( [dt] ) -> Number|this
         * - dt (Number): The time step for the world
         * + (Number): The currently set time step if `dt` not specified
         * + (this): for chaining if `dt` specified
         *
         * Get or Set the time step
         **/
        timeStep: function( dt ){

            if ( dt ){

                this._dt = dt;
                // calculate the maximum jump in time over which to do iterations
                this._maxJump = dt * this._opts.maxIPF;

                return this;
            }

            return this._dt;
        },

        /** chainable
         * Physics.world#addBehavior( behavior ) -> this 
         * - behavior (Behavior): The behavior to add
         *
         * Add a behavior to the world
         **/
        addBehavior: function( behavior ){

            var notify;

            // don't allow duplicates
            if ( this.has( behavior ) ){
                return this;
            }

            behavior.setWorld( this );
            this._behaviors.push( behavior );

            this.emit( 'add:behavior', {
                behavior: behavior
            });

            return this;
        },

        /**
         * Physics.world#getBehaviors() -> Array
         * + (Array): Array of behaviors
         *
         * Get copied list of behaviors in the world
         **/
        getBehaviors: function(){

            // return the copied array
            return [].concat(this._behaviors);
        },

        /** chainable
         * Physics.world#removeBehavior( behavior ) -> this 
         * - behavior (Behavior): The behavior to remove
         *
         * Remove a behavior from the world
         **/
        removeBehavior: function( behavior ){

            var behaviors = this._behaviors;

            if (behavior){
                
                for ( var i = 0, l = behaviors.length; i < l; ++i ){
                    
                    if (behavior === behaviors[ i ]){
                        
                        behaviors.splice( i, 1 );
                        behavior.setWorld( null );

                        this.emit( 'remove:behavior', {
                            behavior: behavior
                        });

                        break;
                    }
                }
            }

            return this;
        },

        /** chainable
         * Physics.world#addBody( body ) -> this 
         * - body (Body): The behavior to add
         *
         * Add a body to the world
         **/
        addBody: function( body ){

            var notify;

            // don't allow duplicates
            if ( this.has( body ) ){
                return this;
            }

            body.setWorld( this );
            this._bodies.push( body );

            this.emit( 'add:body', {
                body: body
            });

            return this;
        },

        /**
         * Physics.world#getBodies() -> Array
         * + (Array): Array of bodies
         *
         * Get copied list of bodies in the world
         **/
        getBodies: function(){

            // return the copied array
            return [].concat(this._bodies);
        },

        /** chainable
         * Physics.world#removeBody( body ) -> this 
         * - body (Body): The body to remove
         *
         * Remove a body from the world
         **/
        removeBody: function( body ){

            var bodies = this._bodies;

            if (body){
                
                for ( var i = 0, l = bodies.length; i < l; ++i ){
                    
                    if (body === bodies[ i ]){
                        
                        bodies.splice( i, 1 );
                        body.setWorld( null );

                        this.emit( 'remove:body', {
                            body: body
                        });

                        break;
                    }
                }
            }

            return this;
        },

        /** see: Physics.query
         * Physics.world#findOne( rules ) -> Body | false
         * Physics.world#findOne( filter(body) ) -> Body | false
         * - rules (Object): Query rules.
         * - filter (Function): Filter function called to check bodies
         * - body (Body): Each body in the world
         * 
         * Find first matching body based on query rules.
         **/
        findOne: function( rules ){

            var self = this
                ,fn = (typeof rules === 'function') ? rules : Physics.query( rules )
                ;

            return Physics.util.find( self._bodies, fn ) || false;
        },

        /** see: Physics.query
         * Physics.world#find( rules ) -> Array
         * Physics.world#find( filter(body) ) -> Array
         * - rules (Object): Query rules
         * - filter (Function): Filter function called to check bodies
         * - body (Body): Each body in the world
         * 
         * Find all matching bodies based on query rules.
         **/
        find: function( rules ){

            var self = this
                ,fn = (typeof rules === 'function') ? rules : Physics.query( rules )
                ;

            return Physics.util.filter( self._bodies, fn );
        },

        /** internal
         * Physics.world#iterate( dt )
         * - dt (Number): The timestep
         *
         * Do a single iteration.
         **/
        iterate: function( dt ){

            this._integrator.integrate( this._bodies, dt );
        },

        /** chainable
         * Physics.world#step( now ) -> this
         * - now (Number): now Current unix timestamp
         *
         * Do a single step.
         **/
        step: function( now ){
            
            if ( this._paused ){

                this._time = false;
                return this;
            }

            var time = this._time || (this._time = now)
                ,diff = now - time
                ,stats = this._stats
                ,dt = this._dt
                ;

            if ( !diff ){
                return this;
            }
            
            // limit number of iterations in each step
            if ( diff > this._maxJump ){

                this._time = now - this._maxJump;
                diff = this._maxJump;
            }

            // set some stats
            stats.fps = 1000/diff;
            stats.ipf = Math.ceil(diff/this._dt);

            while ( this._time < now ){
                this._time += dt;
                this.iterate( dt );
            }

            this.emit('step');
            return this;
        },

        /** chainable
         * Physics.world#render() -> this
         * 
         * Render current world state using the renderer
         **/
        render: function(){

            if ( !this._renderer ){
                throw "No renderer added to world";
            }
            
            this._renderer.render( this._bodies, this._stats );
            this.emit('render', {
                bodies: this._bodies,
                stats: this._stats,
                renderer: this._renderer
            });
            return this;
        },

        /** chainable
         * Physics.world#pause() -> this
         * 
         * Pause the world (step calls do nothing).
         **/
        pause: function(){

            this._paused = true;
            this.emit('pause');
            return this;
        },

        /** chainable
         * Physics.world#unpause() -> this
         * 
         * Unpause the world (step calls continue as usual).
         **/
        unpause: function(){

            this._paused = false;
            this.emit('unpause');
            return this;
        },

        /**
         * Physics.world#isPaused() -> Boolean
         * + (Boolean): Returns `true` if world is paused, `false` otherwise.
         * 
         * Determine if world is paused.
         **/
        isPaused: function(){

            return !!this._paused;
        },

        /**
         * Physics.world#destroy()
         * 
         * Destroy the world.
         * (Bwahahahahaha!)
         **/
        destroy: function(){

            var self = this;
            self.pause();

            // notify before
            this.emit('destroy');

            // remove all listeners
            self.off( true );
            // remove everything
            self.remove( self.getBodies() );
            self.remove( self.getBehaviors() );
            self.integrator( null );
            self.renderer( null );
        }

    });

    Physics.world = World;
    
}());