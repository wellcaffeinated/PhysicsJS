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
            
        circles.push(
            Physics.body('circle', {
                x: viewWidth / 2,
                y: viewHeight / 2 - 240,
                vx: -0.15,
                mass: 1,
                radius: 30
            })
        );

        circles.push(
            Physics.body('circle', {
                x: viewWidth / 2,
                y: viewHeight / 2,
                radius: 50,
                mass: 20,
                vx: 0.007,
                vy: 0
            })
        );

        // add things to world
        world.add( circles );

        world.add( edgeBounce );
        world.add( Physics.behavior('body-impulse-response') );
        world.add( Physics.behavior('newtonian', { strength: .5 }) );
    };

    sim.title = "Newtonian orbit";
    sim.sourceUrl = "https://github.com/wellcaffeinated/PhysicsJS/blob/master/examples/sims/newtonian.js";

    return sim;
});