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

        world.title = "Tearable cloth";

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
                        y: 8 * row + (viewHeight/2 - 200),
                        radius: 4,
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

        world.subscribe('integrate:positions', function(){

            var constraints = rigidConstraints.getConstraints()
                ,c
                ,threshold = 40
                ,scratch = Physics.scratchpad()
                ,v = scratch.vector()
                ,len
                ;

            for ( var i = 0, l = constraints.length; i < l; ++i ){
                
                c = constraints[ i ];
                len = v.clone( c.bodyB.state.pos ).vsub( c.bodyA.state.pos ).norm();

                // break the constraint if above threshold
                if ( (!c.bodyA.fixed && !c.bodyB.fixed) && (len - c.targetLength) > threshold ){

                    rigidConstraints.remove( i );
                }
            }

            scratch.done();
            // higher priority than constraint resolution
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
        world.add( cloth );
        world.add( rigidConstraints );
        
        // add gravity
        world.add( Physics.behavior('constant-acceleration') );
    });
});