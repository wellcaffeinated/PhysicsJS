/**
 * class BodyImpulseResponseBehavior < Behavior
 *
 * `Physics.behavior('body-impulse-response')`.
 *
 * Responds to collisions by applying impulses.
 *
 * Additional options include:
 * - check: channel to listen to for collisions (default: `collisions:detected`).
 * - mtvThreshold: apply partial extraction of bodies if the minimum transit vector is less than this value ( default: `1`)
 *   this will depend on your simulation characteristic length scale
 * - bodyExtractDropoff: every body overlap correction (underneith mtvThreshold) will only extract by this fraction (0..1). Helps with stablizing contacts. (default: `0.5`)
 * - forceWakeupAboveOverlapThreshold: force bodies to wake up if the overlap is above mtvThreshold ( default: `true` )
 **/
Physics.behavior('body-impulse-response', function( parent ){

    var defaults = {
        // channel to listen to for collisions
        check: 'collisions:detected'
        // apply partial extraction of bodies if the minimum transit vector is less than this value
        // this will depend on your simulation characteristic length scale
        ,mtvThreshold: 1
        // every body overlap correction (underneith mtvThreshold) will only extract by this fraction (0..1)
        // helps with stablizing contacts.
        ,bodyExtractDropoff: 0.5
        // force bodies to wake up if the overlap is above mtvThreshold
        ,forceWakeupAboveOverlapThreshold: true
    };

    function getUid( b ){
        return b.uid;
    }

    return {

        // extended
        init: function( options ){

            parent.init.call( this );
            this.options.defaults( defaults );
            this.options( options );

            this._bodyList = [];
        },

        // no applyTo method
        applyTo: false,

        // extended
        connect: function( world ){

            world.on( this.options.check, this.respond, this );
        },

        // extended
        disconnect: function( world ){

            world.off( this.options.check, this.respond, this );
        },

        /** internal
         * BodyImpulseResponseBehavior#collideBodes( bodyA, bodyB, normal, point, mtrans, contact )
         * - bodyA (Object): First Body
         * - bodyB (Object): Second body
         * - normal (Vector): Normal vector of the collision surface
         * - point (Vector): Contact point of the collision
         * - mtrans (Vector): Minimum transit vector that is the smallest displacement to separate the bodies
         * - contact (Boolean): Are the bodies in resting contact relative to each other
         *
         * Collide two bodies by modifying their positions and velocities to conserve momentum
         **/
        collideBodies: function(bodyA, bodyB, normal, point, mtrans, contact){

            var fixedA = bodyA.treatment === 'static' || bodyA.treatment === 'kinematic'
                ,fixedB = bodyB.treatment === 'static' || bodyB.treatment === 'kinematic'
                ,scratch = Physics.scratchpad()
                // minimum transit vector for each body
                ,mtv = scratch.vector().clone( mtrans )
                ;

            // do nothing if both are fixed
            if ( fixedA && fixedB ){
                scratch.done();
                return;
            }

            // inverse masses and moments of inertia.
            // give fixed bodies infinite mass and moi
            var invMoiA = fixedA ? 0 : 1 / bodyA.moi
                ,invMoiB = fixedB ? 0 : 1 / bodyB.moi
                ,invMassA = fixedA ? 0 : 1 / bodyA.mass
                ,invMassB = fixedB ? 0 : 1 / bodyB.mass
                // coefficient of restitution between bodies
                ,cor = bodyA.restitution * bodyB.restitution
                // coefficient of friction between bodies
                ,cof = bodyA.cof * bodyB.cof
                // normal vector
                ,n = scratch.vector().clone( normal )
                // vector perpendicular to n
                ,perp = scratch.vector().clone( n ).perp()
                ,tmp = scratch.vector()
                // collision point from A's center
                ,rA = scratch.vector().clone( point )
                // collision point from B's center
                ,rB = scratch.vector().clone( point )
                    .vadd( bodyA.state.pos )
                    .vsub( bodyB.state.pos )
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
                ,inContact = contact
                ;

            if ( contact ){
                if ( mtv.normSq() < this.options.mtvThreshold ){
                    mtv.mult( this.options.bodyExtractDropoff );
                } else if ( this.options.forceWakeupAboveOverlapThreshold ) {
                    // wake up bodies if necessary
                    bodyA.sleep( false );
                    bodyB.sleep( false );
                }

                if ( fixedA ){

                    // push mtv to the stats for calculating the average
                    bodyB._mtvStats.push( mtv );

                } else if ( fixedB ){

                    // push mtv to the stats for calculating the average
                    bodyA._mtvStats.push( mtv.negate() );
                    mtv.negate();

                } else {

                    // push mtv to the stats for calculating the average
                    mtv.mult( 0.5 );
                    mtv.negate();
                    bodyA._mtvStats.push( mtv );
                    mtv.negate();
                    bodyB._mtvStats.push( mtv );
                }
            }

            // if moving away from each other... don't bother.
            if (vproj >= 0){
                scratch.done();
                return;
            }

            invMoiA = invMoiA === Infinity ? 0 : invMoiA;
            invMoiB = invMoiB === Infinity ? 0 : invMoiB;

            impulse =  - ((1 + cor) * vproj) / ( invMassA + invMassB + (invMoiA * rAreg * rAreg) + (invMoiB * rBreg * rBreg) );
            // vproj += impulse * ( invMass + (invMoi * rreg * rreg) );
            // angVel -= impulse * rreg * invMoi;


            if ( fixedA ){

                // apply impulse
                bodyB.state.vel.vadd( n.mult( impulse * invMassB ) );
                bodyB.state.angular.vel -= impulse * invMoiB * rBreg;

            } else if ( fixedB ){

                // apply impulse
                bodyA.state.vel.vsub( n.mult( impulse * invMassA ) );
                bodyA.state.angular.vel += impulse * invMoiA * rAreg;

            } else {

                // apply impulse
                bodyB.state.vel.vadd( n.mult( impulse * invMassB ) );
                bodyB.state.angular.vel -= impulse * invMoiB * rBreg;
                bodyA.state.vel.vsub( n.mult( invMassA * bodyB.mass ) );
                bodyA.state.angular.vel += impulse * invMoiA * rAreg;
            }

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
                max = Math.abs(vreg) / ( invMassA + invMassB + (invMoiA * rAproj * rAproj) + (invMoiB * rBproj * rBproj) );
                // the sign of vreg ( plus or minus 1 )
                sign = vreg < 0 ? -1 : 1;

                // get impulse due to friction
                impulse = cof * Math.abs( impulse );
                // constrain the impulse within the "friction cone" ( max < mu * impulse)
                impulse = Math.min( impulse, max );
                impulse *= sign;

                if ( fixedA ){

                    // apply frictional impulse
                    bodyB.state.vel.vsub( perp.mult( impulse * invMassB ) );
                    bodyB.state.angular.vel -= impulse * invMoiB * rBproj;

                } else if ( fixedB ){

                    // apply frictional impulse
                    bodyA.state.vel.vadd( perp.mult( impulse * invMassA ) );
                    bodyA.state.angular.vel += impulse * invMoiA * rAproj;

                } else {

                    // apply frictional impulse
                    bodyB.state.vel.vsub( perp.mult( impulse * invMassB ) );
                    bodyB.state.angular.vel -= impulse * invMoiB * rBproj;
                    bodyA.state.vel.vadd( perp.mult( invMassA * bodyB.mass ) );
                    bodyA.state.angular.vel += impulse * invMoiA * rAproj;
                }
            }

            // wake up bodies if necessary
            if ( bodyA.sleep() ){
                bodyA.sleepCheck();
            }
            if ( bodyB.sleep() ){
                bodyB.sleepCheck();
            }

            scratch.done();
        },

        // internal
        _pushUniq: function( body ){
            var idx = Physics.util.sortedIndex( this._bodyList, body, getUid );
            if ( this._bodyList[ idx ] !== body ){
                this._bodyList.splice( idx, 0, body );
            }
        },

        /** internal
         * BodyImpulseResponseBehavior#respond( data )
         * - data (Object): event data
         *
         * Event callback to respond to collision data.
         **/
        respond: function( data ){

            var self = this
                ,col
                ,collisions = Physics.util.shuffle(data.collisions)
                ,i,l,b
                ;

            for ( i = 0, l = collisions.length; i < l; ++i ){

                col = collisions[ i ];
                // add bodies to list for later
                this._pushUniq( col.bodyA );
                this._pushUniq( col.bodyB );
                // ensure they have mtv stat vectors
                col.bodyA._mtvStats = col.bodyA._mtvStats || new Physics.statistics({ useVectors: true });
                col.bodyB._mtvStats = col.bodyB._mtvStats || new Physics.statistics({ useVectors: true });

                self.collideBodies(
                    col.bodyA,
                    col.bodyB,
                    col.norm,
                    col.pos,
                    col.mtv,
                    col.collidedPreviously
                );
            }

            // apply mtv vectors from the average mtv vector
            for ( i = 0, l = this._bodyList.length; i < l; ++i ){
                b = this._bodyList.pop();
                b.state.pos.vadd( b._mtvStats.mean );
                b.state.old.pos.vadd( b._mtvStats.mean );
                b._mtvStats.clear();
            }
        }
    };
});
