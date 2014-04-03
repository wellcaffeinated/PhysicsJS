(function(){

    /**
     * Physics.aabb( minX, minY, maxX, maxY ) -> Object
     * Physics.aabb( pt1, pt2 ) -> Object
     * Physics.aabb( width, height[, pt] ) -> Object
     * - minX (Number): The x coord of the "top left" point
     * - minY (Number): The y coord of the "top left" point
     * - maxX (Number): The x coord of the "bottom right" point
     * - maxY (Number): The y coord of the "bottom right" point
     * - pt1 (Vectorish): The first corner
     * - pt2 (Vectorish): The opposite corner
     * - width (Number): The width of the bounding box
     * - height (Number): The height of the bounding box
     * - pt (Vectorish): The center point of the bounding box
     * + (Object): The bounding box. It's a simple object that has the following signature:
       ```javascript
       {
            x: Number, // the x coord of the center point
            y: Number, // the y coord of the center point
            hw: Number, // the half-width
            hh: Number, // the half-height
       }
       ```
     * 
     * Create an Axis Aligned Bounding Box.
     * 
     * @param {Object|Number} minX Either an object with the aabb values, or the minimum x value
     * @param {Number} minY Minimum y value
     * @param {Number} maxX Maximum x value
     * @param {Number} maxY Maximum y value
     **/
    Physics.aabb = function( minX, minY, maxX, maxY ){

        var aabb = {};

        if ( minX && minX.x !== undefined ){
            // we have a point specified as first arg
            maxX = minY.x;
            maxY = minY.y;
            minY = minX.y;
            minX = minX.x;
        }

        if ( maxX && maxX.x !== undefined ){
            // we have a point specified as the third arg
            // so we assume it's the center point
            aabb.x = maxX.x;
            aabb.y = maxX.y;
            aabb.hw = minX * 0.5;
            aabb.hh = minY * 0.5;

            // done
            return aabb;
        }

        // here, we should have all the arguments as numbers
        aabb.hw = Math.abs(maxX - minX) * 0.5;
        aabb.hh = Math.abs(maxY - minY) * 0.5;
        aabb.x = (maxX + minX) * 0.5;
        aabb.y = (maxY + minY) * 0.5;

        return aabb;
    };

    /**
     * Physics.aabb.contains( aabb, pt ) -> Boolean
     * - aabb (Object): The aabb
     * - pt (Vectorish): The point
     * + (Boolean): `true` if `pt` is inside `aabb`, `false` otherwise
     * 
     * Check if a point is inside an aabb.
     **/
    Physics.aabb.contains = function contains( aabb, pt ){

        return  (pt.x > (aabb.x - aabb.hw)) && 
                (pt.x < (aabb.x + aabb.hw)) &&
                (pt.y > (aabb.y - aabb.hh)) &&
                (pt.y < (aabb.y + aabb.hh));
    };

    /** 
     * Physics.aabb.clone( aabb ) -> Object
     * - aabb (Object): The aabb to clone
     * + (Object): The clone
     *
     * Clone an aabb.
     **/
    Physics.aabb.clone = function( aabb ){
        return {
            x: aabb.x,
            y: aabb.y,
            hw: aabb.hw,
            hh: aabb.hh
        };
    };

    /** 
     * Physics.aabb.overlap( aabb1, aabb2 ) -> Boolean
     * - aabb1 (Object): The first aabb
     * - aabb2 (Object): The second aabb
     * + (Boolean): `true` if they overlap, `false` otherwise
     *
     * Check if two AABBs overlap.
     **/
    Physics.aabb.overlap = function( aabb1, aabb2 ){

        var min1 = aabb1.x - aabb1.hw
            ,min2 = aabb2.x - aabb2.hw
            ,max1 = aabb1.x + aabb1.hw
            ,max2 = aabb2.x + aabb2.hw
            ;

        // first check x-axis
        
        if ( (min2 <= max1 && max1 <= max2) || (min1 <= max2 && max2 <= max1) ){
            // overlap in x-axis
            // check y...
            min1 = aabb1.y - aabb1.hh;
            min2 = aabb2.y - aabb2.hh;
            max1 = aabb1.y + aabb1.hh;
            max2 = aabb2.y + aabb2.hh;

            return (min2 <= max1 && max1 <= max2) || (min1 <= max2 && max2 <= max1);
        }

        // they don't overlap
        return false;
    };

}());