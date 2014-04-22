/*
 * @requires geometries/rectangle
 */
 /**
  * class RectangleBody < Body
  *
  * Physics.body('rectangle')
  *
  * Body for rectangles. The position of the body is the centroid of the rectangle.
  *
  * Additional config options:
  *
  * - width: The width
  * - height: The height
  *
  * Example:
  *
  * ```javascript
  * var rect = Physics.body('rectangle', {
  *     // place the centroid of the rectangle at (300, 200)
  *     x: 300,
  *     y: 200,
  *     width: 30,
  *     height: 40
  * });
  * ```
  **/
Physics.body('rectangle', function( parent ){

    var defaults = {

    };

    return {

        // extended
        init: function( options ){

            // call parent init method
            parent.init.call(this, options);

            options = Physics.util.extend({}, defaults, options);

            this.geometry = Physics.geometry('rectangle', {
                width: options.width,
                height: options.height
            });

            this.recalc();
        },

        // extended
        recalc: function(){
            var w = this.geometry.width;
            var h = this.geometry.height;
            parent.recalc.call(this);
            // moment of inertia
            this.moi = ( w*w + h*h ) * this.mass / 12;
        }
    };
});
