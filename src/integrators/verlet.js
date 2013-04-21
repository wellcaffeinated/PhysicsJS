Physics.integrator('verlet', function( parent ){

    return {

        init: function( options ){

            // call parent init
            parent.init.call(this, options);
        },

        integrate: function( bodies, dt ){

            // half the timestep
            var dtdt = dt * dt
                ,drag = 1 - this.options.drag
                ,body = null
                ,state
                // use cached vector instances
                // so we don't need to recreate them in a loop
                ,scratch = Physics.scratchpad()
                ,vel = scratch.vector()
                ;

            for ( var i = 0, l = bodies.length; i < l; ++i ){

                body = bodies[ i ];

                // only integrate if the body isn't fixed
                if ( !body.fixed ){

                    state = body.state;

                    // Inspired from https://github.com/soulwire/Coffee-Physics
                    // @licence MIT
                    // 
                    // v = x - ox
                    // x = x + (v + a * dt * dt)

                    // Get velocity by subtracting old position from curr position
                    state.old.vel.clone( state.pos ).vsub( state.old.pos ).mult( 1/dt );

                    // only use this velocity if the velocity hasn't been changed manually
                    if (state.old.vel.equals( state.vel )){
                        
                        state.vel.clone( state.old.vel );
                    }

                    // so we need to scale the value by dt so it 
                    // complies with other integration methods
                    state.vel.mult( dt );

                    // Apply "air resistance".
                    if ( drag ){

                        state.vel.mult( drag );
                    }

                    // Store old position.
                    // xold = x
                    state.old.pos.clone( state.pos );

                    // Apply acceleration
                    // x = x + (v + a * dt * dt)
                    state.pos.vadd( state.vel.vadd( state.acc.mult( dtdt ) ) );

                    // normalize velocity 
                    state.vel.mult( 1/dt );

                    // Reset accel
                    state.acc.zero();

                    // store old velocity
                    state.old.vel.clone( state.vel );


                    //
                    // Angular components
                    // 

                    state.old.angular.vel = (state.angular.pos - state.old.angular.pos) / dt;

                    if (state.old.angular.vel === state.angular.vel){

                        state.angular.vel = state.old.angular.vel;
                    }

                    state.angular.vel *= dt;

                    state.old.angular.pos = state.angular.pos;

                    state.angular.vel += state.angular.acc * dtdt;
                    state.angular.pos += state.angular.vel;
                    state.angular.vel /= dt;
                    state.angular.acc = 0;
                    state.old.angular.vel = state.angular.vel;

                }
            }

            scratch.done();
        }
    };
});

