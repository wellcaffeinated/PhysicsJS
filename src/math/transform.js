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
    var Transform = function Transform( vect, angle, origin ) {

        if (!(this instanceof Transform)){
            return new Transform( vect, angle );
        }

        this.v = new Physics.vector();
        this.o = new Physics.vector(); // origin of rotation
        
        if ( vect instanceof Transform ){

            this.clone( vect );
            return;
        }

        if (vect){
            this.setTranslation( vect );
        }

        this.setRotation( angle || 0, origin );
    };

    /**
     * Physics.transform#setTranslation( vect ) -> this
     * - vect (Vectorish): The translation vector
     * 
     * Set the translation portion of the transform.
     **/
    Transform.prototype.setTranslation = function( vect ){

        this.v.clone( vect );
        return this;
    };

    /**
     * Physics.transform#setRotation( angle[, origin ] ) -> this
     * - angle (Number): Angle (radians) to use for rotation
     * - origin (Vectorish): Origin of the rotation
     *
     * Set the rotation portion of the transform
     **/
    Transform.prototype.setRotation = function( angle, origin ){

        this.cosA = Math.cos( angle );
        this.sinA = Math.sin( angle );

        if ( origin ){
            this.o.clone( origin );
        } else {
            this.o.zero();
        }

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

        if ( t ){

            this.setTranslation( t.v );
            this.cosA = t.cosA;
            this.sinA = t.sinA;
            this.o.clone( t.o );

            return this;
        }

        return new Transform( this );
    };

    Physics.transform = Transform;

})();