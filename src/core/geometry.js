(function(){

    // Service
    Physics.geometry = Decorator('geometry', {

        // prototype methods
        init: function( options ){

        },
        
        // get axis-aligned bounding box for this object
        // to be overridden
        aabb: function(){

            return {
                halfWidth: 0,
                halfHeight: 0
            };
        },

        // get farthest point of this geometry along the direction vector "dir"
        // returns local coordinates
        // replace result if provided
        getFarthestPoint: function( dir, result ){

            result = result || Physics.vector();

            // not implemented.
            return result.set( 0, 0 );
        }
    });

}());