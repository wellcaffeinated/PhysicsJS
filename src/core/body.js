(function(){

    var vector = Physics.vector;

    // Service
    Physics.body = Decorator('body', {

        // prototype methods
        init: function( options ){

            // properties
            this.fixed = options.fixed || false;
            this.mass = options.mass || 1.0;
            // moment of inertia
            this.moi = 0;

            // placeholder for renderers
            this.view = null;

            // physical properties
            this.state = {
                pos: vector( options.x, options.y ),
                vel: vector( options.vx, options.vy ),
                acc: vector(),
                angular: {
                    pos: options.angle || 0,
                    vel: options.angularVelocity || 0,
                    acc: 0
                },
                old: {
                    pos: vector(),
                    vel: vector(),
                    acc: vector(),
                    angular: {
                        pos: 0,
                        vel: 0,
                        acc: 0
                    }
                }
            };

            // shape
            this.geometry = Physics.geometry('point');
        },

        accelerate: function( vect ){

            this.state.acc.vadd( vect );
            return this;
        },

        applyForce: function( vect ){

            this.accelerate( vect.clone().mult( 1/this.mass ) );
            return this;
        }
    });

}());