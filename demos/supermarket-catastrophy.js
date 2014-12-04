//
// Supermarket Catastrophy
//
Physics({ timestep: 3 }, function (world) {

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
        ,restitution: 0.2
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
    // projectile
    projectile = Physics.body('circle', {
        x: -20
        ,y: viewHeight - 150
        ,vx: 2
        ,mass: 4
        ,radius: 20
        ,restitution: 0.99
        ,angularVelocity: 0
        ,styles: {
            fillStyle: '0xd33682'
            ,lineWidth: 1
            ,angleIndicator: '0x751b4b'
        }
    });

    // squares
    var squares = [];
    for ( var i = 0, l = 24; i < l; ++i ){

        squares.push( Physics.body('rectangle', {
            width: 40
            ,height: 40
            ,x: 42 * (i / 6 | 0) + viewWidth - 40 * 8
            ,y: 40 * (i % 6) + viewHeight - 40 * 6 + 15
            ,vx: 0
            ,cof: 0.99
            ,restitution: 0.99
            ,styles: {
                fillStyle: '0xb58900'
                ,lineWidth: 1
                ,strokeStyle: '0x624501'
                ,angleIndicator: '0x624501'
            }
        }));
    }

    world.add( squares );

    setTimeout(function(){

        world.add( projectile );

    }, 2000);

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
        Physics.behavior('constant-acceleration')
        ,Physics.behavior('body-impulse-response')
        ,Physics.behavior('body-collision-detection')
        ,Physics.behavior('sweep-prune')
        ,edgeBounce
    ]);

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time ) {
        world.step( time );
    });
});
