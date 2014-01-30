/**
 * Newtonian attraction between bodies (inverse square law)
 * @module behaviors/newtonian
 */
Physics.behavior('newtonian', function( parent ){

    var defaults = {

        strength: 1,
        // max distance to apply it to
        max: false, // infinite
        // min distance to apply it to
        min: false // auto calc
    };

    return {

        /**
         * Initialization
         * @param  {Object} options Configuration object
         * @return {void}
         */
        init: function( options ){

            var self = this;
            // call parent init method
            parent.init.call( this );
            this.options.defaults( defaults );
            this.options.onChange(function( opts ){
                self._maxDistSq = opts.max === false ? Infinity : opts.max * opts.max;
                self._minDistSq = opts.min ? opts.min * opts.min : 100 * opts.strength;
            });
            this.options( options );
        },
        
        /**
         * Apply newtonian acceleration between all bodies
         * @param  {Object} data Event data
         * @return {void}
         */
        behave: function( data ){

            var bodies = this.getTargets()
                ,body
                ,other
                ,strength = this.options.strength
                ,minDistSq = this._minDistSq
                ,maxDistSq = this._maxDistSq
                ,scratch = Physics.scratchpad()
                ,pos = scratch.vector()
                ,normsq
                ,g
                ;

            for ( var j = 0, l = bodies.length; j < l; j++ ){
                
                body = bodies[ j ];

                for ( var i = j + 1; i < l; i++ ){
                    
                    other = bodies[ i ];
                    // clone the position
                    pos.clone( other.state.pos );
                    pos.vsub( body.state.pos );
                    // get the square distance
                    normsq = pos.normSq();

                    if (normsq > minDistSq && normsq < maxDistSq){

                        g = strength / normsq;

                        body.accelerate( pos.normalize().mult( g * other.mass ) );
                        other.accelerate( pos.mult( body.mass/other.mass ).negate() );
                    }
                }
            }

            scratch.done();
        }
    };
});
