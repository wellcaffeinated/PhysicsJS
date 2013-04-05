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

    Bounds.prototype.set = function( minX, minY, maxX, maxY ){

        this.min.set( minX, minY );
        this.max.set( maxX, maxY );
    };

    Bounds.prototype.get = function(){

        return {
            min: this._min.values(),
            max: this._max.values()
        };
    };    

    Physics.bounds = Bounds;
}());