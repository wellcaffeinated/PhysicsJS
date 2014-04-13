/** alias of: Body
 * class PointBody < Body
 *
 * Physics.body('point')
 *
 * The point body represents a point.
 **/
Physics.body('point', function( parent ){
    return {
        init: function( opts ){
            parent.init.call( this, opts );
            this.moi = 0;
        }
    };
});
