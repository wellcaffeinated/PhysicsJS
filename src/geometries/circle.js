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

        // get farthest point of this geometry along the direction vector "dir"
        // returns local coordinates
        // replace result if provided
        getFarthestPoint: function( dir, result ){

            result = result || Physics.vector();

            return result.normalize().mult( this.radius );
        }
    };
});
