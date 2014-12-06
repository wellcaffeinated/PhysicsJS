(function(){

    var defaults = {
        useVectors: false
    };

    var Stats = function( opts ){
        if ( !(this instanceof Stats) ){
            return new Stats( opts );
        }

        this.options = Physics.util.options( defaults );
        this.options( opts );

        this.n = 0;
        this.recalc = true;

        var getS;

        if ( this.options.useVectors ){

            this.mean = new Physics.vector();
            this._runningS = new Physics.vector();
            this._s = new Physics.vector();
            getS = function(){
                if ( !this.recalc ){
                    return this._s;
                }

                this.recalc = false;
                if (this.n <= 1){
                    return this._s.zero();
                }
                return this._s.clone( this._runningS ).mult( 1 / (this.n - 1) );
            }

        } else {
            this.mean = 0;
            this._runningS = 0;
            getS = function(){
                return (this.n > 1) ? this._runningS / (this.n - 1) : 0.0;
            };
        }

        /**
        * Physics.statistics#mean
        *
        * The running mean (number or vector).
        **/

        /**
         * Physics.statistics#s
         *
         * Getter property for the standard deviation.
         **/
        Object.defineProperties( this, {
            s: {
                get: getS
            }
        });
    };

    Stats.prototype = {

        /**
         * Physics.statistics.push( v )
         * - v (Number|Physics.vector): The value to push. (vector if options.useVectors is `true`)
         *
         * Push a value to the statistics.
         *
         * see: [http://www.johndcook.com/blog/standard_deviation](http://www.johndcook.com/blog/standard_deviation)
         */
        push: function push( v ){

            this.n++;
            this.recalc = true;

            if ( this.options.useVectors ){
                var invN = 1/this.n
                    ,x = v.get(0) - this.mean.get(0)
                    ,y = v.get(1) - this.mean.get(1)
                    ;

                // Mk = Mk-1+ (xk – Mk-1)/k
                // Sk = Sk-1 + (xk – Mk-1)*(xk – Mk).
                this.mean.add( x * invN, y * invN );

                x *= v.get(0) - this.mean.get(0);
                y *= v.get(1) - this.mean.get(1);

                this._runningS.add( x, y );

            } else {

                var x = v - this.mean;

                // Mk = Mk-1+ (xk – Mk-1)/k
                // Sk = Sk-1 + (xk – Mk-1)*(xk – Mk).
                this.mean += x / this.n;
                this._runningS += x * (v - this.mean);
            }
        },

        clear: function(){
            this.recalc = true;
            if ( this.options.useVectors ){
                this.n = 0;
                this.mean.zero();
                this._runningS.zero();
                this._s.zero();
            } else {
                this.n = 0;
                this.mean = 0;
                this._runningS = 0;
            }
        }
    };

    Physics.statistics = Stats;
})();
