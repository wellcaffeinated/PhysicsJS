// edge-bounce behavior
Physics.behavior('edge-bounce', function( parent ){

    var defaults = {

        bounds: null,
        restitution: 1.0,
        callback: null
    };

    var applyImpulse = function applyImpulse(state, n, r, moi, mass, cor){

        // break up components along normal and perp-normal directions
        var v = state.vel
            ,angVel = state.angular.vel
            ,vproj = v.proj( n )
            ,rreg = r.proj( n.perp(true) )
            ,impulse
            ;

        // rotate n back
        n.perp();
        // account for rotation ... += (r omega) in the tangential direction
        vproj -= angVel * rreg;

        impulse =  - ((1 + cor) * vproj) / ( (1 / mass) + (rreg * rreg / moi) );
        state.vel._[ 1 ] += -impulse / mass;
        state.angular.vel += impulse * rreg / moi;
        return impulse;
    };

    return {

        init: function( options ){

            // call parent init method
            parent.init.call(this, options);

            options = Physics.util.extend({}, defaults, options);

            this.bounds = options.bounds;
            this.restitution = options.restitution;
            this.callback = options.callback;
            this.pos = Physics.vector();
            this.norm = Physics.vector();
        },
        
        behave: function( bodies, dt ){

            var body
                ,pos
                ,state
                ,p = this.pos
                ,bounds = this.bounds
                ,callback = this.callback
                ,dim
                ,x
                ,cor
                ,cof = 0.02
                ,dir
                ,max
                ,norm = this.norm
                ,impulse
                ;

            if (!bounds) throw "Bounds not set";
            
            for ( var i = 0, l = bodies.length; i < l; ++i ){
                
                body = bodies[ i ];
                state = body.state;
                pos = body.state.pos;
                cor = body.restitution * this.restitution;

                switch ( body.geometry.name ){

                    case 'circle':
                        dim = body.geometry.radius;
                        x = body.moi / body.mass;

                        // right
                        if ( (pos._[ 0 ] + dim) >= bounds.max._[ 0 ] ){

                            // adjust position
                            pos._[ 0 ] = bounds.max._[ 0 ] - dim;
                            // adjust velocity
                            state.vel._[ 0 ] = -state.vel._[ 0 ];

                            if (x){
                                // angular momentum transfer to perpendicular velocity
                                state.vel._[ 1 ] /= (1 + x);
                                state.vel._[ 1 ] -= dim * state.angular.vel * x / (1 + x);
                                state.angular.vel = -state.vel._[ 1 ] / dim;
                            }

                            p.set( bounds.max._[ 0 ], pos._[ 1 ] );
                            callback && callback( body, p );
                        }
                        
                        // left
                        if ( (pos._[ 0 ] - dim) <= bounds.min._[ 0 ] ){

                            // adjust position
                            pos._[ 0 ] = bounds.min._[ 0 ] + dim;
                            // adjust velocity
                            state.vel._[ 0 ] = -state.vel._[ 0 ];

                            if (x){
                                // angular momentum transfer to perpendicular velocity
                                state.vel._[ 1 ] /= (1 + x);
                                state.vel._[ 1 ] += dim * state.angular.vel * x / (1 + x);
                                state.angular.vel = state.vel._[ 1 ] / dim;
                            }

                            p.set( bounds.min._[ 0 ], pos._[ 1 ] );
                            callback && callback( body, p );
                        }

                        // bottom
                        if ( (pos._[ 1 ] + dim) >= bounds.max._[ 1 ] ){

                            this.norm.set(0, -1);
                            p.set(0, -dim); // set perpendicular displacement from com to impact point
                            
                            // adjust position
                            pos._[ 1 ] = bounds.max._[ 1 ] - dim;

                            dir = (state.vel._[ 0 ] - dim * state.angular.vel);

                            impulse = applyImpulse(state, norm, p, body.moi, body.mass, cor);

                            // if we have friction
                            if ( cof && dir ){

                                // maximum impulse allowed by friction
                                max = dir / ( 1 / body.mass + dim * dim / body.moi );
                                dir = dir < 0 ? -1 : 1;

                                // get perp vector to norm in direction opposite the velocity
                                impulse *= dir * cof;
                                impulse = (dir === 1) ? Math.min( impulse, max ) : Math.max( impulse, max );
                                state.angular.vel += impulse * dim / body.moi;
                                state.vel._[ 0 ] -= impulse / body.mass;
                            }

                            p.set( pos._[ 0 ], bounds.max._[ 1 ] );
                            callback && callback( body, p );
                        }
                            
                        // top
                        if ( (pos._[ 1 ] - dim) <= bounds.min._[ 1 ] ){

                            // adjust position
                            pos._[ 1 ] = bounds.min._[ 1 ] + dim;
                            // adjust velocity
                            state.vel._[ 1 ] = -state.vel._[ 1 ];

                            if (x){
                                // angular momentum transfer to perpendicular velocity
                                state.vel._[ 0 ] /= (1 + x);
                                state.vel._[ 0 ] -= dim * state.angular.vel * x / (1 + x);
                                state.angular.vel = -state.vel._[ 0 ] / dim;
                            }

                            p.set( pos._[ 0 ], bounds.min._[ 1 ] );
                            callback && callback( body, p );
                        }

                    break;
                }
            }
        }
    };
});
