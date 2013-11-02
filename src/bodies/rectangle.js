/**
 * Rectangle body definition
 * @module bodies/rectangle
 * @requires geometries/convex-polygon
 */
Physics.body('rectangle', function( parent ){

    var defaults = {

    };

    return {

        /**
         * Initialization
         * @param  {Object} options Configuration options
         * @return {void}
         */
        init: function( options ){

            // call parent init method
            parent.init.call(this, options);

            options = Physics.util.extend({}, defaults, options);

            var x, y, width, height, verts;

            x = options.x || 0;
            y = options.y || 0;
            width = options.width || 0;
            height = options.height || 0;

            verts = [
                {x: 0 - width/2, y: 0 - height/2},
                {x: 0 - width/2, y: height - height/2},
                {x: width - width/2, y: height - height/2},
                {x: width - width/2, y: 0 - height/2}
            ];

            this.geometry = Physics.geometry('rectangle', {
                vertices: verts,
                h: height,
                w: width
            });

            this.recalc();
        },

        /**
         * Recalculate properties. Call when body physical properties are changed.
         * @return {this}
         */
        recalc: function(){
            parent.recalc.call(this);
            // moment of inertia - candidate for optimization...
            // this.moi = Physics.geometry.getPolygonMOI( this.geometry.vertices );
            this.moi = (this.geometry.h * this.geometry.h +
                this.geometry.w * this.geometry.w) / 12;
        }
    };
});
