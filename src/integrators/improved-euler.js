(function(Physics){

    var defaults = {

        // 1 means vacuum
        // 0.001 means molasses
        drag: 0.95
    };
    
    Physics.integrator('improved-euler', function( options, instance ){

        // cache some vector instances
        // so we don't need to recreate them in a loop
        var vel = Physics.vector()
            ;

        options = Physics.util.extend({}, options, defaults);

        return {

            integrate: function( dt, bodies ){

                // half the timestep
                var halfdt = 0.5 * dt
                    ,drag = options.drag
                    ,body = null
                    ;

                for ( var i = 0, l = bodies.length; i < l; ++i ){

                    body = bodies[ i ];

                    // only integrate if the body isn't fixed
                    if ( !body.fixed ){

                        // Inspired from https://github.com/soulwire/Coffee-Physics
                        // @licence MIT
                        // 
                        // x += (v * dt) + (a * 0.5 * dt * dt)
                        // v += a * dt

                        // Store previous location.
                        body.old.pos.clone( body.pos );

                        // Scale force to mass.
                        // body.acc.mult( body.massInv );

                        // Duplicate velocity to preserve momentum.
                        vel.clone( body.vel );

                        // Update velocity first so we can reuse the acc vector.
                        // a *= dt
                        // v += a ...
                        body.vel.vadd( body.acc.mult( dt ) );

                        // Update position.
                        // ...
                        // oldV *= dt
                        // a *= 0.5 * dt
                        // x += oldV + a
                        body.pos.vadd( vel.mult( dt ) ).vadd( body.acc.mult( halfdt ) );

                        // Apply "air resistance".
                        if ( drag ){

                            body.vel.mult( drag );
                        }

                        // Reset accel
                        body.acc.zero();

                    }                    
                }
            }
        };
    });

}(Physics));