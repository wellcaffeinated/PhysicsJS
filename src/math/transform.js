(function(){

    /**
     * class Physics.transform
     *
     * Vector Transformations class for rotating and translating vectors
     **/

    /**
     * new Physics.transform( [vect, angle, origin] )
     * new Physics.transform( transform )
     * - vect (Vectorish): Translation vector
     * - transform (Physics.transform): Transform to copy
     * - angle (Number): Angle (radians) to use for rotation
     * - origin (Vectorish): Origin of the rotation
     *
     * Transform Constructor / Factory
     **/
    var Transform = function Transform( t ) {

        if (!(this instanceof Transform)){
            return new Transform( t );
        }

        // transformation matrix stored in two 3 el "rows"
        // last row is unnecessary
        this._ = window.Float64Array ? new Float64Array( 6 ) : [0, 0, 0, 0, 0, 0];
        this._[0] = this._[4] = 1;

        if ( t instanceof Transform ){

            this.clone( vect );
            return;
        }
    };

    Transform.prototype.toIdentity = function(){
        var T = this._;
        T[1] = T[2] = T[3] = T[5] = 0;
        T[0] = T[4] = 1;
        return this;
    };

    /**
     * Physics.transform#T( vect ) -> Physics.vector
     * - vect (Vectorish): The vector to transform
     *
     * Transform a vector.
     **/
    Transform.prototype.T = function( v ){
        var d = v._
            ,T = this._
            ,x
            ,y
            ;

        x = T[0] * d[0] + T[1] * d[1] + T[2];
        y = T[3] * d[0] + T[4] * d[1] + T[5];

        d[0] = x;
        d[1] = y;

        return v;
    };

    /**
     * Physics.transform#translate( vect ) -> this
     * - v (Physics.vector): Vector to add to translation
     *
     * Add a translation operation to the current stack
     **/
    Transform.prototype.translate = function( v ){
        this._[2] += v._[0];
        this._[5] += v._[1];
        return this;
    };

    /**
     * Physics.transform#rotate( angle[, origin ] ) -> this
     * - angle (Number): Angle (radians) to use for rotation
     * - origin (Vectorish): Origin of the rotation (pivot)
     *
     * Add a rotation operation to the current stack
     **/
    Transform.prototype.rotate = function( ang, origin ){

        if ( origin ){
            // translate origin
            this.translate( origin.negate() );
            // rotate in place
            this.rotate( ang );
            // translate origin back
            this.translate( origin.negate() );
            return this;
        }

        var T = this._
            ,s = Math.sin( ang )
            ,c = Math.cos( ang )
            ,t11 = c * T[0] - s * T[3]
            ,t12 = c * T[1] - s * T[4]
            ,t13 = c * T[2] - s * T[5]
            ,t21 = s * T[0] + c * T[3]
            ,t22 = s * T[1] + c * T[4]
            ,t23 = s * T[2] + c * T[5]
            ;

        T[0] = t11;
        T[1] = t12;
        T[2] = t13;
        T[3] = t21;
        T[4] = t22;
        T[5] = t23;

        return this;
    };

    /**
     * Physics.transform#clone( [transform] ) -> this|Physics.transform
     * - transform (Physics.transform): Transform to copy
     * + (this): For chaining
     * + (Physics.transform): New copy of `this` if none is specified as an argument
     *
     * Clone another transform. Or clone self into new transform.
     **/
    Transform.prototype.clone = function( t ){

        var T = this._;

        if ( t ){

            T[0] = t._[0];
            T[1] = t._[1];
            T[2] = t._[2];
            T[3] = t._[3];
            T[4] = t._[4];
            T[5] = t._[5];

            return this;
        }

        return new Transform( this );
    };

    Physics.transform = Transform;

})();
