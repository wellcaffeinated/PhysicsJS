define([
    
    'jquery',
    'physicsjs'

], function(
    $,
    Physics
){
    return Physics({

        // config
        timestep: 1000 / 160 

    }, function( world ){

        world.title = "Cloth Simulation";

        // begin
        var $win = $(window)
            ,viewWidth = $win.width()
            ,viewHeight = $win.height()
            ,viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight)
            ,rigidConstraints = Physics.behavior('rigid-constraint-manager', {
                targetLength: 8
            })
            ,l
            ;

        // the "cloth"
        var cloth = [];
        for ( var row = 0, l = 35; row < l; ++row ){
            for ( var col = 0, lcol = 35; col < lcol; ++col ){
                    
                cloth.push(
                    Physics.body('circle', {
                        x: 8 * col + (viewWidth - l * 8) / 2,
                        y: 8 * row + 60,
                        radius: 1,
                        hidden: true
                    })
                );

                if (col > 0){
                    // horizontal
                    rigidConstraints.constrain(cloth[ lcol * row + col - 1 ], cloth[ lcol * row + col ]);
                }

                if (row > 0){

                    // vertical
                    rigidConstraints.constrain(cloth[ lcol * row + col ], cloth[ lcol * (row - 1) + col ]);
                } else {

                    cloth[ lcol * row + col ].fixed = true;
                }
            }
        }

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
        world.add( cloth );
        world.add( rigidConstraints );
        
        // add gravity
        world.add( Physics.behavior('constant-acceleration') );
    });
});