(function(){

    var ERROR_UNSUPPORTED_ARG = "Error: Unsupported argument";

    // Service
    Physics.geometry = Decorator('geometry', {

        // prototype methods
        init: function( options ){

            this._aabb = new Physics.aabb();
        },
        
        // get axis-aligned bounding box for this object (rotated by angle if specified).
        // Intended to be overridden.
        aabb: function( angle ){

            return this._aabb.get();
        },

        /**
         * Get farthest point on the hull of this geometry
         * along the direction vector "dir"
         * returns local coordinates
         * replaces result if provided
         * @param {Vector} dir Direction to look
         * @param {Vector} result (optional) A vector to write result to
         * @return {Vector} The farthest hull point in local coordinates
         */
        getFarthestHullPoint: function( dir, result ){

            result = result || Physics.vector();

            // not implemented.
            return result.set( 0, 0 );
        },

        /**
         * Get farthest point on the core of this geometry
         * along the direction vector "dir"
         * returns local coordinates
         * replaces result if provided
         * @param {Vector} dir Direction to look
         * @param {Vector} result (optional) A vector to write result to
         * @return {Vector} The farthest core point in local coordinates
         */
        getFarthestCorePoint: function( dir, result, margin ){

            result = result || Physics.vector();

            // not implemented.
            return result.set( 0, 0 );
        }
    });

}());