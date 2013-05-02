(function(){

    var AABB = function AABB( minX, minY, maxX, maxY ){

        // enforce instantiation
        if ( !(this instanceof AABB) ){

            return new AABB( minX, minY, maxX, maxY );
        }

        this._pos = Physics.vector();
        
        this.set( minX, minY, maxX, maxY );
    };

    AABB.prototype.set = function set( minX, minY, maxX, maxY ){

        if ( Physics.util.isObject(minX) ){

            this._pos.clone( minX.pos );
            this._hw = minX.halfWidth;
            this._hh = minX.halfHeight;
            
            return this;
        }

        this._pos.set( 0.5 * (maxX + minX), 0.5 * (maxY + minY) );
        this._hw = 0.5 * (maxX - minX);
        this._hh = 0.5 * (maxY - minY);
        return this;
    };

    AABB.prototype.get = function get(){

        return {
            pos: this._pos.values(),
            halfWidth: this.halfWidth(),
            halfHeight: this.halfHeight()
        };
    };

    AABB.prototype.halfWidth = function halfWidth(){

        return this._hw;
    };

    AABB.prototype.halfHeight = function halfHeight(){

        return this._hh;
    };

    // check if point is inside bounds
    AABB.prototype.contains = function contains( pt ){

        return  (pt.get(0) > (this._pos.get(0) - this._hw)) && 
                (pt.get(0) < (this._pos.get(0) + this._hw)) &&
                (pt.get(1) > (this._pos.get(1) - this._hh)) &&
                (pt.get(1) < (this._pos.get(1) + this._hh));
    };

    // apply a transformation to both vectors
    AABB.prototype.transform = function transform( trans ){

        this._pos.transform( trans );
        return this;
    };

    Physics.aabb = AABB;
}());