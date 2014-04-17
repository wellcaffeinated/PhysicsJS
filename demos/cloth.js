//
// Tearable Cloth
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
        iterations: 1
    });

    // the "cloth"
    var cloth = [];
    for ( var row = 0, l = 35; row < l; ++row ){
        for ( var col = 0, lcol = 35; col < lcol; ++col ){

            cloth.push(
                Physics.body('circle', {
                    x: 8 * col + (viewWidth - l * 8) / 2
                    ,y: 8 * row + (viewHeight/2 - 200)
                    ,radius: 4
                    ,hidden: true
                })
            );

            if (col > 0){
                // horizontal
                rigidConstraints.distanceConstraint(cloth[ lcol * row + col - 1 ], cloth[ lcol * row + col ], 0.4);
            }

            if (row > 0){

                // vertical
                rigidConstraints.distanceConstraint(cloth[ lcol * row + col ], cloth[ lcol * (row - 1) + col ], 0.5, 8);
            } else {

                cloth[ lcol * row + col ].treatment = 'static';
            }
        }
    }

    world.on('integrate:positions', function(){

        var constraints = rigidConstraints.getConstraints().distanceConstraints
            ,c
            ,threshold = 60
            ,scratch = Physics.scratchpad()
            ,v = scratch.vector()
            ,len
            ;

        for ( var i = 0, l = constraints.length; i < l; ++i ){

            c = constraints[ i ];
            len = v.clone( c.bodyB.state.pos ).vsub( c.bodyA.state.pos ).norm();

            // break the constraint if above threshold
            if ( (c.bodyA.treatment !== 'static' && c.bodyB.treatment !== 'static') && (len - c.targetLength) > threshold ){

                rigidConstraints.remove( c );
            }
        }

        scratch.done();
        // higher priority than constraint resolution
    }, null, 100);

    // render
    var clothStyles = { strokeStyle: '#2aa198', lineWidth: 1 };
    world.on('render', function( data ){

        var renderer = data.renderer
            ,constraints = rigidConstraints.getConstraints().distanceConstraints
            ,c
            ,styles = clothStyles
            ;

        for ( var i = 0, l = constraints.length; i < l; ++i ){

            c = constraints[ i ];
            renderer.drawLine(c.bodyA.state.pos, c.bodyB.state.pos, styles);
        }
    });

    // add things to world
    world.add( cloth );
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
        ,'interact:release': function(){
            world.remove( attractor );
        }
    });

    // add things to the world
    world.add([
        Physics.behavior('interactive', { el: renderer.el })
        ,Physics.behavior('constant-acceleration')
        //,edgeBounce
    ]);

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time ) {
        world.step( time );
    });

    // start the ticker
    Physics.util.ticker.start();
});
