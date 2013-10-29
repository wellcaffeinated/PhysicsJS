define([
    
    'jquery'

], function(
    $
){
    var sim = function( world, Physics ){

        // begin
        var $win = $(window)
            ,viewWidth = $win.width()
            ,viewHeight = $win.height()
            ,viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight)
            ,spacing = 50
            ,rigidConstraints = Physics.behavior('rigid-constraint-manager', {
                targetLength: spacing
            })
            ,edgeBounce = Physics.behavior('edge-collision-detection', {
                aabb: viewportBounds,
                restitution: 0.99,
                cof: 0.99
            })
            ;

        // the "fruitcake"
        var fruitcake = [];
        for ( var row = 0, l = 4; row < l; ++row ){
            for ( var col = 0, lcol = 10; col < lcol; ++col ){

                var r = Physics.util.random(10, 20);

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
                        x: spacing * col + viewWidth / 2 - 100,
                        y: spacing * row + viewHeight / 2,
                        radius: r,
                        restitution: 0.9
                    })
                );

                if (col > 0){
                    // horizontal
                    rigidConstraints.constrain(fruitcake[ lcol * row + col - 1 ], fruitcake[ lcol * row + col ]);
                }

                if (row > 0){

                    // vertical
                    rigidConstraints.constrain(fruitcake[ lcol * row + col ], fruitcake[ lcol * (row - 1) + col ]);

                    if ( col > 0 ){
                        // diagonals
                        rigidConstraints.constrain(fruitcake[ lcol * (row - 1) + col - 1 ], fruitcake[ lcol * row + col ], Math.sqrt(2) * spacing);
                        rigidConstraints.constrain(fruitcake[ lcol * (row - 1) + col ], fruitcake[ lcol * row + col - 1 ], Math.sqrt(2) * spacing);
                    }
                }
            }
        }

        // custom view creation
        world.subscribe('render', function( data ){

            Physics.util.each( fruitcake, function( circle ){

                var geo = circle.geometry
                    ,rnd = Physics.util.random
                    ,style = geo.radius < 30 ? 'rgb('+[rnd(100,255)|0, rnd(100,255)|0, rnd(100,255)|0].join(',')+')' : {
                        strokeStyle: '#222',
                        fillStyle: '#7aa',
                        lineWidth: 4,
                        angleIndicator: '#222'
                    }
                    ;

                circle.view = data.renderer.createView( geo, style );
            });

            // only run once
            world.unsubscribe( data.topic, data.handler );

        }, null, 100);

        // render
        world.subscribe('render', function( data ){

            var renderer = data.renderer
                ,constraints = rigidConstraints.getConstraints()
                ,c
                ;

            for ( var i = 0, l = constraints.length; i < l; ++i ){
                
                c = constraints[ i ];
                renderer.drawLine(c.bodyA.state.pos, c.bodyB.state.pos, '#664');
            }
        });

        // add things to world
        world.add( fruitcake );
        world.add( rigidConstraints );
        world.add( edgeBounce );
        world.add( Physics.behavior('body-impulse-response') );
        
        // add gravity
        world.add( Physics.behavior('constant-acceleration') );
    };

    sim.title = "Fruitcake on wheels";
    sim.sourceUrl = "https://github.com/wellcaffeinated/PhysicsJS/blob/master/examples/sims/fruitcake-on-wheels.js";

    return sim;
});
