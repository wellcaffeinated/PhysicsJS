(function(){

    var AABB = function AABB( minX, minY, maxX, maxY ){

        // enforce instantiation
        if ( !(this instanceof AABB) ){

            return new AABB( minX, minY, maxX, maxY );
        }

        this._min = Physics.vector();
        this._max = Physics.vector();

        this.set( minX, minY, maxX, maxY );
    };

    AABB.prototype.set = function set( minX, minY, maxX, maxY ){

        if ( Physics.util.isObject(minX) ){

            this._min.set( minX.min.x, minX.min.y );
            this._max.set( minX.max.x, minX.max.y );

            if (minX.halfWidth){
                this._hw = minX.halfWidth;
                this._hh = minX.halfHeight;
            } else {
                this._hw = false;
                this._hh = false;
            }
            return this;
        }

        this._min.set( minX, minY );
        this._max.set( maxX, maxY );
        this._hw = false;
        this._hh = false;
        return this;
    };

    AABB.prototype.get = function get(){

        return {
            min: this._min.values(),
            max: this._max.values(),
            halfWidth: this.halfWidth(),
            halfHeight: this.halfHeight()
        };
    };

    AABB.prototype.halfWidth = function halfWidth(){

        if (this._hw === false){
            this._hw = 0.5 * (this._max.get(0) - this._min.get(0));
        }

        return this._hw;
    };

    AABB.prototype.halfHeight = function halfHeight(){

        if (this._hh === false){
            this._hh = 0.5 * (this._max.get(1) - this._min.get(1));
        }

        return this._hh;
    };

    // check if point is inside bounds
    AABB.prototype.contains = function contains( pt ){

        return  (pt.get(0) > this._min.get(0)) && 
                (pt.get(0) < this._max.get(0)) &&
                (pt.get(1) > this._min.get(1)) &&
                (pt.get(1) < this._max.get(1));
    };

    // apply a transformation to both vectors
    AABB.prototype.transform = function transform( trans ){

        this._min.transform( trans );
        this._max.transform( trans );
        return this;
    };

    Physics.aabb = AABB;
}());