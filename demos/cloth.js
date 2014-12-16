//
// Tearable Cloth
//
Physics({ timestep: 8, sleepDisabled: true },function (world) {

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
                    x: 8 * col + (renderer.width - l * 8) / 2
                    ,y: 8 * row + (renderer.height/2 - 200)
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
            ,ctx = renderer.ctx
        	,t = data.meta.interpolateTime || 0
            ;

        // optimized line drawing
        ctx.beginPath();
        ctx.strokeStyle = clothStyles.strokeStyle;
        ctx.lineWidth = clothStyles.lineWidth;
        for ( var i = 0, l = constraints.length; i < l; ++i ){

            c = constraints[ i ];
            ctx.moveTo(c.bodyA.state.pos.x + c.bodyA.state.vel.x * t, c.bodyA.state.pos.y + c.bodyA.state.vel.y * t);
            ctx.lineTo(c.bodyB.state.pos.x + c.bodyB.state.vel.x * t, c.bodyB.state.pos.y + c.bodyB.state.vel.y * t);
        }
        ctx.stroke();
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
        Physics.behavior('interactive', { el: renderer.container, moveThrottle: 5 })
        ,Physics.behavior('constant-acceleration')
    ]);

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time ) {
        world.step( time );
    });
});
