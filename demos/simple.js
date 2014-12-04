//
// Simple example of bouncing balls
//
Physics(function (world) {
    // bounds of the window
    var viewportBounds = Physics.aabb(0, 0, window.innerWidth, window.innerHeight)
        ,edgeBounce
        ,renderer
        ;

    // create a renderer
    renderer = Physics.renderer('canvas', {
        el: 'viewport'
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
    world.add( Physics.body('circle', {
        x: renderer.width * 0.4
        ,y: renderer.height * 0.3
        ,vx: 0.3
        ,radius: 80
        ,styles: {
            fillStyle: '#cb4b16'
            ,angleIndicator: '#72240d'
        }
    }));

    world.add( Physics.body('circle', {
        x: renderer.width * 0.7
        ,y: renderer.height * 0.3
        ,vx: -0.3
        ,radius: 40
        ,styles: {
            fillStyle: '#6c71c4'
            ,angleIndicator: '#3b3e6b'
        }
    }));

    // add some fun interaction
    var attractor = Physics.behavior('attractor', {
        order: 0,
        strength: 0.002
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
        Physics.behavior('interactive', { el: renderer.container })
        ,Physics.behavior('constant-acceleration')
        ,Physics.behavior('body-impulse-response')
        ,edgeBounce
    ]);

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time ) {
        world.step( time );
    });
});
