//
// Basket of verlet constraints
//
Physics(function (world) {

    var viewWidth = window.innerWidth
        ,viewHeight = window.innerHeight
        // bounds of the window
        ,viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight)
        ,edgeBounce
        ,renderer
        ;

    // create a renderer
    renderer = Physics.renderer('canvas', {
        el: 'viewport'
        ,width: viewWidth
        ,height: viewHeight
    });

    // add the renderer
    world.add(renderer);
    // render on each step
    world.on('step', function () {
        world.render();
    });

    // constrain objects to these bounds
    edgeBounce = Physics.behavior('edge-collision-detection', {
        aabb: viewportBounds
        ,restitution: 0.2
        ,cof: 0.8
    });

    // resize events
    window.addEventListener('resize', function () {

        viewWidth = window.innerWidth;
        viewHeight = window.innerHeight;

        renderer.el.width = viewWidth;
        renderer.el.height = viewHeight;

        viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
        // update the boundaries
        edgeBounce.setAABB(viewportBounds);

    }, true);

    // for constraints
    var rigidConstraints = Physics.behavior('verlet-constraints', {
        iterations: 3
    });

    // the "basket"
    var basket = [];
    for ( var i = 200; i < Math.min(viewWidth - 200, 1000); i += 5 ){

        l = basket.push(
            Physics.body('circle', {
                x: i
                ,y: viewHeight / 2
                ,radius: 1
                ,restitution: 0.2
                ,mass: .5
                ,hidden: true
            })
        );

        rigidConstraints.distanceConstraint( basket[ l - 1 ], basket[ l - 2 ], 2 );
    }

    world.on('render', function( data ){

        var renderer = data.renderer;
        for ( var i = 1, l = basket.length; i < l; ++i ){

            renderer.drawLine(basket[ i - 1 ].state.pos, basket[ i ].state.pos, {
                strokeStyle: '#cb4b16'
                ,lineWidth: 3
            });
        }
    });

    // fix the ends
    basket[ 0 ].treatment = 'static';
    basket[ l - 1 ].treatment = 'static';

    basket[ 0 ].treatment = 'static';
    basket[ l - 1 ].treatment = 'static';

    // falling boxes
    var boxes = [];
    for ( var i = 0, l = 15; i < l; ++i ){

        boxes.push( Physics.body('rectangle', {
            width: 50
            ,height: 50
            ,x: 60 * (i % 6) + viewWidth / 2 - (180)
            ,y: 60 * (i / 6 | 0) + 50
            ,restitution: 0.9
            ,angle: Math.random()
            ,styles: {
                fillStyle: '#268bd2'
                ,angleIndicator: '#155479'
            }
        }));
    }

    world.add( basket );
    world.add( boxes );
    world.add( rigidConstraints );

    // add some fun interaction
    var attractor = Physics.behavior('attractor', {
        order: 0,
        strength: 0.002
    });
    world.on({
        'interact:poke': function( pos ){
            attractor.position( pos );
            world.add( attractor );
        }
        ,'interact:move': function( pos ){
            attractor.position( pos );
        }
        ,'interact:release': function(){
            world.remove( attractor );
        }
    });

    // add things to the world
    world.add([
        Physics.behavior('interactive', { el: renderer.el })
        ,Physics.behavior('constant-acceleration')
        ,Physics.behavior('body-impulse-response')
        ,Physics.behavior('body-collision-detection')
        ,Physics.behavior('sweep-prune')
        ,edgeBounce
    ]);

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time ) {
        world.step( time );
    });

    // start the ticker
    Physics.util.ticker.start();
});
