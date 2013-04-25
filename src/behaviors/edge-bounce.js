// edge-bounce behavior
Physics.behavior('edge-bounce', function( parent ){

    var defaults = {

        bounds: null,
        restitution: 1.0
    };

    var PUBSUB_TOPIC = 'edge-bounce';

    var perp = Physics.vector(); //tmp
    var applyImpulse = function applyImpulse(state, n, r, moi, mass, cor, cof){

        perp.clone( n ).perp();

        // break up components along normal and perp-normal directions
        var v = state.vel
            ,angVel = state.angular.vel
            ,vproj = v.proj( n ) // projection of v along n
            ,vreg = v.proj( perp ) // rejection of v along n (perp of proj)
            ,rproj = r.proj( n )
            ,rreg = r.proj( perp )
            ,impulse
            ,sign
            ,max
            ,inContact = false
            ,invMass = 1 / mass
            ,invMoi = 1 / moi
            ;

        // account for rotation ... += (r omega) in the tangential direction
        vproj += angVel * rreg;
        vreg += angVel * rproj;

        impulse =  - ((1 + cor) * vproj) / ( invMass + (invMoi * rreg * rreg) );
        vproj += impulse * ( invMass + (invMoi * rreg * rreg) );
        angVel -= impulse * rreg * invMoi;
        // inContact = (impulse < 0.004);
        
        // if we have friction and a relative velocity perpendicular to the normal
        if ( cof && vreg ){

            // maximum impulse allowed by friction
            max = vreg / ( invMass + (invMoi * rproj * rproj) );

            if (!inContact){
                // the sign of vreg ( plus or minus 1 )
                sign = vreg < 0 ? -1 : 1;

                // get impulse due to friction
                impulse *= sign * cof;
                // make sure the impulse isn't giving the system energy
                impulse = (sign === 1) ? Math.min( impulse, max ) : Math.max( impulse, max );
                
            } else {

                impulse = max;
            }

            angVel -= impulse * rproj * invMoi;
            vreg -= impulse * ( invMass + (invMoi * rproj * rproj) );
        }

        // adjust velocities
        state.angular.vel = angVel;
        v.clone( n ).mult( vproj - angVel * rreg ).vadd( perp.mult( vreg - angVel * rproj ) );
    };

    return {

        init: function( options ){

            // call parent init method
            parent.init.call(this, options);

            options = Physics.util.extend({}, defaults, options);

            this.setBounds( options.bounds );
            this.restitution = options.restitution;
        },

        setBounds: function( bounds ){

            if (!bounds) throw 'Error: bounds not set';

            this.bounds = bounds;
            this._edges = [
                // set edges
            ];
        },
        
        behave: function( bodies, dt ){

            var body
                ,pos
                ,state
                ,scratch = Physics.scratchpad()
                ,p = scratch.vector()
                ,bounds = this.bounds
                ,world = this._world
                ,dim
                ,x
                ,cor
                ,cof = 0.6
                ,norm = scratch.vector()
                ,impulse
                ;

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

                            norm.set(-1, 0);
                            p.set(dim, 0); // set perpendicular displacement from com to impact point
                            
                            // adjust position
                            pos._[ 0 ] = bounds.max._[ 0 ] - dim;

                            applyImpulse(state, norm, p, body.moi, body.mass, cor, cof);

                            p.set( bounds.max._[ 0 ], pos._[ 1 ] );
                            world && world.publish({ topic: PUBSUB_TOPIC, body: body, point: p.values() });
                        }
                        
                        // left
                        if ( (pos._[ 0 ] - dim) <= bounds.min._[ 0 ] ){

                            norm.set(1, 0);
                            p.set(-dim, 0); // set perpendicular displacement from com to impact point
                            
                            // adjust position
                            pos._[ 0 ] = bounds.min._[ 0 ] + dim;

                            applyImpulse(state, norm, p, body.moi, body.mass, cor, cof);

                            p.set( bounds.min._[ 0 ], pos._[ 1 ] );
                            world && world.publish({ topic: PUBSUB_TOPIC, body: body, point: p.values() });
                        }

                        // bottom
                        if ( (pos._[ 1 ] + dim) >= bounds.max._[ 1 ] ){

                            norm.set(0, -1);
                            p.set(0, dim); // set perpendicular displacement from com to impact point
                            
                            // adjust position
                            pos._[ 1 ] = bounds.max._[ 1 ] - dim;

                            applyImpulse(state, norm, p, body.moi, body.mass, cor, cof);

                            p.set( pos._[ 0 ], bounds.max._[ 1 ] );
                            world && world.publish({ topic: PUBSUB_TOPIC, body: body, point: p.values() });
                        }
                            
                        // top
                        if ( (pos._[ 1 ] - dim) <= bounds.min._[ 1 ] ){

                            norm.set(0, 1);
                            p.set(0, -dim); // set perpendicular displacement from com to impact point
                            
                            // adjust position
                            pos._[ 1 ] = bounds.min._[ 1 ] + dim;

                            applyImpulse(state, norm, p, body.moi, body.mass, cor, cof);

                            p.set( pos._[ 0 ], bounds.min._[ 1 ] );
                            world && world.publish({ topic: PUBSUB_TOPIC, body: body, point: p.values() });
                        }

                    break;
                }
            }

            scratch.done();
        }
    };
});
