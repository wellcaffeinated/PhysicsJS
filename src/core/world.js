(function(){

var defaults = {
    name: false,
    timestep: 1000.0 / 160,
    maxSteps: 16,
    webworker: false, // to implement
    integrator: 'verlet'
};

var World = function World( cfg, fn ){

    if (!(this instanceof World)){
        return new World( cfg, fn );
    }
    
    this.init( cfg, fn );
};

World.prototype = {

    init: function( cfg, fn ){

        // prevent double initialization
        this.init = true;

        this._stats = {
           // statistics (fps, etc)
           fps: 0,
           steps: 0 
        }; 
        this._bodies = [];
        this._behaviorStack = [];
        this._integrator = null;
        this._renderer = null;
        this._paused = false;
        this._opts = {};

        // set options
        this.options( cfg );

        // apply the callback function
        if (typeof fn === 'function'){

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

    // add objects, integrators, behaviors...
    add: function( arg ){

        var i = 0
            ,len = arg && arg.length || 0
            ,thing = len ? arg[ 0 ] : arg
            ;

        // we'll either cycle through an array
        // or just run this on the arg itself
        do {
            switch (thing.type){

                case 'behavior':
                    this.addBehavior(thing);
                break; // end behavior

                case 'integrator':
                    this._integrator = thing;
                break; // end integrator

                case 'renderer':
                    this._renderer = thing;
                break; // end renderer

                case 'body':
                    this.addBody(thing);
                break; // end body
                
                default:
                    throw 'Error: failed to add item of unknown type to world';
                break; // end default
            }
        } while ( ++i < len && (thing = arg[ i ]) )

        return this;
    },

    // add a behavior
    addBehavior: function( behavior ){

        // TODO more...
        this._behaviorStack.push( behavior );
        return this;
    },

    addBody: function( body ){

        this._bodies.push( body );
        return this;
    },

    applyBehaviors: function( dt ){

        var behaviors = this._behaviorStack
            ;

        for ( var i = 0, l = behaviors.length; i < l; ++i ){
            
            behaviors[ i ].behave( this._bodies, dt );
        }
    },

    // internal method
    substep: function( dt ){

        this._integrator.integrate( this._bodies, dt );
        this.applyBehaviors( dt );
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

        if ( !diff ) return this;
        
        // limit number of substeps in each step
        if ( diff > this._maxJump ){

            this._time = now - this._maxJump;
            diff = this._maxJump;
        }

        // set some stats
        stats.fps = 1000/diff;
        stats.steps = Math.ceil(diff/this._dt);

        while ( this._time < now ){
            this._time += dt;
            this.substep( dt );
        }

        return this;
    },

    render: function(){

        if ( !this._renderer ){
            throw "No renderer added to world";
        }
        
        this._renderer.render( this._bodies, this._stats );

        return this;
    },

    pause: function(){

        this._paused = true;
        return this;
    },

    unpause: function(){

        this._paused = false;
        return this;
    },

    isPaused: function(){

        return !!this._paused;
    },

    timeStep: function( dt ){

        if ( dt ){

            this._dt = dt;
            // calculate the maximum jump in time over which to do substeps
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