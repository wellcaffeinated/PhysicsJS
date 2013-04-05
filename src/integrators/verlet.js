Physics.integrator('verlet', function( parent ){

    return {

        init: function( options ){

            // call parent init
            parent.init.call(this, options);

            // cache some vector instances
            // so we don't need to recreate them in a loop
            this.vel = Physics.vector();
        },

        integrate: function( bodies, dt ){

            // half the timestep
            var dtdt = dt * dt
                ,drag = this.options.drag
                ,body = null
                ,state
                ,vel = this.vel
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
                    vel.clone( state.pos ).vsub( state.old.pos );

                    // only use this velocity if the velocity hasn't been changed manually
                    if (vel.equals( state.old.vel )){
                        
                        state.vel.clone( vel );

                    } else {
                        // otherwise it's been changed manually,
                        // so we need to scale the value by dt so it 
                        // complies with other integration methods
                        state.vel.mult( dt );
                    }

                    // Apply "air resistance".
                    if ( drag ){

                        state.vel.mult( drag );
                    }

                    // Store old position.
                    // xold = x
                    state.old.pos.clone( state.pos );

                    // Apply acceleration
                    // xtemp = x + (v + a * dt * dt)
                    state.pos.vadd( state.vel.vadd( state.acc.mult( dtdt ) ) );

                    // Reset accel
                    state.acc.zero();

                    // store old velocity
                    state.old.vel.clone( state.pos ).vsub( state.old.pos );

                }                    
            }
        }
    };
});

