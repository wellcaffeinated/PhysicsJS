Physics.integrator('improved-euler', function( parent ){

    return {

        init: function( options ){

            // call parent init
            parent.init.call(this, options);
        },

        integrate: function( bodies, dt ){

            // half the timestep
            var halfdt = 0.5 * dt
                ,drag = 1 - this.options.drag
                ,body = null
                ,state
                // use cached vector instances
                // so we don't need to recreate them in a loop
                ,scratch = Physics.scratchpad()
                ,vel = scratch.vector()
                ,angVel
                ;

            for ( var i = 0, l = bodies.length; i < l; ++i ){

                body = bodies[ i ];
                state = body.state;

                // only integrate if the body isn't fixed
                if ( !body.fixed ){

                    // Inspired from https://github.com/soulwire/Coffee-Physics
                    // @licence MIT
                    // 
                    // x += (v * dt) + (a * 0.5 * dt * dt)
                    // v += a * dt

                    // Store previous location.
                    state.old.pos.clone( state.pos );

                    // Scale force to mass.
                    // state.acc.mult( body.massInv );

                    // Duplicate velocity to preserve momentum.
                    vel.clone( state.vel );

                    // Update velocity first so we can reuse the acc vector.
                    // a *= dt
                    // v += a ...
                    state.vel.vadd( state.acc.mult( dt ) );

                    // Update position.
                    // ...
                    // oldV *= dt
                    // a *= 0.5 * dt
                    // x += oldV + a
                    state.pos.vadd( vel.mult( dt ) ).vadd( state.acc.mult( halfdt ) );

                    // Apply "air resistance".
                    if ( drag ){

                        state.vel.mult( drag );
                    }

                    // Reset accel
                    state.acc.zero();

                    //
                    // Angular components
                    // 

                    state.old.angular.pos = state.angular.pos;
                    angVel = state.old.angular.vel = state.angular.vel;
                    state.angular.acc *= dt;
                    angVel += state.angular.acc;
                    state.angular.pos += angVel * dt + state.angular.acc * halfdt;
                    state.angular.acc = 0;

                } else {
                    // set the velocity and acceleration to zero!
                    state.vel.zero();
                    state.acc.zero();
                    state.angular.vel = 0;
                    state.angular.acc = 0;
                }
            }

            scratch.done();
        }
    };
});

