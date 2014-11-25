/**
 * class CompoundGeometry < Geometry
 *
 * Physics.geometry('compound')
 *
 * Geometry for compound shapes.
 *
 * Additional config options:
 *
 * - children: children
 *
 * Example:
 *
 * ```javascript
 * var thing = Physics.geometry('compound', {
 *     // the centroid is automatically calculated and used to position the shape
 *     vertices: [
 *         { x: 0, y: -30 },
 *         { x: -29, y: -9 },
 *         { x: -18, y: 24 },
 *         { x: 18, y: 24 },
 *         { x: 29, y: -9 }
 *     ]
 * });
 * ```
 **/
Physics.geometry('compound', function( parent ){

    var ERROR_NOT_CONVEX = 'Error: The vertices specified do not match that of a _convex_ polygon.';

    var defaults = {

    };

    return {

        // extended
        init: function( options ){

            var self = this;

            // call parent init method
            parent.init.call(this, options);

            this.options.defaults( defaults );
            this.options( options );

        },

        // extended
        aabb: function( angle ){

            if (!angle && this._aabb){
                return Physics.aabb.clone( this._aabb );
            }

            var scratch = Physics.scratchpad()
                ,p = scratch.vector()
                ,trans = scratch.transform().setRotation( angle || 0 )
                ,xaxis = scratch.vector().set( 1, 0 ).rotateInv( trans )
                ,yaxis = scratch.vector().set( 0, 1 ).rotateInv( trans )
                ,xmax = this.getFarthestHullPoint( xaxis, p ).proj( xaxis )
                ,xmin = - this.getFarthestHullPoint( xaxis.negate(), p ).proj( xaxis )
                ,ymax = this.getFarthestHullPoint( yaxis, p ).proj( yaxis )
                ,ymin = - this.getFarthestHullPoint( yaxis.negate(), p ).proj( yaxis )
                ,aabb
                ;

            aabb = Physics.aabb( xmin, ymin, xmax, ymax );

            if (!angle){
                // if we don't have an angle specified (or it's zero)
                // then we can cache this result
                this._aabb = Physics.aabb.clone( aabb );
            }

            scratch.done();
            return aabb;
        },

        // extended
        getFarthestHullPoint: function( dir, result, data ){

            var verts = this.vertices
                ,val
                ,prev
                ,l = verts.length
                ,i = 2
                ,idx
                ;

            result = result || new Physics.vector();

            return result;
        },

        // extended
        getFarthestCorePoint: function( dir, result, margin ){

            var norm
                ,scratch = Physics.scratchpad()
                ,next = scratch.vector()
                ,prev = scratch.vector()
                ,verts = this.vertices
                ,l = verts.length
                ,mag
                ,sign = this._area > 0
                ,data = {}
                ;

            scratch.done();
            return result;
        }
    };
});
