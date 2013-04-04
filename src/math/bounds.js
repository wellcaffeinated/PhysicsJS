(function(){

    var vector = Physics.vector;
    
    var Bounds = function Bounds( minX, minY, maxX, maxY ){

        // enforce instantiation
        if ( !(this instanceof Bounds) ){

            return new Bounds( minX, minY, maxX, maxY );
        }

        this.set( minX, minY, maxX, maxY );
    };

    Bounds.prototype.set = function( minX, minY, maxX, maxY ){

        this._minX = minX;
        this._minY = minY;
        this._maxX = maxX;
        this._maxY = maxY;
    };

    Bounds.prototype.get = function( minX, minY, maxX, maxY ){

        this._minX = minX;
        this._minY = minY;
        this._maxX = maxX;
        this._maxY = maxY;
    };    

    Physics.bounds = Bounds;
}());