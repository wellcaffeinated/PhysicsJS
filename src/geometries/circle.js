// circle geometry
Physics.geometry('circle', function( parent ){

    var defaults = {

        radius: 1.0
    };

    return {

        init: function( options ){

            // call parent init method
            parent.init.call(this, options);

            options = Physics.util.extend({}, defaults, options);

            this.radius = options.radius;
        },
        
        aabb: function(){

            return {
                halfWidth: this.radius,
                halfHeight: this.radius
            };
        },

        // get farthest point on the core object of this geometry 
        // along the direction vector "dir"
        // returns local coordinates
        // replace result if provided
        getFarthestHullPoint: function( dir, result ){

            result = result || Physics.vector();

            return result.clone( dir ).normalize().mult( this.radius );
        },

        // get farthest point on the core object of this geometry 
        // along the direction vector "dir"
        // returns local coordinates
        // replace result if provided
        getFarthestCorePoint: function( dir, result ){

            result = result || Physics.vector();

            // we can use the center of the circle as the core object
            // because we can project a point to the hull in any direction
            // ... yay circles!
            return result.set( 0, 0 );
        }
    };
});
