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
                restitution: 0.99,
                cof: 0.99
            })
            ;

        $(window).on('resize', function(){

            viewWidth = $win.width();
            viewHeight = $win.height();
            viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
            edgeBounce.setAABB( viewportBounds );

        }).trigger('resize');

        // begin
        var circles = [];
            
        for ( var i = 0, l = 180; i < l; ++i ){
            
            circles.push(
                Physics.body('circle', {
                    x: Physics.util.random(10, viewWidth - 10),
                    y: Physics.util.random(10, viewHeight - 10),
                    mass: 1,
                    radius: 4,
                    vx: Physics.util.random(0.01) - 0.005,
                    vy: Physics.util.random(0.01) - 0.005,
                    restitution: 0.99
                })
            );
        }

        // add things to world
        world.add( circles );

        world.add( edgeBounce );
        world.add( Physics.behavior('body-impulse-response') );
        world.add( Physics.behavior('newtonian', { strength: .01 }) );
        world.add( Physics.behavior('sweep-prune') );
        world.add( Physics.behavior('body-collision-detection', { checkAll: false }) );
    };

    sim.title = "Newton's Revenge";
    sim.sourceUrl = "https://github.com/wellcaffeinated/PhysicsJS/blob/master/examples/sims/newtons-revenge.js";

    return sim;
});