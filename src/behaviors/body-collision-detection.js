Physics.behavior('body-collision-detection', function( parent ){

    var PUBSUB_CANDIDATES = 'collisions:candidates';
    var PUBSUB_COLLISION = 'collisions:detected';

    // get general support function
    var getSupportFn = function getSupportFn( bodyA, bodyB ){

        var fn;

        fn = function( searchDir ){

            var scratch = Physics.scratchpad()
                ,tA = scratch.transform().setTranslation( bodyA.state.pos ).setRotation( bodyA.state.angular.pos )
                ,tB = scratch.transform().setTranslation( bodyB.state.pos ).setRotation( bodyB.state.angular.pos )
                ,vA = scratch.vector()
                ,vB = scratch.vector()
                ,method = fn.useCore? 'getFarthestCorePoint' : 'getFarthestHullPoint'
                ,margin = fn.margin
                ,ret
                ;

            vA = bodyA.geometry[ method ]( searchDir.rotateInv( tA ), vA, margin ).transform( tA );
            vB = bodyB.geometry[ method ]( searchDir.rotate( tA ).rotateInv( tB ).negate(), vB, margin ).transform( tB );

            searchDir.negate().rotate( tB );

            ret = {
                a: vA.values(),
                b: vB.values(),
                pt: vA.vsub( vB ).values() 
            };
            scratch.done();
            return ret;
        };

        fn.useCore = false;
        fn.margin = 0;

        return fn;
    };

    var checkGJK = function checkGJK( bodyA, bodyB ){

        var scratch = Physics.scratchpad()
            ,d = scratch.vector()
            ,tmp = scratch.vector()
            ,overlap
            ,result
            ,support
            ,collision = false
            ;

        // just check the overlap first
        support = getSupportFn( bodyA, bodyB );
        d.clone( bodyA.state.pos ).vsub( bodyB.state.pos );
        result = Physics.gjk(support, d, true);

        if ( result.overlap ){

            // there is a collision. let's do more work.
            collision = {
                bodyA: bodyA,
                bodyB: bodyB
            };

            // first get the min distance of between core objects
            support.useCore = true;
            support.margin = 0;

            while ( result.overlap ){
                support.margin += 1;
                result = Physics.gjk(support, d);
            }

            if ( result.overlap || result.maxIterationsReached ){
                scratch.done();
                // This implementation can't deal with a core overlap yet
                return false;
            }

            // calc overlap
            overlap = Math.max(0, 2 * support.margin - result.distance);
            collision.overlap = overlap;
            // @TODO: for now, just let the normal be the mtv
            collision.norm = d.clone( result.closest.b ).vsub( tmp.clone( result.closest.a ) ).normalize().values();
            collision.mtv = d.mult( overlap ).values();
            // get a corresponding hull point for one of the core points.. relative to body A
            collision.pos = d.clone( collision.norm ).mult( support.margin ).vadd( tmp.clone( result.closest.a ) ).vsub( bodyA.state.pos ).values();
        }

        scratch.done();
        return collision;
    };

    // both expected to be circles
    var checkCircles = function checkCircles( bodyA, bodyB ){

        var scratch = Physics.scratchpad()
            ,d = scratch.vector()
            ,tmp = scratch.vector()
            ,overlap
            ,collision = false
            ;
        
        d.clone( bodyB.state.pos ).vsub( bodyA.state.pos );
        overlap = d.norm() - (bodyA.geometry.radius + bodyB.geometry.radius);

        // if ( overlap > 0 ){
        //     // check the future
        //     d.vadd( tmp.clone(bodyB.state.vel).mult( dt ) ).vsub( tmp.clone(bodyA.state.vel).mult( dt ) );
        //     overlap = d.norm() - (bodyA.geometry.radius + bodyB.geometry.radius);
        // }

        if ( overlap <= 0 ){

            collision = {
                bodyA: bodyA,
                bodyB: bodyB,
                norm: d.normalize().values(),
                mtv: d.mult( -overlap ).values(),
                pos: d.normalize().mult( bodyA.geometry.radius ).values(),
                overlap: overlap
            };
        }
    
        scratch.done();
        return collision;
    };

    var checkPair = function checkPair( bodyA, bodyB ){

        if ( bodyA.geometry.name === 'circle' && bodyB.geometry.name === 'circle' ){

            return checkCircles( bodyA, bodyB );

        } else {

            return checkGJK( bodyA, bodyB );
        }
    };

    var sweep = function sweep( data ){
        if (!data.callback || !this._world){
            return;
        }
        
        var list = [];
        detectCollisions( this._world._bodies, this._world.timeStep(), function( data ){
            list.push( data );
        });
        data.callback( list );
    }

    var defaults = {

        // force check every pair of bodies in the world
        checkAll: false
    };

    return {

        priority: 10,

        init: function( options ){

            parent.init.call(this, options);

            this.options = Physics.util.extend({}, this.options, defaults, options);

            this.sweep = Physics.util.bind(this.sweep, this);
        },

        setWorld: function( world ){

            if (this._world){

                this._world.unsubscribe( PUBSUB_COLLISION + ':request-sweep', this.sweep );
            }

            world.subscribe( PUBSUB_COLLISION + ':request-sweep', this.sweep );

            parent.setWorld.call( this, world );
        },

        sweep: sweep,

        behave: function( bodies, dt ){
            
            if ( !this.options.checkAll ){
                return;
            }

            var bodyA
                ,bodyB
                ,collisions = []
                ,ret
                ;

            for ( var j = 0, l = bodies.length; j < l; j++ ){
                
                bodyA = bodies[ j ];

                for ( var i = j + 1; i < l; i++ ){

                    bodyB = bodies[ i ];

                    // don't detect two fixed bodies
                    if ( !bodyA.fixed || !bodyB.fixed ){
                        
                        ret = checkPair( bodyA, bodyB );

                        if ( ret ){
                            collisions.push( ret );
                        }
                    }
                }
            }

            if ( collisions.length ){

                this._world.publish({
                    topic: PUBSUB_COLLISION,
                    collisions: collisions
                });
            }
        }
    };

});