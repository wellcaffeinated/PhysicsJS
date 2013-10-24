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
                x: 400,
                y: 100,
                vx: 0,
                radius: 30
            })
        );

        circles.push(
            Physics.body('circle', {
                x: 160,
                y: 300,
                radius: 45,
                mass: 2,
                vx: 0.05,
                vy: -0.15,
                angularVelocity: 0.01
            })
        );

        circles.push(
            Physics.body('circle', {
                x: Physics.util.random(60, 400),
                y: Physics.util.random(500),
                radius: 60,
                mass: 1.5,
                vx: 0.25,
                vy: .1
            })
        );

        // add things to world
        world.add( circles );

        // Add a rectangle
        world.add(Physics.body('rectangle', {
            x: 500,
            y: 40,
            height: 300,
            width: 200,
            angularVelocity: 0.01
        }));

        // Add a rectangle
        world.add(Physics.body('convex-polygon', {
            x: 20,
            y: 40,
            vertices: [
                {x: 0, y: 0},
                {x: 0, y: 300},
                {x: 200, y: 300},
                {x: 200, y: 0}
            ],
            angularVelocity: 0
        }));

        world.add( edgeBounce );
        world.add( Physics.behavior('body-impulse-response') );

        // add gravity
        world.add( Physics.behavior('constant-acceleration') );
    };

    sim.title = "Simple bouncing balls";
    sim.sourceUrl = "https://github.com/wellcaffeinated/PhysicsJS/blob/master/examples/sims/simple.js";

    return sim;
});