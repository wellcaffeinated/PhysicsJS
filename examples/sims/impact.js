define([
    
    'jquery'

], function(
    $
){
    var sim = function( world, Physics ){

        var $win = $(window)
            ,viewWidth = $win.width()
            ,viewHeight = $win.height()
            ,viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight)
            ,edgeBounce = Physics.behavior('edge-collision-detection', {
                aabb: viewportBounds,
                restitution: 0.2,
                cof: 0.8
            })
            ,square = [
                {x: 0, y: 40},
                {x: 40, y: 40},
                {x: 40, y: 0},
                {x: 0, y: 0}
            ]
            ;

        
        // projectile
        projectile = Physics.body('circle', {
            x: -20,
            y: viewHeight - 150,
            vx: 2,
            mass: 4,
            radius: 20,
            restitution: 0.99,
            angularVelocity: 0
        });
        
        // squares
        var squares = [];
        for ( var i = 0, l = 24; i < l; ++i ){
            
            squares.push( Physics.body('convex-polygon', {
                vertices: square,
                x: 42 * (i / 6 | 0) + viewWidth - 40 * 8,
                y: 40 * (i % 6) + viewHeight - 40 * 6 + 15,
                vx: 0,
                cof: 0.99,
                restitution: 0.99,
                fixed: false
            }));
        }

        // delay the launching
        world.subscribe('render', function( data ){

            setTimeout(function(){
                
                world.add( projectile );

            }, 2000);

            // only run once
            world.unsubscribe( data.topic, data.handler );

        }, null, 100);

        $(window).on('resize', function(){

            viewWidth = $win.width();
            viewHeight = $win.height();
            viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
            edgeBounce.setAABB( viewportBounds );

        }).trigger('resize');

        world.add( squares );
        world.add( Physics.behavior('body-collision-detection', { checkAll: false }) );
        world.add( Physics.behavior('sweep-prune') );
        world.add( Physics.behavior('body-impulse-response') );

        world.add( edgeBounce );

        // add gravity
        world.add( Physics.behavior('constant-acceleration') );
    };

    sim.title = "Supermarket Catastrophy";
    sim.sourceUrl = "https://github.com/wellcaffeinated/PhysicsJS/blob/master/examples/sims/impact.js";

    return sim;
});