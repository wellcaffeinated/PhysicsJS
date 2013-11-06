/**
 * Circle body definition
 * @module bodies/circle
 * @requires geometries/circle
 */
Physics.body('circle', function( parent ){

    var defaults = {
        radius: 1.0
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

            this.geometry = Physics.geometry('circle', {
                radius: options.radius
            });

            this.recalc();
        },

        /**
         * Recalculate properties. Call when body physical properties are changed.
         * @return {this}
         */
        recalc: function(){
            parent.recalc.call(this);
            // moment of inertia
            this.moi = this.mass * this.geometry.radius * this.geometry.radius / 2;
        }
    };
});
