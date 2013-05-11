define([
    
    'jquery',
    'physicsjs'

], function(
    $,
    Physics
){
    return Physics({

        // config
        timestep: 1000 / 160 

    }, function( world ){

        world.title = "Simple bouncing balls";

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

        world.add( edgeBounce );
        world.add( Physics.behavior('body-impulse-response') );

        // add gravity
        world.add( Physics.behavior('gravity', function(){

            var g = Physics.vector(0, .0004)
                ,mouse = Physics.vector()
                ,mouseDown = false
                ,tmp = Physics.vector()
                ;

            $('#viewport').on({
                mousedown: function(e){
                    mouseDown = true;
                },
                mousemove: function(e){
                    var offset = $(this).offset();
                    mouse.set(e.screenX - offset.left, e.screenY - offset.top);
                },
                mouseup: function(e){
                    mouseDown = false;
                }
            });

            return {
                behave: function( bodies ){

                    for ( var i = 0, l = bodies.length; i < l; ++i ){
                        
                        bodies[ i ].accelerate( g );

                        if (mouseDown){
                            tmp.clone(mouse).vsub(bodies[ i ].state.pos).normalize().mult(0.001);
                            bodies[ i ].accelerate( tmp );
                        }
                    }
                }
            };
        }, {}) );
    });
});