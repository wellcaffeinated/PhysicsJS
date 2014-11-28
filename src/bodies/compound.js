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

            this.mass = 0;
            this.moi = 0;

            this.children = [];
            this.geometry = Physics.geometry('compound');
            this.addChildren( options.children );
        },

        // extended
        connect: function( world ){
            // sanity check
            if ( this.mass <= 0 ){
                throw 'Can not add empty compound body to world.';
            }
        },

        addChild: function( body ){

            this.addChildren([ body ]);
            return this;
        },

        addChildren: function( bodies ){

            var self = this
                ,scratch = Physics.scratchpad()
                ,com = scratch.vector().zero()
                ,b
                ,pos
                ,i
                ,l = bodies && bodies.length
                ,M = 0
                ;

            if ( !l ){
                return scratch.done( this );
            }

            for ( i = 0; i < l; i++ ){
                b = bodies[ i ];
                // remove body from world if applicable
                if ( b._world ){
                    b._world.remove( b );
                }
                // add child
                this.children.push( b );
                // add child to geometry
                this.geometry.addChild( b.geometry, new Physics.vector(b.state.pos).vadd(b.offset), b.state.angular.pos );
                // calc com contribution
                pos = b.state.pos;
                com.add( pos._[0] * b.mass, pos._[1] * b.mass );
                M += b.mass;
            }

            // add mass
            this.mass += M;
            // com adjustment (assuming com is currently at (0,0) body coords)
            com.mult( 1 / this.mass );

            // all bodies need to move
            for ( i = 0, l = this.children.length; i < l; i++ ){
                b = this.children[ i ];
                b.state.pos.vsub( com );
            }

            for ( i = 0, l = this.geometry.children.length; i < l; i++ ){
                b = this.geometry.children[ i ];
                b.pos.vsub( com );
            }

            // shift everything back
            this.offset.vsub( com );

            // refresh view on next render

            if ( this._world ){
                this._world.one('render', function(){
                    self.view = null;
                });
            }
            this.recalc();

            return scratch.done( this );
        },

        /**
         * CompoundBody#clear() -> this
         *
         * Remove all children.
         **/
        clear: function(){

            this._aabb = null;
            this.moi = 0;
            this.mass = 0;
            this.offset.zero();
            this.children = [];
            this.geometry.clear();

            return this;
        },

        refreshGeometry: function(){

            this.geometry.clear();

            for ( var i = 0, l = this.children.length; i < l; i++ ) {
                b = this.children[ i ];
                this.geometry.addChild( b.geometry, new Physics.vector(b.state.pos).vadd(b.offset), b.state.angular.pos );
            }

            return this;
        },

        // extended
        recalc: function(){

            parent.recalc.call(this);
            // moment of inertia
            var b
                ,moi = 0
                ;

            for ( var i = 0, l = this.children.length; i < l; i++ ) {
                b = this.children[ i ];
                b.recalc();
                // parallel axis theorem
                moi += b.moi + b.mass * b.state.pos.normSq();
            }

            this.moi = moi;
            return this;
        }
    };
});
