//
// Mixed Shapes
//
Physics({ timestep: 6 }, function (world) {

    // bounds of the window
    var viewWidth = window.innerWidth
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

    var colors = [
        ['0x268bd2', '0x0d394f']
        ,['0xc93b3b', '0x561414']
        ,['0xe25e36', '0x79231b']
        ,['0x6c71c4', '0x393f6a']
        ,['0x58c73c', '0x30641c']
        ,['0xcac34c', '0x736a2c']
    ];

    function random( min, max ){
        return (Math.random() * (max-min) + min)|0;
    }

    function dropInBody(){

        var body;
        var c;

        switch ( random( 0, 3 ) ){

                // add a circle
            case 0:
                c = colors[0];
                body = Physics.body('circle', {
                    x: viewWidth / 2
                    ,y: 50
                    ,vx: random(-5, 5)/100
                    ,radius: 40
                    ,restitution: 0.9
                    ,styles: {
                        fillStyle: c[0]
                        ,strokeStyle: c[1]
                        ,lineWidth: 1
                        ,angleIndicator: c[1]
                    }
                });
                break;

                // add a square
            case 1:
                c = colors[1];
                body = Physics.body('rectangle', {
                    width: 50
                    ,height: 50
                    ,x: viewWidth / 2
                    ,y: 50
                    ,vx: random(-5, 5)/100
                    ,restitution: 0.9
                    ,styles: {
                        fillStyle: c[0]
                        ,strokeStyle: c[1]
                        ,lineWidth: 1
                        ,angleIndicator: c[1]
                    }
                });
                break;

                // add a polygon
            case 2:
                var s = random( 5, 10 );
                c = colors[ Math.min(s - 3, colors.length-1) ];
                body = Physics.body('convex-polygon', {
                    vertices: Physics.geometry.regularPolygonVertices( s, random(30, 50) )
                    ,x: viewWidth / 2
                    ,y: 50
                    ,vx: random(-5, 5)/100
                    ,angle: random( 0, 2 * Math.PI )
                    ,restitution: 0.9
                    ,styles: {
                        fillStyle: c[0]
                        ,strokeStyle: c[1]
                        ,lineWidth: 1
                        ,angleIndicator: c[1]
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
