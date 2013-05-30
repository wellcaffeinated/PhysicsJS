(function(){

    // bodies, behaviors, integrators, and renderers all need the setWorld method
    var setWorld = function( world ){

        if ( this.disconnect && this._world ){
            this.disconnect( this._world );
        }

        this._world = world;

        if ( this.connect && world ){
            this.connect( world );
        }
    };

    Physics.util.each('body,behavior,integrator,renderer'.split(','), function( key, val ){

        Physics[ key ].mixin('setWorld', setWorld);
    });

    var PRIORITY_PROP_NAME = 'priority';

    var defaults = {
        name: false,
        timestep: 1000.0 / 160,
        maxSteps: 16,
        webworker: false, // to implement
        integrator: 'verlet'
    };

    // begin world definitions

    var World = function World( cfg, fn ){

        if (!(this instanceof World)){
            return new World( cfg, fn );
        }
        
        this.init( cfg, fn );
    };

    World.prototype = {

        init: function( cfg, fn ){

            if ( Physics.util.isFunction( cfg ) ){
                fn = cfg;
                cfg = {};
            }

            this._stats = {
               // statistics (fps, etc)
               fps: 0,
               steps: 0 
            }; 
            this._bodies = [];
            this._behaviors = [];
            this._integrator = null;
            this._renderer = null;
            this._paused = false;
            this._opts = {};
            this._pubsub = Physics.util.pubsub( this );

            // set options
            this.options( cfg || {} );

            // apply the callback function
            if ( Physics.util.isFunction( fn ) ){

                fn.apply(this, [ this ]);
            }
        },

        // get/set options
        options: function( cfg ){

            if (cfg){

                // extend the defaults
                Physics.util.extend(this._opts, defaults, cfg);
                // set timestep
                this.timeStep(this._opts.timestep);
                // add integrator
                this.add(Physics.integrator(this._opts.integrator));

                return this;
            }

            return Physics.util.extend({}, this._opts);
        },

        subscribe: function( topic, fn, scope, priority ){

            this._pubsub.subscribe( topic, fn, scope, priority );
            return this;
        },

        unsubscribe: function( topic, fn ){

            this._pubsub.unsubscribe( topic, fn );
            return this;
        },

        publish: function( data, scope ){

            this._pubsub.publish( data, scope );
            return this;
        },

        // add objects, integrators, behaviors...
        add: function( arg ){

            var i = 0
                ,len = arg && arg.length || 0
                ,thing = len ? arg[ 0 ] : arg
                ,notify
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
                        this.setIntegrator(thing);
                    break; // end integrator

                    case 'renderer':
                        this.addRenderer(thing);
                    break; // end renderer

                    case 'body':
                        this.addBody(thing);
                    break; // end body
                    
                    default:
                        throw 'Error: failed to add item of type '+ thing.type +' to world';
                    // end default
                }

                // notify
                notify = {
                    topic: 'add:' + thing.type
                };

                notify[ thing.type ] = thing;

                this.publish( notify );

            } while ( ++i < len && (thing = arg[ i ]) );

            return this;
        },

        setIntegrator: function( integrator ){

            if ( this._integrator ){

                this._integrator.setWorld( null );
            }

            this._integrator = integrator;
            this._integrator.setWorld( this );
        },

        getIntegrator: function(){

            return this._integrator;
        },

        addRenderer: function( renderer ){

            if ( this._renderer ){

                this._renderer.setWorld( null );
            }

            this._renderer = renderer;
            this._renderer.setWorld( this );
        },

        getRenderer: function(){

            return this._renderer;
        },

        // add a behavior
        addBehavior: function( behavior ){

            behavior.setWorld( this );
            this._behaviors.push( behavior );
            return this;
        },

        addBody: function( body ){

            body.setWorld( this );
            this._bodies.push( body );
            return this;
        },

        getBodies: function(){

            // return the copied array
            return [].concat(this._bodies);
        },

        findOne: function( query ){

            var list = {
                    check: function( arg ){
                        var fn = this;
                        while ( fn = fn.next ){

                            if ( fn( arg ) ){
                                return true;
                            }
                        }
                        return false;
                    }
                }
                ,test = list
                ,bodies = this._bodies
                ;

            // init tests
            if ( query.$within ){
                //aabb
            }
            if ( query.$at ){

                test.next = function( body ){

                    var aabb = body.aabb();
                    return Physics.aabb.contains( aabb, query.$at );
                };
            }

            // do search
            for ( var i = 0, l = bodies.length; i < l; ++i ){
                
                if (list.check( bodies[ i ] )){
                    return bodies[ i ];
                }
            }

            return false;
        },

        // internal method
        iterate: function( dt ){

            this._integrator.integrate( this._bodies, dt );
        },

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

            return this;
        },

        render: function(){

            if ( !this._renderer ){
                throw "No renderer added to world";
            }
            
            this._renderer.render( this._bodies, this._stats );
            this.publish({
                topic: 'render',
                bodies: this._bodies,
                renderer: this._renderer
            });
            return this;
        },

        pause: function(){

            this._paused = true;
            this.publish({
                topic: 'pause'
            });
            return this;
        },

        unpause: function(){

            this._paused = false;
            this.publish({
                topic: 'unpause'
            });
            return this;
        },

        isPaused: function(){

            return !!this._paused;
        },

        timeStep: function( dt ){

            if ( dt ){

                this._dt = dt;
                // calculate the maximum jump in time over which to do iterations
                this._maxJump = dt * this._opts.maxSteps;

                return this;
            }

            return this._dt;
        },

        // TODO: find bodies
        // select: function( sel ){

        //     if (!sel){

        //         // fast array copy
        //         return this._bodies.splice(0);
        //     }

        //     // TODO
        // }

        getByClassName: function( klass ){

            var bodies = this._bodies
                ,obj
                ,ret = []
                ;

            for ( var i = 0, l = bodies.length; i < l; ++i ){
                
                obj = bodies[ i ];

                if ( obj.hasClass( klass ) ){

                    ret.push( obj );
                }
            }

            return ret;
        }
    };

    Physics.world = World;
    
}());