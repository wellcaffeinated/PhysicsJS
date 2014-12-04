//
// More involved example of a newtonian gravity
//
Physics({ sleepDisabled: true }, function (world) {

    // bounds of the window
    var viewWidth = window.innerWidth
        ,viewHeight = window.innerHeight
        ,viewportBounds = Physics.aabb(0, 0, window.innerWidth, window.innerHeight)
        ,edgeBounce
        ,renderer
        ;

    // let's use the pixi renderer
    require(['vendor/pixi'], function( PIXI ){
        window.PIXI = PIXI;
        // create a renderer
        renderer = Physics.renderer('pixi', {
            el: 'viewport'
        });

        // add the renderer
        world.add(renderer);
        // render on each step
        world.on('step', function () {
            world.render();
        });
        // add the interaction
        world.add(Physics.behavior('interactive', { el: renderer.container }));
    });

    // constrain objects to these bounds
    edgeBounce = Physics.behavior('edge-collision-detection', {
        aabb: viewportBounds
        ,restitution: 0.99
        ,cof: 0.8
    });

    // resize events
    window.addEventListener('resize', function () {

        // as of 0.7.0 the renderer will auto resize... so we just take the values from the renderer
        viewportBounds = Physics.aabb(0, 0, renderer.width, renderer.height);
        // update the boundaries
        edgeBounce.setAABB(viewportBounds);

    }, true);

    // create some bodies
    var circles = [];

    for ( var i = 0, l = 180; i < l; ++i ){

        circles.push(
            Physics.body('circle', {
                x: Math.random()*(viewWidth - 10) + 10
                ,y: Math.random()*(viewHeight - 10) + 10
                ,mass: 1
                ,radius: 4
                ,vx: Math.random()*0.01 - 0.005
                ,vy: Math.random()*0.01 - 0.005
                ,restitution: 0.99
                ,styles: {
                    fillStyle: '0xdc322f'
                }
            })
        );
    }

    // add things to world
    world.add( circles );

    // add some fun interaction
    var attractor = Physics.behavior('attractor', {
        order: 0,
        strength: .002
    });
    world.on({
        'interact:poke': function( pos ){
            world.wakeUpAll();
            attractor.position( pos );
            world.add( attractor );
        }
        ,'interact:move': function( pos ){
            attractor.position( pos );
        }
        ,'interact:release': function(){
            world.wakeUpAll();
            world.remove( attractor );
        }
    });

    // add things to the world
    world.add([
        Physics.behavior('newtonian', { strength: .01 })
        ,Physics.behavior('sweep-prune')
        ,Physics.behavior('body-collision-detection', { checkAll: false })
        ,Physics.behavior('body-impulse-response')
        ,edgeBounce
    ]);

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time ) {
        world.step( time );
    });

    // start the ticker
    Physics.util.ticker.start();
});
