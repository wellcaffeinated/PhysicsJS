//
// Fruitcake on wheels
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

    // for constraints
    var rigidConstraints = Physics.behavior('verlet-constraints', {
        iterations: 3
    });

    // the "fruitcake"
    var spacing = 50;
    var fruitcake = [];
    for ( var row = 0, l = 4; row < l; ++row ){
        for ( var col = 0, lcol = 10; col < lcol; ++col ){

            var r = (Math.random() * 10 + 10)|0;

            if ( row === 0 ||
                col === 0 ||
                row === l - 1 ||
                col === lcol - 1
               ){
                r = 10;
            }

            if ( (row === 0 || row === l - 1) &&
                (col === 2 || col === lcol - 3)
               ){
                r = 30;
            }

            fruitcake.push(
                Physics.body('circle', {
                    x: spacing * col + viewWidth / 2 - 100
                    ,y: spacing * row + viewHeight / 2
                    ,radius: r
                    ,restitution: 0.9
                    ,styles: {
                        fillStyle: colors[ fruitcake.length % colors.length ]
                        ,angleIndicator: 'rgba(0,0,0,0.6)'
                    }
                })
            );

            if (col > 0){
                // horizontal
                rigidConstraints.distanceConstraint(fruitcake[ lcol * row + col - 1 ], fruitcake[ lcol * row + col ], 0.7);
            }

            if (row > 0){

                // vertical
                rigidConstraints.distanceConstraint(fruitcake[ lcol * row + col ], fruitcake[ lcol * (row - 1) + col ], 0.7);

                if ( col > 0 ){
                    // diagonals
                    rigidConstraints.distanceConstraint(fruitcake[ lcol * (row - 1) + col - 1 ], fruitcake[ lcol * row + col ], 0.7, Math.sqrt(2) * spacing);
                    rigidConstraints.distanceConstraint(fruitcake[ lcol * (row - 1) + col ], fruitcake[ lcol * row + col - 1 ], 0.7, Math.sqrt(2) * spacing);
                }
            }
        }
    }

    // render
    world.on('render', function( data ){

        var constraints = rigidConstraints.getConstraints().distanceConstraints
            ,c
            ;

        for ( var i = 0, l = constraints.length; i < l; ++i ){

            c = constraints[ i ];
            renderer.drawLine(c.bodyA.state.pos, c.bodyB.state.pos, '#4d4d4d');
        }
    });

    // add things to world
    world.add( fruitcake );
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
        ,edgeBounce
    ]);

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time ) {
        world.step( time );
    });

    // start the ticker
    Physics.util.ticker.start();
});
