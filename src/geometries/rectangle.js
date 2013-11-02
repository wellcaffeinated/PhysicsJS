/**
 * Rectangle geometry
 * @module geometries/rectangle
 */
Physics.geometry('rectangle', function( parent ){

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

            this.vertices = options.vertices;
            this.h = options.h;
            this.w = options.w;
            this._area = this.h * this.w;
            this._aabb = false;
        },

        aabb: function (angle) {

            if (!angle && this._aabb){
                return this._aabb.get();
            }

            var a = angle || 0,
                s = Math.abs(Math.sin(a) / 2),
                c = Math.abs(Math.cos(a) / 2),
                ex = this.h*s + this.w* c, // x extent of AABB
                ey= this.h*c + this.w* s, // y extent of AABB
                aabb = new Physics.aabb({halfWidth: ex, halfHeight: ey });

            if (!angle){
                this._aabb = aabb;
            }

            return aabb.get();
        }
    };
});
