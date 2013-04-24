(function(){

    var Bounds = function Bounds( minX, minY, maxX, maxY ){

        // enforce instantiation
        if ( !(this instanceof Bounds) ){

            return new Bounds( minX, minY, maxX, maxY );
        }

        this.min = Physics.vector();
        this.max = Physics.vector();

        this.set( minX, minY, maxX, maxY );
    };

    Bounds.prototype.set = function set( minX, minY, maxX, maxY ){

        this.min.set( minX, minY );
        this.max.set( maxX, maxY );
    };

    Bounds.prototype.get = function get(){

        return {
            min: this._min.values(),
            max: this._max.values()
        };
    };

    // check if point is inside bounds
    Bounds.prototype.contains = function contains( pt ){

        return  (pt.get(0) > this.min.get(0)) && 
                (pt.get(0) < this.max.get(0)) &&
                (pt.get(1) > this.min.get(1)) &&
                (pt.get(1) < this.max.get(1));
    };

    Physics.bounds = Bounds;
}());