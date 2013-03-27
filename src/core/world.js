(function(Physics){

var defaults = {
    name: false,
    steps: 4,
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
        this.init = false;
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
            Physics.util.extend(this.opts, defaults, cfg);
            // add integrator
            this.add(Physics.integrator(this.opts.integrator));

            return this;
        }

        return Physics.util.extend({}, this.opts);
    },

    // add objects, integrators, behaviours...
    add: function( arg ){

        var i = 0
            ,len = arg && arg.length || 0
            ,thing = len ? arg[ 0 ] : arg
            ;

        // we'll either cycle through an array
        // or just run this on the arg itself
        do {
            switch (thing.type){

                case 'behaviour':
                break; // end behaviour

                case 'integrator':
                break; // end integrator

                // assume physical object
                default:
                break; // end default
            }
        } while ( ++i < len && (thing = arg[ i ]) )

        return this;
    },

    // TODO: find objects
    // select: function( sel ){

    //     if (!sel){

    //         // fast array copy
    //         return this.objects.splice(0);
    //     }

    //     // TODO
    // }

    getByClassName: function( klass ){

        var objects = this.objects
            ,obj
            ,ret = []
            ;

        for ( var i = 0, l = objects.length; i < l; ++i ){
            
            obj = objects[ i ];

            if ( obj.hasClass( klass ) ){

                ret.push( obj );
            }
        }

        return ret;
    }
};

Physics.world = World;
    
}(Physics));