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
            this._aabb = Physics.aabb();
        },
        
        aabb: function(){

            var r = this.radius
                ,aabb = this._aabb
                ;

            if ( aabb.halfWidth() === r ){
                // don't recalculate
                return aabb.get();
            }

            return aabb.set( -r, -r, r, r ).get();
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

            return result.clone( dir ).normalize().mult( this.radius );
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
        getFarthestCorePoint: function( dir, result ){

            result = result || Physics.vector();

            // we can use the center of the circle as the core object
            // because we can project a point to the hull in any direction
            // ... yay circles!
            return result.set( 0, 0 );
        }
    };
});
