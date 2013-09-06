/**
 * Constant acceleration behavior
 * @module behaviors/constant-acceleration
 */
Physics.behavior('constant-acceleration', function( parent ){

    var defaults = {

        acc: { x : 0, y: 0.0004 }
    };

    return {

        /**
         * Initialization
         * @param  {Object} options Configuration object
         * @return {void}
         */
        init: function( options ){

            parent.init.call(this, options);

            // extend options
            this.options = Physics.util.extend(this.options, defaults, options);
            this._acc = Physics.vector();
            this.setAcceleration( this.options.acc );
        },

        /**
         * Set the acceleration of the behavior
         * @param {Vectorish} acc The acceleration vector
         * @return {self}
         */
        setAcceleration: function( acc ){

            this._acc.clone( acc );
            return this;
        },

        /**
         * Callback run on integrate:positions event
         * @param  {Object} data Event data
         * @return {void}
         */
        behave: function( data ){

            var bodies = data.bodies;

            for ( var i = 0, l = bodies.length; i < l; ++i ){
                
                bodies[ i ].accelerate( this._acc );
            }
        }
    };
});