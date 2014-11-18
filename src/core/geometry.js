(function(){
    /** related to: Physics.util.decorator
     * Physics.geometry( name[, options] ) -> Geometry
     * - name (String): The name of the geometry to create
     * - options (Object): The configuration for that geometry ( depends on geometry ).
     *
     * Factory function for creating Geometries.
     *
     * Visit [the PhysicsJS wiki on Geometries](https://github.com/wellcaffeinated/PhysicsJS/wiki/Geometries)
     * for usage documentation.
     **/
    Physics.geometry = Decorator('geometry', {

        /** belongs to: Physics.geometry
         * class Geometry
         *
         * The base class for geometries created by [[Physics.geometry]] factory function.
         **/

        /** internal
         * Geometry#init( options )
         * - options (Object): The configuration options passed by the factory
         * 
         * Initialization. Internal use.
         **/
        init: function( options ){

            /** related to: Physics.util.options
             * Geometry#options( options ) -> Object
             * - options (Object): The options to set as an object
             * + (Object): The options
             * 
             * Set options on this instance. 
             * 
             * Access options directly from the options object.
             * 
             * Example:
             *
             * ```javascript
             * this.options.someOption;
             * ```
             * 
             **/
            this.options = Physics.util.options();
            this.options( options );

            this._aabb = new Physics.aabb();
        },
        
        /** related to: Physics.aabb
         * Geometry#aabb( angle ) -> Object
         * - angle (Number): The angle to rotate the geometry
         * + (Object): Bounding box values
         * 
         * Get axis-aligned bounding box for this object (rotated by angle if specified).
         **/
        aabb: function( angle ){

            return Physics.aabb.clone(this._aabb);
        },

        /**
         * Geometry#getFarthestHullPoint( dir[, result] ) -> Physics.vector
         * - dir (Physics.vector): Direction to look
         * - result (Physics.vector): A vector to write result to. Speeds up calculations.
         * + (Physics.vector): The farthest hull point in local coordinates
         * 
         * Get farthest point on the hull of this geometry
         * along the direction vector `dir`
         * returns local coordinates. Replaces result if provided.
         *
         * Assume all coordinates are relative to the geometry 
         * centroid (IE: in the body frame).
         * 
         * This should take a direction vector then it should
         * calculate the location (in that frame of reference)
         * of the point on the perimeter (hull) if you traveled
         * in a straight line from the centroid in the provided
         * direction. The result should be returned/set just like
         * it is in the other geometries.
         **/
        getFarthestHullPoint: function( dir, result ){

            result = result || new Physics.vector();

            // not implemented.
            return result.set( 0, 0 );
        },

        /** related to: Geometry#getFarthestHullPoint
         * Geometry#getFarthestCorePoint( dir[, result] ) -> Physics.vector
         * - dir (Physics.vector): Direction to look
         * - result (Physics.vector): A vector to write result to. Speeds up calculations.
         * + (Physics.vector): The farthest hull point in local coordinates
         * 
         * Get farthest point on the core shape of this geometry
         * along the direction vector `dir`
         * returns local coordinates. Replaces result if provided.
         *
         * This does almost the same thing as [[Geometry#getFarthestHullPoint]]
         * but shrinks the shape by subtracting "margin" from it.
         * Return the position of the point on the "core" shape.
         **/
        getFarthestCorePoint: function( dir, result, margin ){

            result = result || new Physics.vector();

            // not implemented.
            return result.set( 0, 0 );
        }
    });

}());