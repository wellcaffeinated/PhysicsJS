/** 
 * class ConstantAccelerationBehavior < Behavior
 *
 * `Physics.behavior('constant-acceleration')`.
 *
 * Constant acceleration behavior.
 *
 * Basically the "gravity" behavior. Used to give "earth-like gravity" to the world.
 *
 * Additional options include:
 * - acc: The acceleration vector (Vectorish). (default: `{ x: 0, y: 0.0004 }`)
 **/
Physics.behavior('constant-acceleration', function( parent ){

    var defaults = {

        acc: { x : 0, y: 0.0004 }
    };

    return {

        // extended
        init: function( options ){

            parent.init.call( this );
            this.options.defaults( defaults );
            this.options( options );

            // extend options
            this._acc = new Physics.vector();
            this.setAcceleration( this.options.acc );
            delete this.options.acc;
        },

        /**
         * ConstantAccelerationBehavior#setAcceleration( acc ) -> this
         * - acc (Vectorish): The acceleration vector
         * 
         * Set the acceleration of the behavior.
         **/
        setAcceleration: function( acc ){

            this._acc.clone( acc );
            return this;
        },

        // extended
        behave: function( data ){

            var bodies = this.getTargets();

            for ( var i = 0, l = bodies.length; i < l; ++i ){
                
                bodies[ i ].accelerate( this._acc );
            }
        }
    };
});