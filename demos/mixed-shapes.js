//
// Mixed Shapes
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

    var pent = [
        { x: 50, y: 0 }
        ,{ x: 25, y: -25 }
        ,{ x: -25, y: -25 }
        ,{ x: -50, y: 0 }
        ,{ x: 0, y: 50 }
    ];

    function random( min, max ){
        return (Math.random() * (max-min) + min)|0
    }

    function dropInBody(){

        var body;

        switch ( random( 0, 3 ) ){

                // add a circle
            case 0:
                body = Physics.body('circle', {
                    x: viewWidth / 2
                    ,y: 50
                    ,vx: random(-5, 5)/100
                    ,radius: 40
                    ,restitution: 0.9
                    ,styles: {
                        fillStyle: '#268bd2'
                        ,angleIndicator: '#155479'
                    }
                });
                break;

                // add a square
            case 1:
                body = Physics.body('rectangle', {
                    width: 50
                    ,height: 50
                    ,x: viewWidth / 2
                    ,y: 50
                    ,vx: random(-5, 5)/100
                    ,restitution: 0.9
                    ,styles: {
                        fillStyle: '#d33682'
                        ,angleIndicator: '#751b4b'
                    }
                });
                break;

                // add a polygon
            case 2:
                body = Physics.body('convex-polygon', {
                    vertices: pent
                    ,x: viewWidth / 2
                    ,y: 50
                    ,vx: random(-5, 5)/100
                    ,angle: random( 0, 2 * Math.PI )
                    ,restitution: 0.9
                    ,styles: {
                        fillStyle: '#859900'
                        ,angleIndicator: '#414700'
                    }
                });
                break;
        }

        world.add( body );
    }

    var int = setInterval(function(){
        if ( world._bodies.length > 40 ){
            clearInterval( int );
        }
        dropInBody();
    }, 700);

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
