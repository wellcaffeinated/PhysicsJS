(function(){
    
    /**
     * Vector Transformations class for rotating and translating vectors
     * @class Transform
     */

    /**
     * Transform Constructor / Factory
     * @param {Physics.vector|Physics.transform} vect (optional) vector to use for translation or a transform to copy
     * @param {Number} angle (optional) Angle (radians) to use for rotation
     */
    var Transform = function Transform( vect, angle ) {

        if (!(this instanceof Transform)){
            return new Transform( vect, angle );
        }

        this.v = Physics.vector();
        this.angle = 0;

        if ( vect instanceof Transform ){

            this.clone( vect );
        }

        if (vect){
            this.setTranslation( vect );
        }

        this.setRotation( angle || 0 );
    };

    /**
     * Set the translation portion of the transform
     * @param {Physics.vector} vect
     */
    Transform.prototype.setTranslation = function( vect ){

        this.v.clone( vect );
        return this;
    };

    /**
     * Set the rotation portion of the transform
     * @param {Number} angle
     */
    Transform.prototype.setRotation = function( angle ){

        this.angle = 0;
        this.cosA = Math.cos( angle );
        this.sinA = Math.sin( angle );
        return this;
    };

    /**
     * Clone another transform. Or clone self into new transform.
     * @param  {Physics.transform} t (optional) the transform to clone
     * @return {Physics.transform|this}
     */
    Transform.prototype.clone = function( t ){

        if ( t ){

            this.setTranslation( t.v );
            this.setRotation( t.angle );

            return this;
        }

        return new Transform( this );
    };

    Physics.transform = Transform;

})();