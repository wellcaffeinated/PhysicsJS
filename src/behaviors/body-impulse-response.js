// object bouncing collision response
Physics.behavior('body-impulse-response', function( parent ){
    
    var defaults = {

    };

    var PUBSUB_TOPIC = 'collision-detect';

    return {

        priority: 1,

        init: function( options ){

            this._collisions = [];
            this.collect = Physics.util.bind(this.collect, this);
        },

        collect: function( data ){
        
            this._collisions.push( data );
        },

        // custom set world in order to subscribe to events
        setWorld: function( world ){

            if (this._world){

                this._world.unsubscribe( PUBSUB_TOPIC, this.collect );
            }

            world.subscribe( PUBSUB_TOPIC, this.collect );
            this._world = world;
            parent.setWorld.call( this, world );
        },

        collideBodies: function(bodyA, bodyB, normal, point, mtrans){

            var invMoiA = 1 / bodyA.moi
                ,invMoiB = 1 / bodyB.moi
                ,invMassA = 1 / bodyA.mass
                ,invMassB = 1 / bodyB.mass
                // coefficient of restitution between bodies
                ,cor = bodyA.restitution * bodyB.restitution
                // coefficient of friction between bodies
                ,cof = bodyA.cof * bodyB.cof
                ,scratch = Physics.scratchpad()
                // minimum transit vector for each body
                ,mtv = scratch.vector().clone( mtrans ).mult( 0.5 )
                // normal vector
                ,n = scratch.vector().clone( normal )
                // vector perpendicular to n
                ,perp = scratch.vector().clone( n ).perp()
                // collision point from A's center
                ,rA = scratch.vector().clone( point ).vsub( bodyA.state.pos )
                // collision point from B's center
                ,rB = scratch.vector().clone( point ).vsub( bodyB.state.pos )
                ,tmp = scratch.vector()
                ,angVelA = bodyA.state.angular.vel
                ,angVelB = bodyB.state.angular.vel
                // relative velocity towards B at collision point
                ,vAB = scratch.vector().clone( bodyB.state.vel )
                        .vadd( tmp.clone(rB).perp().mult( angVelB ) )
                        .vsub( bodyA.state.vel )
                        .vsub( tmp.clone(rA).perp().mult( angVelA ) )
                // break up components along normal and perp-normal directions
                ,rAproj = rA.proj( n )
                ,rAreg = rA.proj( perp )
                ,rBproj = rB.proj( n )
                ,rBreg = rB.proj( perp )
                ,vproj = vAB.proj( n ) // projection of vAB along n
                ,vreg = vAB.proj( perp ) // rejection of vAB along n (perp of proj)
                ,impulse
                ,sign
                ,max
                ,inContact = false
                ;

            // if moving away from each other... don't bother.
            if (vproj >= 0){
                scratch.done();
                return;
            }

            impulse =  - ((1 + cor) * vproj) / ( invMassA + invMassB + (invMoiA * rAreg * rAreg) + (invMoiB * rBreg * rBreg) );
            // vproj += impulse * ( invMass + (invMoi * rreg * rreg) );
            // angVel -= impulse * rreg * invMoi;

            // extract bodies
            bodyA.state.pos.vadd( mtv );
            bodyB.state.pos.vsub( mtv );

            // apply impulse
            bodyB.state.vel.vadd( n.mult( impulse * invMassB ) );
            bodyB.state.angular.vel += impulse * invMoiB * rBreg;
            bodyA.state.vel.vsub( n.mult( invMassA * bodyB.mass ) );
            bodyA.state.angular.vel -= impulse * invMoiA * rAreg;

            // inContact = (impulse < 0.004);
            
            // if we have friction and a relative velocity perpendicular to the normal
            if ( cof && vreg ){


                // TODO: here, we could first assume static friction applies
                // and that the tangential relative velocity is zero.
                // Then we could calculate the impulse and check if the
                // tangential impulse is less than that allowed by static
                // friction. If not, _then_ apply kinetic friction.

                // instead we're just applying kinetic friction and making
                // sure the impulse we apply is less than the maximum
                // allowed amount

                // maximum impulse allowed by kinetic friction
                max = vreg / ( invMassA + invMassB + (invMoiA * rAproj * rAproj) + (invMoiB * rBproj * rBproj) );

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

                // angVel -= impulse * rproj * invMoi;
                // vreg -= impulse * ( invMass + (invMoi * rproj * rproj) );
                bodyB.state.vel.vsub( perp.mult( impulse * invMassB ) );
                bodyB.state.angular.vel -= impulse * invMoiB * rBproj;
                bodyA.state.vel.vadd( perp.mult( invMassA * bodyB.mass ) );
                bodyA.state.angular.vel += impulse * invMoiA * rAproj;
            }

            // adjust velocities
            // state.angular.vel = angVel;
            // v.clone( n ).mult( vproj - angVel * rreg ).vadd( perp.mult( vreg - angVel * rproj ) );

            scratch.done();
        },

        behave: function(){

            var col
                ,collisions = this._collisions
                ;

            this._collisions = [];

            for ( var i = 0, l = collisions.length; i < l; ++i ){
                
                col = collisions[ i ];
                this.collideBodies( col.bodyA, col.bodyB, col.norm, col.pos, col.mtv );
            }
        }
    };
});
