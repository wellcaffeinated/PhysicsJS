/*
 * @requires geometries/compound
 */
 /**
  * class CompoundBody < Body
  *
  * Physics.body('compound')
  *
  * Body for convex polygons. The position of the body is the centroid of the polygon.
  *
  * Additional config options:
  *
  * - vertices: Array of [[Vectorish]] objects representing the polygon vertices in clockwise (or counterclockwise) order.
  *
  * Example:
  *
  * ```javascript
  * var thing = Physics.body('compound', {
  *     // place the centroid of the body at (300, 200)
  *     x: 300,
  *     y: 200,
  *     // the centroid is automatically calculated and used to position the shape
  *     children: [
  *         body1,
  *         body2,
  *         // ...
  *     ]
  * });
  * ```
  **/
Physics.body('compound', function( parent ){

    var defaults = {

    };

    return {

        // extended
        init: function( options ){

            // call parent init method
            parent.init.call(this, options);

            this.children = [];
            this.geometry = Physics.geometry('compound');
            this.addChildren( options.children );
        },

        addChild: function( body ){

            this.children.push( body );
            this.geometry.addChild( body.state.pos.x, body.state.pos.y, body.geometry );
            this.recalc();

            return this;
        },

        addChildren: function( arr ){

            this.geometry.addChildren( arr );
            this.recalc();

            return this;
        },

        clear: function(){
            this.children = [];
            this.geometry.clear();
            this.recalc();

            return this;
        },

        // extended
        recalc: function(){
            parent.recalc.call(this);
            // moment of inertia
            this.moi = Physics.geometry.getPolygonMOI( this.geometry.vertices );
        }
    };
});
