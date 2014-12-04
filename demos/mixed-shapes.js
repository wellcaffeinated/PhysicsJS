//
// Mixed Shapes
//
Physics({ timestep: 4 }, function (world) {

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

    Physics.geometry.regularPolygonVertices = function( sides, radius ){
        var verts = []
            ,angle = Math.PI * 2 / sides
            ,a = 0
            ,i
            ;

        for ( i = 0; i < sides; i++ ){
            verts.push({
                x: radius * Math.cos( a )
                ,y: radius * Math.sin( a )
            });

            a += angle;
        }

        return verts;
    };

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
                        fillStyle: '0x268bd2'
                        ,lineWidth: 1
                        ,angleIndicator: '0x155479'
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
                        fillStyle: '0xd33682'
                        ,lineWidth: 1
                        ,angleIndicator: '0x751b4b'
                    }
                });
                break;

                // add a polygon
            case 2:
                body = Physics.body('convex-polygon', {
                    vertices: Physics.geometry.regularPolygonVertices( random( 5, 10 ), random(30, 50) )
                    ,x: viewWidth / 2
                    ,y: 50
                    ,vx: random(-5, 5)/100
                    ,angle: random( 0, 2 * Math.PI )
                    ,restitution: 0.9
                    ,styles: {
                        fillStyle: '0x859900'
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
