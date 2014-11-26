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

            this.children = [];
        },

        /**
         * CompoundGeometry#fromBodies( bodies ) -> this
         * - bodies (Array): List of bodies.
         *
         * Create a compound geometry from a list of bodies.
         **/
        fromBodies: function( bodies ){

            for ( var i = 0, b, l = bodies.length; i < l; i++ ) {
                b = bodies[ i ];
                this.addChild( b.geometry, b.state.pos );
            }

            return this;
        },

        /**
         * CompoundGeometry#addChild( geometry, pos ) -> this
         * - geometry (Geometry): The child to add.
         * - pos (Physics.vector): The position to add the child at.
         *
         * Add a child at relative position.
         **/
        addChild: function( geometry, pos ){

            this._aabb = null;
            this.children.push({
                g: geometry
                ,pos: new Physics.vector( pos )
            });

            return this;
        },

        /**
         * CompoundGeometry#clear() -> this
         *
         * Remove all children.
         **/
        clear: function(){

            this._aabb = null;
            this.children = [];

            return this;
        },

        // extended
        aabb: function( angle ){

            if (!angle && this._aabb){
                return Physics.aabb.clone( this._aabb );
            }

            var b
                ,aabb
                ,ch
                ,ret
                ,scratch = Physics.scratchpad()
                ,pos = Physics.vector()
                ;

            for ( var i = 0, l = this.children.length; i < l; i++ ) {
                ch = this.children[ i ];
                aabb = ch.g.aabb( angle );
                pos.clone( ch.pos );
                if ( angle ){
                    pos.rotate( angle );
                }
                aabb.x += pos._[0];
                aabb.y += pos._[1];
                ret = ret ? Physics.aabb.union(ret, aabb, true) : aabb;
            }

            if ( !angle ){
                // if we don't have an angle specified (or it's zero)
                // then we can cache this result
                this._aabb = Physics.aabb.clone( ret );
            }

            return scratch.done( ret );
        },

        // extended
        getFarthestHullPoint: function( dir, result ){

            var ch
                ,i
                ,l = this.children.length
                ,scratch = Physics.scratchpad()
                ,v = scratch.vector()
                ,len = 0
                ,maxlen = 0
                ;

            result = result || new Physics.vector();

            // find the one with the largest projection along dir
            for ( i = 0; i < l; i++ ) {
                ch = this.children[ i ];
                ch.g.getFarthestHullPoint( dir, v );
                len = v.vadd( ch.pos ).proj( dir );

                if ( len > maxlen ){
                    maxlen = len;
                    result.swap( v );
                }
            }

            return scratch.done( result );
        },

        // extended
        getFarthestCorePoint: function( dir, result, margin ){

            var ch
                ,i
                ,l = this.children.length
                ,scratch = Physics.scratchpad()
                ,v = scratch.vector()
                ,len = 0
                ,maxlen = 0
                ;

            result = result || new Physics.vector();

            // find the one with the largest projection along dir
            for ( i = 0; i < l; i++ ) {
                ch = this.children[ i ];
                ch.g.getFarthestCorePoint( dir, v, margin );
                len = v.vadd( ch.pos ).proj( dir );

                if ( len > maxlen ){
                    maxlen = len;
                    result.swap( v );
                }
            }

            return scratch.done( result );
        }
    };
});
