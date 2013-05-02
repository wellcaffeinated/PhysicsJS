// circle geometry
Physics.geometry('convex-polygon', function( parent ){

    var ERROR_NOT_CONVEX = 'Error: The vertices specified do not match that of a _convex_ polygon.';

    var defaults = {

        coreMargin: 5
    };

    return {

        init: function( options ){

            // call parent init method
            parent.init.call(this, options);
            options = Physics.util.extend({}, defaults, options);

            this.coreMargin = options.coreMargin;
            this.setVertices( options.vertices || [Physics.vector()] );
        },

        setVertices: function( hull ){

            var scratch = Physics.scratchpad()
                ,transl = scratch.transform()
                ,verts = this.vertices = []
                ;

            if ( !Physics.geometry.isPolygonConvex( hull ) ){
                throw ERROR_NOT_CONVEX;
            }

            transl.setRotation( 0 );
            transl.setTranslation( Physics.geometry.getPolygonCentroid( hull ).negate() )

            // translate each vertex so that the centroid is at the origin
            // then add the vertex as a vector to this.vertices
            for ( var i = 0, l = hull.length; i < l; ++i ){
                
                verts.push( Physics.vector( hull[ i ] ).translate( transl ) );
            }

            this._aabb = false;
            scratch.done();
            return this;
        },
        
        aabb: function(){

            if (this._aabb){
                return this._aabb.get();
            }

            var scratch = Physics.scratchpad()
                ,p = scratch.vector()
                ,xaxis = scratch.vector().clone(Physics.vector.axis[0])
                ,yaxis = scratch.vector().clone(Physics.vector.axis[1])
                ,xmax = this.getFarthestHullPoint( xaxis, p ).get(0)
                ,xmin = this.getFarthestHullPoint( xaxis.negate(), p ).get(0)
                ,ymax = this.getFarthestHullPoint( yaxis, p ).get(1)
                ,ymin = this.getFarthestHullPoint( yaxis.negate(), p ).get(1)
                ;

            this._aabb = new Physics.aabb( xmin, ymin, xmax, ymax );
            scratch.done();
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

            var verts = this.vertices
                ,val
                ,prev
                ,l = verts.length
                ,i = 2
                ;

            result = result || Physics.vector();

            if ( l < 2 ){
                return result.clone( verts[0] );
            }

            prev = verts[ 0 ].dot( dir );
            val = verts[ 1 ].dot( dir );

            if ( l === 2 ){
                return result.clone( (val >= prev) ? verts[ 1 ] : verts[ 0 ] );
            }

            if ( val >= prev ){
                // go up
                // search until the next dot product 
                // is less than the previous
                while ( i < l && val >= prev ){
                    prev = val;
                    val = verts[ i ].dot( dir );
                    i++;
                }

                if (val >= prev){
                    i++;
                }

                // return the previous (furthest with largest dot product)
                return result.clone( verts[ i - 2 ] );

            } else {
                // go down

                i = l;
                while ( i > 2 && prev >= val ){
                    i--;
                    val = prev;
                    prev = verts[ i ].dot( dir );
                }

                // return the previous (furthest with largest dot product)
                return result.clone( verts[ (i + 1) % l ] );                
            }
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

            var norm;
            result = this.getFarthestHullPoint( dir, result );

            // now scale it
            norm = result.norm();
            return result.normalize().mult( norm - this.coreMargin );
        }
    };
});
