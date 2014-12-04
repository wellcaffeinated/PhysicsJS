//
// Supermarket Catastrophy
//
// Bullet time is just slowing down the worl,
// by setting a small "warp" factor with `.warp()`
// we'll activate bullet time for a little while as
// the boxes are hit. But you can also activate
// bullet time by "poking" the screen
//

function loadScript( url ){
    var a = document.createElement('script');
    a.type = 'text/javascript';
    a.src = url;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(a, s);
}
// For this example, we'll use a tweening engine
// to transition in and out of "bullet time".
loadScript('assets/scripts/vendor/tween.js');

Physics({ timestep: 2 }, function (world) {

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
        ,label: 'bullet'
        ,styles: {
            fillStyle: '#d33682'
            ,angleIndicator: '#751b4b'
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
            ,label: 'box'
            ,styles: {
                fillStyle: '#b58900'
                ,angleIndicator: '#624501'
            }
        }));
    }

    world.add( squares );

    setTimeout(function(){

        world.add( projectile );

    }, 2000);

    // setup bullet time
    function bulletTime( active ){
        // warp is the world warp factor. 0.03 is slowing the world down
        var warp = active === false ? 1 : 0.03
            ,tween
            ;

        tween = new TWEEN.Tween( { warp: world.warp() } )
            .to( { warp: warp }, 600 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .onUpdate( function () {
                // set the world warp on every tween step
                world.warp( this.warp );
            } )
            .start()
            ;
    }

    // query to find a collision of the bullet
    var query = Physics.query({
        $or: [
            { bodyA: { label: 'bullet' }, bodyB: { label: 'box' } }
            ,{ bodyB: { label: 'bullet' }, bodyA: { label: 'box' } }
        ]
    });

    // enter bullet time on first collision
    world.on('collisions:detected', function( data, e ){
        // find the first collision of the bullet with a box
        var found = Physics.util.find( data.collisions, query );
        if ( found ){
            // enter bullet time
            bulletTime();
            // ... for a few seconds
            setTimeout(function(){
                bulletTime(false);
            }, 5000);
            // stop checking
            world.off(e.topic, e.handler);
        }
    });

    // activate bullet time on pokes
    world.on({
        'interact:poke': function( pos ){
            // activate bullet time
            bulletTime();
        }
        ,'interact:release': function(){
            // de-activate bullet time
            bulletTime(false);
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
        TWEEN.update();
        world.step( time );
    });

    // start the ticker
    Physics.util.ticker.start();
});
