/**
 * class BodyCollisionDetectionBehavior < Behavior
 *
 * `Physics.behavior('body-collision-detection')`.
 *
 * Detect collisions of bodies.
 *
 * Publishes collision events to the world as a group of detected collisions per iteration.
 *
 * The event data will have a `.collisions` property that is an array of collisions of the form:
 *
 * ```javascript
 * {
 *     bodyA: // the first body
 *     bodyB: // the second body
 *     norm: // the normal vector (Vectorish)
 *     mtv: // the minimum transit vector. (the direction and length needed to extract bodyB from bodyA)
 *     pos: // the collision point relative to bodyA
 *     overlap: // the amount bodyA overlaps bodyB
 * }
 * ```
 *
 * Additional options include:
 * - check: channel to listen to for collision candidates (default: `collisions:candidates`). set to `true` to force check every pair of bodies in the world
 * - channel: channel to publish events to (default: `collisions:detected`)
 **/
Physics.behavior('body-collision-detection', function( parent ){

    var maxGJKTries = 110;


    var defaults = {

        // channel to listen to for collision candidates
        // set to "true" to force check every pair of bodies in the world
        check: 'collisions:candidates',

        // channel to publish events to
        channel: 'collisions:detected'
    };

    return {

        // extended
        init: function( options ){

            parent.init.call( this );
            this.options.defaults( defaults );
            this.options( options );
        },

        // extended
        connect: function( world ){

            if ( this.options.check === true ){

                world.on( 'integrate:velocities', this.checkAll, this );

            } else {

                world.on( this.options.check, this.check, this );
            }
        },

        // extended
        disconnect: function( world ){

            if ( this.options.check === true ){

                world.off( 'integrate:velocities', this.checkAll, this );

            } else {

                world.off( this.options.check, this.check, this );
            }
        },

        // getMinDistance: function( support, d, dimA, dimB, res, aIsCircle, bIsCircle ){
        //
        //     var result
        //         ,dx = 1 / res
        //         ,incA = dimA * dx
        //         ,incB = dimB * dx
        //         ,incFactor = 1 / (incA + incB)
        //         ,threshold = 2 * (incA + incB)
        //         ,n = (0.9 * res) | 0
        //         ,tries = 0
        //         ;
        //
        //     support.useCore = true;
        //
        //     if ( aIsCircle ){
        //         threshold = 2 * incB + dimA;
        //         incA = 0;
        //         incFactor = 1 / incB;
        //     } else if ( bIsCircle ){
        //         threshold = 2 * incA + dimB;
        //         incB = 0;
        //         incFactor = 1 / incA;
        //     }
        //
        //     while( tries++ < maxGJKTries ){
        //         support.marginA = n * incA;
        //         support.marginB = n * incB;
        //         // console.log(tries, n, support.marginA, support.marginB);
        //         result = Physics.gjk( support, d );
        //         // console.log('dist', result.distance);
        //
        //         // move forward one
        //         if ( result.overlap || result.distance === 0 ){
        //             n++;
        //             continue;
        //         }
        //
        //         if ( result.distance < threshold ){
        //             this._world.emit('debug', tries);
        //             return result;
        //         }
        //
        //         // go back number of increments that distance allows (less one)
        //         n -= (result.distance * incFactor * 0.9)|0;
        //         n = n < 0 ? 0 : n;
        //     }
        //     this._world.emit('debug', tries);
        //     return false;
        // },

        /**
         * BodyCollisionDetectionBehavior#checkGJK( bodyA, bodyB ) -> Object
         * - bodyA (Object): First body
         * - bodyB (Object): Second body
         * + (Object): Collision result
         *
         * Use GJK algorithm to check arbitrary bodies for collisions
         **/
        checkGJK: function( bodyA, bodyB ){

            var scratch = Physics.scratchpad()
                ,d = scratch.vector()
                ,tmp = scratch.vector()
                ,os = scratch.vector()
                ,overlap
                ,result
                ,support
                ,collision = false
                ,aabbA = bodyA.geometry.aabb()
                ,dimA = Math.min( aabbA.hw, aabbA.hh ) || 1
                ,aabbB = bodyB.geometry.aabb()
                ,dimB = Math.min( aabbB.hw, aabbB.hh ) || 1
                ,aIsCircle = (bodyA.geometry.name === 'circle')
                ,bIsCircle = (bodyB.geometry.name === 'circle')
                ,tries = 0
                ,incA
                ,incB
                ;

            // just check the overlap first
            support = Physics.gjk.getSupportFn( bodyA, bodyB );
            support.update();
            d.clone( bodyA.state.pos ).vsub( bodyB.state.pos );

            if ( d.equals(Physics.vector.zero) ){
                d.set(0, 1);
            }

            incA = aIsCircle ? 0 : 1e-2 * dimA;
            incB = bIsCircle ? 0 : 1e-2 * dimA;

            // if one is a circle, use its radius as the margin
            support.useCore = true;
            support.marginA = aIsCircle ? dimA : incA;
            support.marginB = bIsCircle ? dimB : incB;

            // while there's still an overlap (or we don't have a positive distance)
            // and the support margins aren't bigger than the shapes...
            // search for the distance data
            while (
                (!result || result.overlap || result.distance === 0) &&
                tries++ < maxGJKTries
            ){
                result = Physics.gjk(support, d);

                support.marginA += incA;
                support.marginB += incB;
            }

            if ( result.overlap || result.maxIterationsReached ){
                // gjk failed...
                // console.log('failed', result.maxIterationsReached);
                return scratch.done(false);
            }

            // calc overlap
            overlap = (support.marginA + support.marginB) - result.distance;

            // if the distance is greater than combined margins... it's not intersecting
            if ( overlap <= 0 ){
                return scratch.done(false);
            }

            // there is a collision. let's do more work.
            collision = {
                bodyA: bodyA,
                bodyB: bodyB
            };

            d.vadd( bodyA.getGlobalOffset( os ) ).vsub( bodyB.getGlobalOffset( os ) );

            collision.overlap = overlap;
            // @TODO: for now, just let the normal be the mtv
            collision.norm = d.clone( result.closest.b ).vsub( tmp.clone( result.closest.a ) ).normalize().values();
            collision.mtv = d.mult( overlap ).values();
            // get a corresponding hull point for one of the core points.. relative to body A
            collision.pos = d.clone( collision.norm ).mult( support.marginA ).vadd( tmp.clone( result.closest.a ) ).vsub( bodyA.state.pos ).values();

            return scratch.done( collision );
        },

        /**
         * BodyCollisionDetectionBehavior#checkCircles( bodyA, bodyB ) -> Object
         * - bodyA (Object): First body
         * - bodyB (Object): Second body
         * + (Object): Collision result
         *
         * Check two circles for collisions.
         **/
        checkCircles: function( bodyA, bodyB ){

            var scratch = Physics.scratchpad()
                ,d = scratch.vector()
                ,tmp = scratch.vector()
                ,overlap
                ,collision = false
                ;

            d.clone( bodyB.state.pos )
                .vadd( bodyB.getGlobalOffset( tmp ) )
                .vsub( bodyA.state.pos )
                .vsub( bodyA.getGlobalOffset( tmp ) ) // save offset for later
                ;
            overlap = d.norm() - (bodyA.geometry.radius + bodyB.geometry.radius);

            // hmm... they overlap exactly... choose a direction
            if ( d.equals( Physics.vector.zero ) ){

                d.set( 1, 0 );
            }

            if ( overlap <= 0 ){

                collision = {
                    bodyA: bodyA,
                    bodyB: bodyB,
                    norm: d.normalize().values(),
                    mtv: d.mult( -overlap ).values(),
                    pos: d.mult( -bodyA.geometry.radius/overlap ).vadd( tmp ).values(),
                    overlap: -overlap
                };
            }

            return scratch.done( collision );
        },

        /**
         * checkPair( bodyA, bodyB ) -> Object
         * - bodyA (Object): First body
         * - bodyB (Object): Second body
         * + (Object): Collision result
         *
         * Check a pair for collisions
         **/
        checkPair: function( bodyA, bodyB ){

            // filter out bodies that don't collide with each other
            if (
                ( bodyA.treatment === 'static' || bodyA.treatment === 'kinematic' ) &&
                ( bodyB.treatment === 'static' || bodyB.treatment === 'kinematic' )
            ){
                return false;
            }

            if ( bodyA.geometry.name === 'circle' && bodyB.geometry.name === 'circle' ){

                return this.checkCircles( bodyA, bodyB );

            } else if ( bodyA.geometry.name === 'compound' || bodyB.geometry.name === 'compound' ){
                // compound bodies are special. We can't use gjk because
                // they could have concavities. so we do the pieces individually
                var test = (bodyA.geometry.name === 'compound')
                    ,compound = test ? bodyA : bodyB
                    ,other = test ? bodyB : bodyA
                    ,cols
                    ,ch
                    ,ret = []
                    ,scratch = Physics.scratchpad()
                    ,vec = scratch.vector()
                    ,oldPos = scratch.vector()
                    ,otherAABB = other.aabb()
                    ,i
                    ,l
                    ;

                for ( i = 0, l = compound.children.length; i < l; i++ ){

                    ch = compound.children[ i ];
                    // move body to fake position
                    oldPos.clone( ch.state.pos );
                    ch.offset.vadd( oldPos.vadd( compound.offset ).rotate( -ch.state.angular.pos ) );
                    ch.state.pos.clone( compound.state.pos );
                    ch.state.angular.pos += compound.state.angular.pos;

                    // check it if the aabbs overlap
                    if ( Physics.aabb.overlap(otherAABB, ch.aabb()) ){

                        cols = this.checkPair( other, ch );

                        if ( cols instanceof Array ){
                            for ( var j = 0, c, ll = cols.length; j < ll; j++ ){
                                c = cols[j];
                                // set body to be the compound body
                                if ( c.bodyA === ch ){
                                    c.bodyA = compound;
                                } else {
                                    c.bodyB = compound;
                                }
                                ret.push( c );
                            }

                        } else if ( cols ) {
                            // set body to be the compound body
                            if ( cols.bodyA === ch ){
                                cols.bodyA = compound;
                            } else {
                                cols.bodyB = compound;
                            }
                            ret.push( cols );
                        }
                    }

                    // transform it back
                    ch.state.angular.pos -= compound.state.angular.pos;
                    ch.offset.vsub( oldPos );
                    ch.state.pos.clone( oldPos.rotate( ch.state.angular.pos ).vsub( compound.offset ) );
                }

                return scratch.done( ret );

            } else {

                return this.checkGJK( bodyA, bodyB );
            }
        },

        /** internal
         * BodyCollisionDetectionBehavior#check( data )
         * - data (Object): The event data
         *
         * Event callback to check pairs of objects that have been flagged by broad phase for possible collisions.
         **/
        check: function( data ){

            var candidates = data.candidates
                ,pair
                ,targets = this.getTargets()
                ,collisions = []
                ,ret
                ,prevContacts = this.prevContacts || {}
                ,contactList = {}
                ,pairHash = Physics.util.pairHash
                ,hash
                ;

            for ( var i = 0, l = candidates.length; i < l; ++i ){

                pair = candidates[ i ];

                if ( targets === this._world._bodies ||
                    // only check if the members are targeted by this behavior
                    (Physics.util.indexOf( targets, pair.bodyA ) > -1) &&
                    (Physics.util.indexOf( targets, pair.bodyB ) > -1)
                ){
                    ret = this.checkPair( pair.bodyA, pair.bodyB );

                    if ( ret instanceof Array ){

                        for ( var j = 0, r, ll = ret.length; j < ll; j++ ){
                            r = ret[j];
                            if ( r ){
                                hash = pair.hash; //pairHash( pair.bodyA.uid, pair.bodyB.uid );
                                contactList[ hash ] = true;
                                r.collidedPreviously = prevContacts[ hash ];
                                collisions.push( r );
                            }
                        }

                    } else if ( ret ){
                        hash = pair.hash; //pairHash( pair.bodyA.uid, pair.bodyB.uid );
                        contactList[ hash ] = true;
                        ret.collidedPreviously = prevContacts[ hash ];

                        collisions.push( ret );
                    }
                }
            }

            this.prevContacts = contactList;

            if ( collisions.length ){

                this._world.emit( this.options.channel, {
                    collisions: collisions
                });
            }
        },

        /** internal
         * BodyCollisionDetectionBehavior#checkAll( data )
         * - data (Object): The event data
         *
         * Event callback to check all pairs of objects in the list for collisions
         **/
        checkAll: function( data ){

            var bodies = this.getTargets()
                ,dt = data.dt
                ,bodyA
                ,bodyB
                ,collisions = []
                ,ret
                ,prevContacts = this.prevContacts || {}
                ,contactList = {}
                ,pairHash = Physics.util.pairHash
                ,hash
                ;

            for ( var j = 0, l = bodies.length; j < l; j++ ){

                bodyA = bodies[ j ];

                for ( var i = j + 1; i < l; i++ ){

                    bodyB = bodies[ i ];

                    ret = this.checkPair( bodyA, bodyB );

                    if ( ret instanceof Array ){

                        for ( var k = 0, r, ll = ret.length; k < ll; k++ ){
                            r = ret[k];
                            if ( r ){
                                hash = pairHash( bodyA.uid, bodyB.uid );
                                contactList[ hash ] = true;
                                r.collidedPreviously = prevContacts[ hash ];
                                collisions.push( r );
                            }
                        }

                    } else if ( ret ){
                        hash = pairHash( bodyA.uid, bodyB.uid );
                        contactList[ hash ] = true;
                        ret.collidedPreviously = prevContacts[ hash ];

                        collisions.push( ret );
                    }
                }
            }

            this.prevContacts = contactList;

            if ( collisions.length ){

                this._world.emit( this.options.channel, {
                    collisions: collisions
                });
            }
        }
    };

});
