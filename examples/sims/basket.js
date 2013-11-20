define([
    
    'jquery'

], function(
    $
){
    var sim = function( world, Physics ){

        // begin
        var $win = $(window)
            ,viewWidth = $win.width()
            ,viewHeight = $win.height()
            ,viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight)
            ,edgeBounce = Physics.behavior('edge-collision-detection', {
                aabb: viewportBounds,
                restitution: 0.2,
                cof: 0.99
            })
            ,rigidConstraints = Physics.behavior('rigid-constraint-manager', {
                targetLength: 3
            })
            ,square = [
                {x: 0, y: 50},
                {x: 50, y: 50},
                {x: 50, y: 0},
                {x: 0, y: 0}
            ]
            ,l
            ;

        $(window).on('resize', function(){

            viewWidth = $win.width();
            viewHeight = $win.height();
            viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
            edgeBounce.setAABB( viewportBounds );

        }).trigger('resize');

        // the "basket"
        var basket = [];
        for ( var i = 200; i < viewWidth - 200; i += 5 ){
                
            l = basket.push(
                Physics.body('circle', {
                    x: i,
                    y: viewHeight / 2,
                    radius: 1,
                    restitution: 0.2,
                    mass: .5,
                    hidden: true
                })
            );

            rigidConstraints.constrain( basket[ l - 1 ], basket[ l - 2 ] );
        }

        world.subscribe('render', function( data ){

            var renderer = data.renderer;
            for ( var i = 1, l = basket.length; i < l; ++i ){
                
                renderer.drawLine(basket[ i - 1 ].state.pos, basket[ i ].state.pos, {
                    strokeStyle: '#664',
                    lineWidth: 3
                });
            }
        });

        // fix the ends
        basket[ 0 ].fixed = true;
        basket[ l - 1 ].fixed = true;

        basket[ 0 ].hidden = false;
        basket[ l - 1 ].hidden = false;

        // falling boxes
        var boxes = [];
        for ( var i = 0, l = 15; i < l; ++i ){
            
            boxes.push( Physics.body('convex-polygon', {
                vertices: square,
                x: 60 * (i % 6) + viewWidth / 2 - (180),
                y: 60 * (i / 6 | 0) + 50,
                restitution: 0.9,
                angle: Math.random()
            }));
        }

        // add things to world
        world.add( basket );
        world.add( boxes );
        world.add( rigidConstraints );
        world.add( edgeBounce );
        world.add( Physics.behavior('body-impulse-response') );
        world.add( Physics.behavior('body-collision-detection', { checkAll: false }) );
        world.add( Physics.behavior('sweep-prune') );

        // add gravity
        world.add( Physics.behavior('constant-acceleration') );
    };

    sim.title = "A basket of rigid constraints";
    sim.sourceUrl = "https://github.com/wellcaffeinated/PhysicsJS/blob/master/examples/sims/basket.js";

    return sim;
});