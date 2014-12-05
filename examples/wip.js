//
// PhysicsJS
// A modular, extendable, and easy-to-use physics engine for javascript
//
// Use the select box in the top right to see more examples!
//
Physics(function (world) {

    // bounds of the window
    var viewportBounds = Physics.aabb(0, 0, window.innerWidth, window.innerHeight)
        ,attractor
        ,edgeBounce
        ,renderer
        ;

    // create a renderer
    renderer = Physics.renderer('canvas', { el: 'viewport' });

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

        viewportBounds = Physics.aabb(0, 0, renderer.width, renderer.height);
        // update the boundaries
        edgeBounce.setAABB(viewportBounds);

    }, true);

    // some fun colors
    var colors = [
        '#b58900',
        '#cb4b16',
        '#dc322f',
        '#d33682',
        '#6c71c4',
        '#268bd2',
        '#2aa198',
        '#859900'
    ];

    // scale relative to window width
    function S( n ){
        return n * window.innerWidth / 600;
    }

    var versionMass = 100;

    // create the zero
    var zero = Physics.body('compound', {
        x: renderer.width/2 - S(80)
        ,y: renderer.height/2
        //,treatment: 'static'
        ,mass: versionMass
        ,styles: {
            fillStyle: colors[2]
            ,strokeStyle: colors[4]
            ,lineWidth: 2
        }
        ,children: [
            // coords of children are relative to the compound center of mass
            Physics.body('rectangle', {
                x: S(-50)
                ,y: 0
                ,width: S(20)
                ,height: S(97)
            })
            ,Physics.body('rectangle', {
                x: S(50)
                ,y: 0
                ,width: S(20)
                ,height: S(97)
            })
            ,Physics.body('rectangle', {
                x: 0
                ,y: S(75)
                ,width: S(48)
                ,height: S(20)
            })
            ,Physics.body('rectangle', {
                x: -S(35)
                ,y: S(60)
                ,angle: Math.PI / 4
                ,width: S(50)
                ,height: S(20)
            })
            ,Physics.body('rectangle', {
                x: S(35)
                ,y: S(60)
                ,angle: -Math.PI / 4
                ,width: S(50)
                ,height: S(20)
            })
            ,Physics.body('rectangle', {
                x: 0
                ,y: S(-75)
                ,width: S(48)
                ,height: S(20)
            })
            ,Physics.body('rectangle', {
                x: -S(35)
                ,y: -S(60)
                ,angle: -Math.PI / 4
                ,width: S(50)
                ,height: S(20)
            })
            ,Physics.body('rectangle', {
                x: S(35)
                ,y: -S(60)
                ,angle: Math.PI / 4
                ,width: S(50)
                ,height: S(20)
            })
        ]
    });

    var point = Physics.body('circle', {
        x: renderer.width/2 + S(6)
        ,y: renderer.height/2 + S(76)
        ,radius: S(13)
        ,mass: versionMass
        ,treatment: 'static'
        ,styles: {
            fillStyle: colors[2]
            ,strokeStyle: colors[4]
            ,lineWidth: 2
        }
    });

    var seven = Physics.body('compound', {
        x: renderer.width/2 + S(86)
        ,y: renderer.height/2 - S(34)
        //,treatment: 'static'
        ,mass: versionMass
        ,styles: {
            fillStyle: colors[2]
            ,strokeStyle: colors[4]
            ,lineWidth: 2
        }
        ,children: [
            Physics.body('rectangle', {
                x: S(35)
                ,y: -S(80)
                ,width: S(114)
                ,height: S(24)
            })
            ,Physics.body('rectangle', {
                x: S(51.5)
                ,y: S(2.5)
                ,angle: -70 * Math.PI/180
                ,width: S(160)
                ,height: S(28)
            })
        ]
    });

    var l = 0;
    while( l-- ){
        world.add(Physics.body('circle', {
            x: Math.random() * renderer.width
            ,y: Math.random() * renderer.height
            ,radius: S(2)
            ,mass: 1
            ,restitution: 0
        }));
    }

    // add things to the world
    world.add([
        zero
        ,point
        ,seven
    ]);

    // add behaviors
    world.add([
        //Physics.behavior('newtonian', { strength: 1e-2 })
        Physics.behavior('constant-acceleration')
        ,Physics.behavior('body-impulse-response')
        ,Physics.behavior('body-collision-detection')
        ,Physics.behavior('sweep-prune')
        ,Physics.behavior('interactive', { el: renderer.container })
        ,edgeBounce
        ,attractor
    ]);

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time ) {
        world.step( time );
    });
});

// go ahead... expand the code and play around...
