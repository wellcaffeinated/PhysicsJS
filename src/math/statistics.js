(function(){

    Physics.statistics = {
        /**
         * Physics.statistics.pushRunningAvg( v, k, m, s ) -> Array
         * - v (Number): is value to push
         * - k (Number): is num elements
         * - m (Number): is current mean
         * - s (Number): is current s value
         * + (Array): Returns a 2 element array containing the next mean, and s value
         *
         * Push a value to a running average calculation.
         * see [http://www.johndcook.com/blog/standard_deviation]
         *
         * Note: variance can be calculated from the "s" value by multiplying it by `1/(k-1)`
         **/
        pushRunningAvg: function( v, k, m, s ){

            var x = v - m;

            // Mk = Mk-1+ (xk – Mk-1)/k
            // Sk = Sk-1 + (xk – Mk-1)*(xk – Mk).
            m += x / k;
            s += x * (v - m);
            return [m, s];
        },

        /**
        * Physics.statistics.pushRunningVectorAvg( v, k, m[, s] )
        * - v (Physics.vector): is vector to push
        * - k (Number): is num elements
        * - m (Physics.vector): is current mean
        * - s (Physics.vector): is current s value
        *
        * Push a vector to a running vector average calculation.
        * see [http://www.johndcook.com/blog/standard_deviation]
        *
        * Calculations are done in place. The `m` and `s` parameters are altered.
        *
        * Note: variance can be calculated from the "s" vector by multiplying it by `1/(k-1)`
        *
        * If s value is ommitted it won't be used.
        **/
        pushRunningVectorAvg: function( v, k, m, s ){
            var invK = 1/k
                ,x = v.get(0) - m.get(0)
                ,y = v.get(1) - m.get(1)
                ;

            // Mk = Mk-1+ (xk – Mk-1)/k
            // Sk = Sk-1 + (xk – Mk-1)*(xk – Mk).
            m.add( x * invK, y * invK );

            if ( s ){
                x *= v.get(0) - m.get(0);
                y *= v.get(1) - m.get(1);

                s.add( x, y );
            }
        }
    };
})();
