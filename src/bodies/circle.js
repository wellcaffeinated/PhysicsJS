/*
 * @requires geometries/circle
 */
/** 
 * class CircleBody < Body
 *
 * Physics.body('circle')
 *
 * The circle body has a circular shape.
 *
 * Additional options include:
 * - radius: the radius
 *
 * Example:
 *
 * ```javascript
 * var round = Physics.body('circle', {
 *     x: 30,
 *     y: 20,
 *     radius: 5
 * });
 * ```
 **/
Physics.body('circle', function( parent ){

    var defaults = {
        radius: 1.0
    };

    return {

        // extended
        init: function( options ){

            // call parent init method
            parent.init.call(this, options);

            options = Physics.util.extend({}, defaults, options);

            this.geometry = Physics.geometry('circle', {
                radius: options.radius
            });

            this.recalc();
        },

        // extended
        recalc: function(){
            parent.recalc.call(this);
            // moment of inertia
            this.moi = this.mass * this.geometry.radius * this.geometry.radius / 2;
        }
    };
});
