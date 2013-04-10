(function(){

    // Service
    Physics.body = Decorator('body', {

        // prototype methods
        init: function( options ){

            var vector = Physics.vector;

            // properties
            this.fixed = options.fixed || false;
            this.mass = options.mass || 1.0;
            this.restitution = options.restitution || 1.0;
            // moment of inertia
            this.moi = 0.0;

            // placeholder for renderers
            this.view = null;

            // physical properties
            this.state = {
                pos: vector( options.x, options.y ),
                vel: vector( options.vx, options.vy ),
                acc: vector(),
                angular: {
                    pos: options.angle || 0.0,
                    vel: options.angularVelocity || 0.0,
                    acc: 0.0
                },
                old: {
                    pos: vector(),
                    vel: vector(),
                    acc: vector(),
                    angular: {
                        pos: 0.0,
                        vel: 0.0,
                        acc: 0.0
                    }
                }
            };

            if (this.mass === 0){
                throw "Error: Bodies must have non-zero mass";
            }

            this.tmp = vector();

            // shape
            this.geometry = Physics.geometry('point');
        },

        accelerate: function( acc ){

            this.state.acc.vadd( acc );
            return this;
        },

        // p relative to center of mass
        applyForce: function( force, p ){

            var r = this.tmp
                ,state
                ;
                
            // if no point at which to apply the force... apply at center of mass
            if ( !p ){
                
                this.accelerate( r.clone( force ).mult( 1/this.mass ) );

            } else if ( this.moi ) {

                // apply torques
                state = this.state;
                r.clone( p );
                // r cross F
                this.state.angular.acc -= r.cross( force ) / this.moi;
                // projection of force towards center of mass
                this.applyForce( force );

            }

            return this;
        }
    });

}());