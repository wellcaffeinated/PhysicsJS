(function(window){

    // http://jsperf.com/vector-storage-test/2

    // cached math functions
    // TODO: might be faster not to do this???
    var sqrt = Math.sqrt
        ,min = Math.min
        ,max = Math.max
        ,acos = Math.acos
        ,atan2 = Math.atan2
        ,TWOPI = Math.PI * 2
        ,typedArrays = !!window.Float64Array
        ;

    /**
     * class Physics.vector
     *
     * The vector class and factory function.
     *
     * Call `Physics.vector` with the same arguments as
     * [[new Physics.vector]] to create an instance.
     *
     * The vector methods mostly modify the vector instance.
     * This makes computations faster because creating vectors
     * is avoided.
     *
     * Creating vectors is generally an expensive operation
     * so try to avoid doing this in the simulation loop.
     * Instead you can use [[Physics.scratchpad]] to get
     * temporary vectors for use in performance critical
     * code.
     *
     * _Note_: The coordinate system is left-handed, meaning that
     * the clockwise angular direction is positive. This has implications
     * for the cross-product rule.
     **/

    /** section: Special
     * class Vectorish
     *
     * Any object with `.x` and `.y` properties.
     *
     * A `Vectorish` isn't really a class. In this documentation, when
     * an argument is specified as a `Vectorish` it means either a true
     * [[Physics.vector]] instance, or an object literal with `.x` and `.y`
     * properties.
     **/

    /**
     * new Physics.vector( x, y )
     * new Physics.vector( vect )
     * - x (Number): The x coordinate
     * - y (Number): The y coordinate
     * - vect (Vectorish): A vector-like object to clone
     *
     * Vector Constructor.
     **/
    var Vector = function Vector( x, y ) {

        // enforce instantiation
        if ( !(this instanceof Vector) ){

            return new Vector( x, y );
        }

        // arrays to store values
        // x = _[0]
        // y = _[1]
        // norm = _[3]
        // normsq = _[4]

        /** internal
         * Physics.vector#_
         *
         * Private storage array for data.
         *
         * Do not access this directly. Private. Keep out.
         **/
        if (typedArrays){
            this._ = new Float64Array(5);
        } else {
            this._ = [];
        }

        if (x && (x.x !== undefined || x._ && x._.length)){

            this.clone( x );

        } else {

            this.recalc = true; //whether or not recalculate norms
            this.set( x, y );
        }
    };

    Object.defineProperties( Vector.prototype, {
        /**
         * Physics.vector#x
         *
         * Getter/setter property for the x coordinate.
         **/
        x: {
            get: function(){
                return +this._[0];
            },
            set: function( x ){
                x = +x || 0;
                this.recalc = ( x === this._[0] );
                this._[0] = x;
            }
        },
        /**
         * Physics.vector#y
         *
         * Getter/setter property for the y coordinate.
         **/
        y: {
            get: function(){
                return +this._[1];
            },
            set: function( y ){
                y = +y || 0;
                this.recalc = ( y === this._[1] );
                this._[1] = y;
            }
        }
    });

    //
    // Methods
    //

    /**
     * Physics.vector#set( x, y ) -> this
     * - x (Number): x coordinate
     * - y (Number): y coordinate
     *
     * Sets the x and y components of this vector.
     **/
    Vector.prototype.set = function( x, y ) {

        this.recalc = true;

        this._[0] = +x || 0;
        this._[1] = +y || 0;
        return this;
    };

    /** deprecated: 0.6.0..1.0.0
     * Physics.vector#get( idx ) -> Number
     * - idx (Number): The coordinate index (0 or 1)
     *
     * Get the x or y component by index.
     **/
    Vector.prototype.get = function( n ){

        return this._[ n ];
    };

    /**
     * Physics.vector#vadd( v ) -> this
     * - v (Physics.vector): vector to add
     *
     * Add a [[Physics.vector]] to `this`.
     **/
    Vector.prototype.vadd = function( v ) {

        this.recalc = true;

        this._[0] += v._[0];
        this._[1] += v._[1];
        return this;
    };

    /**
     * Physics.vector#vsub( v ) -> this
     * - v (Physics.vector): vector to subtract
     *
     * Subtract a [[Physics.vector]] from `this`.
     **/
    Vector.prototype.vsub = function( v ) {

        this.recalc = true;

        this._[0] -= v._[0];
        this._[1] -= v._[1];
        return this;
    };

    /**
     * Physics.vector#add( x, y ) -> this
     * - x (Number): amount to add to the x coordinate
     * - y (Number): amount to add to the y coordinate
     *
     * Add scalars [[Physics.vector]] to the coordinates.
     **/
    Vector.prototype.add = function( x, y ){

        this.recalc = true;

        this._[0] += +x || 0;
        this._[1] += +y || 0;
        return this;
    };

    /**
     * Physics.vector#sub( x, y ) -> this
     * - x (Number): amount to subtract from the x coordinate
     * - y (Number): amount to subtract from the y coordinate
     *
     * Subtract scalars [[Physics.vector]] from the coordinates.
     **/
    Vector.prototype.sub = function( x, y ){

        this.recalc = true;

        this._[0] -= x;
        this._[1] -= y === undefined? 0 : y;
        return this;
    };

    /**
     * Physics.vector#mult( m ) -> this
     * - m (Number): amount to multiply this vector by
     *
     * Multiply this by a scalar quantity.
     *
     * Same as scaling the vector by an amount `m`.
     **/
    Vector.prototype.mult = function( m ) {

        if ( !this.recalc ){

            this._[4] *= m * m;
            this._[3] *= m;
        }

        this._[0] *= m;
        this._[1] *= m;
        return this;
    };

    /**
     * Physics.vector#dot( v ) -> Number
     * - v (Physics.vector): The other vector
     *
     * Compute the dot product of this vector with `v`.
     **/
    Vector.prototype.dot = function( v ) {

        return (this._[0] * v._[0]) + (this._[1] * v._[1]);
    };

    /**
     * Physics.vector#cross( v ) -> Number
     * - v (Physics.vector): The other vector
     *
     * Compute the (left-handed) cross product of this vector with `v`.
     **/
    Vector.prototype.cross = function( v ) {

        return ( - this._[0] * v._[1]) + (this._[1] * v._[0]);
    };

    /**
     * Physics.vector#proj( v ) -> Number
     * - v (Physics.vector): The other vector
     *
     * Compute the [scalar projection](http://en.wikipedia.org/wiki/Vector_projection#Scalar_projection_2) of this along `v`.
     **/
    Vector.prototype.proj = function( v ){

        return this.dot( v ) / v.norm();
    };


    /**
     * Physics.vector#vproj( v ) -> this
     * - v (Physics.vector): The other vector
     *
     * Compute the [vector projection](http://en.wikipedia.org/wiki/Vector_projection#Vector_projection_2) of this along `v` and copy the result into this vector.
     **/
    Vector.prototype.vproj = function( v ){

        var m = this.dot( v ) / v.normSq();
        return this.clone( v ).mult( m );
    };

    /**
     * Physics.vector#angle( [v] ) -> Number
     * - v (Physics.vector): The other vector
     * + (Number): The angle in radians between this vector and the x-axis OR `v` if specified
     *
     * Compute the angle between `this` and vector `v` or this and x axis.
     **/
    Vector.prototype.angle = function( v ){

        var ang;

        if ( this.equals( Vector.zero ) ){

            if ( v ){
                return v.angle();
            } else {
                return NaN;
            }

        } else {

            if ( v && !v.equals( Vector.zero ) ){
                ang = atan2( this._[1] * v._[0] - this._[0] * v._[1], this._[0] * v._[0] + this._[1] * v._[1]);
            } else {
                ang = atan2( this._[ 1 ], this._[ 0 ] );
            }
        }

        while (ang > Math.PI){
            ang -= TWOPI;
        }

        while (ang < -Math.PI){
            ang += TWOPI;
        }

        return ang;
    };

    /**
     * Physics.vector#angle2( left, right ) -> Number
     * - left (Physics.vector): The position on the left
     * - right (Physics.vector): The position on the right
     *
     * Compute the angle created between three points; left -> this -> right.
     **/
    Vector.prototype.angle2 = function( left, right ){

        var x1 = left._[0] - this._[0]
            ,y1 = left._[1] - this._[1]
            ,x2 = right._[0] - this._[0]
            ,y2 = right._[1] - this._[1]
            ,ang = atan2( y1 * x2 - x1 * y2, x1 * x2 + y1 * y2)
            ;

        while (ang > Math.PI){
            ang -= TWOPI;
        }

        while (ang < -Math.PI){
            ang += TWOPI;
        }

        return ang;
    };

    /**
     * Physics.vector#norm() -> Number
     *
     * Compute the norm (length) of this vector.
     **/
    Vector.prototype.norm = function() {

        if (this.recalc){
            this.recalc = false;
            this._[4] = (this._[0] * this._[0] + this._[1] * this._[1]);
            this._[3] = sqrt( this._[4] );
        }

        return this._[3];
    };

    /**
     * Physics.vector#normSq() -> Number
     *
     * Compute the norm (length) squared of this vector.
     **/
    Vector.prototype.normSq = function() {

        if (this.recalc){
            this.recalc = false;
            this._[4] = (this._[0] * this._[0] + this._[1] * this._[1]);
            this._[3] = sqrt( this._[4] );
        }

        return this._[4];
    };

    /**
     * Physics.vector#dist( v ) -> Number
     * - v (Physics.vector): The other vector
     *
     * Compute the distance from this vector to another vector `v`.
     **/
    Vector.prototype.dist = function( v ) {

        var dx, dy;
        return sqrt(
            (dx = (v._[0] - this._[0])) * dx +
            (dy = (v._[1] - this._[1])) * dy
        );
    };

    /**
     * Physics.vector#distSq( v ) -> Number
     * - v (Physics.vector): The other vector
     *
     * Compute the distance squared from this vector to another vector `v`.
     **/
    Vector.prototype.distSq = function( v ) {

        var dx, dy;
        return (
            (dx = (v._[0] - this._[0])) * dx +
            (dy = (v._[1] - this._[1])) * dy
        );
    };

    /**
     * Physics.vector#perp( [ccw] ) -> this
     * - ccw (Boolean): flag to indicate that we should rotate counterclockwise
     *
     * Change this vector into a vector that will be perpendicular.
     *
     * In other words, rotate by (+-) 90 degrees.
     **/
    Vector.prototype.perp = function( ccw ) {

        var tmp = this._[0]
            ;

        if ( ccw ){

            // x <-> y
            // negate y
            this._[0] = this._[1];
            this._[1] = -tmp;

        } else {

            // x <-> y
            // negate x
            this._[0] = -this._[1];
            this._[1] = tmp;
        }

        return this;
    };

    /**
     * Physics.vector#normalize() -> this
     *
     * Normalise this vector, making it a unit vector.
     **/
    Vector.prototype.normalize = function() {

        var m = this.norm();

        // means it's a zero Vector
        if ( m === 0 ){
            return this;
        }

        m = 1/m;

        this._[0] *= m;
        this._[1] *= m;

        this._[3] = 1.0;
        this._[4] = 1.0;

        return this;
    };

    /**
     * Physics.vector#transform( t ) -> this
     * - t (Physics.transform): The transformation to apply
     *
     * Apply a [[Physics.transform]] to this vector.
     **/
    Vector.prototype.transform = function( t ){

        var sinA = t.sinA
            ,cosA = t.cosA
            ,x = t.o._[ 0 ]
            ,y = t.o._[ 1 ]
            ;

        this._[ 0 ] -= x;
        this._[ 1 ] -= y;

        // rotate about origin "o" then translate
        return this.set(
            this._[ 0 ] * cosA - this._[ 1 ] * sinA + x + t.v._[ 0 ],
            this._[ 0 ] * sinA + this._[ 1 ] * cosA + y + t.v._[ 1 ]
        );
    };

    /**
     * Physics.vector#transformInv( t ) -> this
     * - t (Physics.transform): The transformation to apply the inverse of
     *
     * Apply an inverse [[Physics.transform]] to this vector.
     **/
    Vector.prototype.transformInv = function( t ){

        var sinA = t.sinA
            ,cosA = t.cosA
            ,x = t.o._[ 0 ]
            ,y = t.o._[ 1 ]
            ;

        this._[ 0 ] -= x + t.v._[ 0 ];
        this._[ 1 ] -= y + t.v._[ 1 ];

        // inverse translate then inverse rotate about origin "o"
        return this.set(
            this._[ 0 ] * cosA + this._[ 1 ] * sinA + x,
            - this._[ 0 ] * sinA + this._[ 1 ] * cosA + y
        );
    };

    /**
     * Physics.vector#rotate( t ) -> this
     * Physics.vector#rotate( ang[, o] ) -> this
     * - t (Physics.transform): The transformation to apply the rotational part of
     * - ang (Number): The angle (in radians), to rotate by
     * - o (Vectorish): The point of origin of the rotation
     *
     * Rotate this vector.
     *
     * An angle and rotation origin can be specified,
     * or a transform can be specified and only the rotation
     * portion of that transform will be applied
     **/
    Vector.prototype.rotate = function( t, o ){

        var sinA
            ,cosA
            ,x = 0
            ,y = 0
            ;

        if ( typeof t === 'number' ){
            sinA = Math.sin( t );
            cosA = Math.cos( t );

            if ( o ){
                x = o.x;
                y = o.y;
            }
        } else {
            sinA = t.sinA;
            cosA = t.cosA;

            x = t.o._[ 0 ];
            y = t.o._[ 1 ];
        }

        this._[ 0 ] -= x;
        this._[ 1 ] -= y;

        return this.set(
            this._[ 0 ] * cosA - this._[ 1 ] * sinA + x,
            this._[ 0 ] * sinA + this._[ 1 ] * cosA + y
        );
    };

    /**
     * Physics.vector#rotateInv( t ) -> this
     * - t (Physics.transform): The transformation to apply the inverse rotational part of
     *
     * Apply the inverse rotation of a transform.
     *
     * Only the inverse rotation portion of
     * that transform will be applied.
     **/
    Vector.prototype.rotateInv = function( t ){

        return this.set(
            (this._[ 0 ] - t.o._[ 0 ]) * t.cosA + (this._[ 1 ] - t.o._[ 1 ]) * t.sinA + t.o._[ 0 ],
            -(this._[ 0 ] - t.o._[ 0 ]) * t.sinA + (this._[ 1 ] - t.o._[ 1 ]) * t.cosA + t.o._[ 1 ]
        );
    };

    /**
     * Physics.vector#translate( t ) -> this
     * - t (Physics.transform): The transformation to apply the translational part of
     *
     * Apply the translation of a transform.
     *
     * Only the translation portion of
     * that transform will be applied.
     **/
    Vector.prototype.translate = function( t ){

        return this.vadd( t.v );
    };

    /**
     * Physics.vector#translateInv( t ) -> this
     * - t (Physics.transform): The transformation to apply the inverse translational part of
     *
     * Apply the inverse translation of a transform.
     *
     * Only the inverse translation portion of
     * that transform will be applied.
     **/
    Vector.prototype.translateInv = function( t ){

        return this.vsub( t.v );
    };


    /**
     * Physics.vector#clone( [v] ) -> this|Physics.vector
     * - v (Vectorish): The vector-like object to clone
     * + (this): If `v` is specified as an argument
     * + (Physics.vector): A new vector instance that clones this vector, if no argument is specified
     *
     * Create a clone of this vector, or clone another vector into this instance.
     *
     * This is especially useful in vector algorithms
     * that use temporary vectors (which most should).
     * You can create temporary vectors and then do things like...
     * ```
     * temp.clone( otherVector );
     * // compute things with temp...
     * // then save the result
     * result.clone( tmp );
     * ```
     **/
    Vector.prototype.clone = function( v ) {

        // http://jsperf.com/vector-storage-test

        if ( v ){

            if (!v._){

                return this.set( v.x, v.y );
            }

            this.recalc = v.recalc;

            if (!v.recalc){
                this._[3] = v._[3];
                this._[4] = v._[4];
            }

            this._[0] = v._[0];
            this._[1] = v._[1];

            return this;
        }

        return new Vector( this );
    };

    /**
     * Physics.vector#swap( v ) -> this
     * - v (Physics.vector): The other vector
     *
     * Swap values with other vector.
     **/
    Vector.prototype.swap = function( v ){

        var _ = this._;
        this._ = v._;
        v._ = _;

        _ = this.recalc;
        this.recalc = v.recalc;
        v.recalc = _;
        return this;
    };

    /**
     * Physics.vector#values() -> Object
     *
     * Get the coordinate values as an object literal.
     **/
    Vector.prototype.values = function(){

        return {
            x: this._[0],
            y: this._[1]
        };
    };


    /**
     * Physics.vector#zero() -> this
     *
     * Set the coordinates of this vector to zero.
     **/
    Vector.prototype.zero = function() {

        this._[3] = 0.0;
        this._[4] = 0.0;

        this._[0] = 0.0;
        this._[1] = 0.0;
        return this;
    };

    /**
     * Physics.vector#negate() -> this
     *
     * Flip this vector in the opposite direction.
     **/
    Vector.prototype.negate = function( component ){

        if (component !== undefined){

            this._[ component ] = -this._[ component ];
            return this;
        }

        this._[0] = -this._[0];
        this._[1] = -this._[1];
        return this;
    };

    /**
     * Physics.vector#clamp( minV, maxV ) -> this
     * - minV (Vectorish): The minimum vector
     * - maxV (Vectorish): The maximum vector
     *
     * Constrain vector components to minima and maxima.
     *
     * The vector analog of [scalar clamping](http://en.wikipedia.org/wiki/Clamping_(graphics)).
     **/
    Vector.prototype.clamp = function( minV, maxV ){

        this._[0] = min(max(this._[0], minV.x), maxV.x);
        this._[1] = min(max(this._[1], minV.y), maxV.y);
        this.recalc = true;
        return this;
    };

    /**
     * Physics.vector#toString() -> String
     *
     * Get a formatted string of this vector's coordinates.
     **/
    Vector.prototype.toString = function(){

        return '('+this._[0] + ', ' + this._[1]+')';
    };


    /**
     * Physics.vector#equals( v ) -> Boolean
     * - v (Physics.vector): The other vector
     *
     * Determine if this vector equals another.
     **/
    Vector.prototype.equals = function( v ){

        return this._[0] === v._[0] &&
            this._[1] === v._[1] &&
            this._[2] === v._[2];
    };

    /**
     * Physics.vector.axis = Array
     *
     * Read-only axis vectors for general reference.
     *
     * Example:
     *
     * ```javascript
     * Physics.vector.axis[0]; // The x axis unit vector
     * Physics.vector.axis[1]; // The y axis unit vector
     * ```
     **/
    Vector.axis = [
        new Vector(1.0, 0.0),
        new Vector(0.0, 1.0)
    ];

    /**
     * Physics.vector.zero = zeroVector
     *
     * Read-only zero vector for reference
     **/
    Vector.zero = new Vector(0, 0);

    // assign
    Physics.vector = Vector;

}(this)); // end Vector class
