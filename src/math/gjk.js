(function(){

    // the algorithm doesn't always converge for curved shapes.
    // need these constants to dictate how accurate we want to be.
    var gjkAccuracy = 0.0001;
    var gjkMaxIterations = 100;

    // get the next search direction from two simplex points
    var getNextSearchDir = function getNextSearchDir( ptA, ptB, dir ){

        var ABdotB = ptB.normSq() - ptB.dot( ptA )
            ,ABdotA = ptB.dot( ptA ) - ptA.normSq()
            ,ang
            ;

        // if the origin is farther than either of these points
        // get the direction from one of those points to the origin
        if ( ABdotB < 0 ){

            return dir.clone( ptB ).negate();

        } else if ( ABdotA > 0 ){

            return dir.clone( ptA ).negate();

        // otherwise, use the perpendicular direction from the simplex
        } else {

            // dir = AB = B - A
            dir.clone( ptB ).vsub( ptA );
            // if (left handed coordinate system)
            // A cross AB < 0 then get perpendicular counterclockwise
            ang = ptA.cross( dir );
            if ( ang === 0 ){
                // oops AB points in the same direction as the origin
                return dir;
            }
            return dir.perp( ang > 0 );
        }
    };

    /** hide
     * getClosestPoints( simplex ) -> Object
     * - simplex (Array): The simplex
     *
     * Figure out the closest points on the original objects
     * from the last two entries of the simplex
     **/
    var getClosestPoints = function getClosestPoints( simplex ){

        // see http://www.codezealot.org/archives/153
        // for algorithm details

        // we know that the position of the last point
        // is very close to the previous. (by nature of the distance test)
        // this won't give great results for the closest
        // points algorithm, so let's use the previous two
        var len = simplex.length
            ,last = len >= 3 ? simplex[ len - 2 ] : simplex[ len - 1 ]
            ,prev = len >= 3 ? simplex[ len - 3 ] : simplex[ len - 2 ]
            ,scratch = Physics.scratchpad()
            ,A = scratch.vector().clone( last.pt )
            // L = B - A
            ,L = scratch.vector().clone( prev.pt ).vsub( A )
            ,lambdaB
            ,lambdaA
            ;

        if ( L.equals(Physics.vector.zero) ){
            // oh.. it's a zero vector. So A and B are both the closest.
            // just use one of them
            return scratch.done({

                a: last.a,
                b: last.b
            });
        }

        lambdaB = - L.dot( A ) / L.normSq();
        lambdaA = 1 - lambdaB;

        if ( lambdaA <= 0 ){
            // woops.. that means the closest simplex point
            // isn't on the line it's point B itself
            return scratch.done({
                a: prev.a,
                b: prev.b
            });
        } else if ( lambdaB <= 0 ){
            // vice versa
            return scratch.done({
                a: last.a,
                b: last.b
            });
        }

        // guess we'd better do the math now...
        return scratch.done({
            // a closest = lambdaA * Aa + lambdaB * Ba
            a: A.clone( last.a ).mult( lambdaA ).vadd( L.clone( prev.a ).mult( lambdaB ) ).values(),
            // b closest = lambdaA * Ab + lambdaB * Bb
            b: A.clone( last.b ).mult( lambdaA ).vadd( L.clone( prev.b ).mult( lambdaB ) ).values()
        });
    };

    /**
     * Physics.gjk( support(axis)[, seed, checkOverlapOnly, debugFn] ) -> Object
     * - support (Function): The support function. Must return an object containing
       the witness points (`.a`, `.b`) and the support point (`.pt`).
       Recommended to use simple objects.
       Eg:
       ```javascript
       return {
            a: { x: 1, y:2 },
            b: { x: 3, y: 4 },
            pt: { x: 2, y: 2 }
       };
       ```
     * - axis (Physics.vector): The axis to search
     * - seed (Physics.vector): The starting direction for the simplex (defaults to x-axis)
     * - checkOverlapOnly (Boolean): only check whether there is an overlap, don't calculate the depth
     * - debugFn (Function): For debugging. Called at every iteration with the current simplex.
     *
     * Implementation agnostic GJK function.
     *
     * Gilbert–Johnson–Keerthi object collison algorithm
     * For general information about GJK see:
     * - [www.codezealot.org/archives/88](http://www.codezealot.org/archives/88)
     * - [mollyrocket.com/849](http://mollyrocket.com/849)
     *
     * The algorithm information returned:
     * ```javascript
     * {
     *     overlap: Boolean,
     *     simplex: [] // array containing simplex points as simple x/y objects
     * }
     * ```
     **/
    var gjk = function gjk( support, seed, checkOverlapOnly, debugFn ){

        var overlap = false
            ,noOverlap = false // if we're sure we're not overlapping
            ,distance = false
            ,simplex = []
            ,simplexLen = 1
            // setup a scratchpad of temporary cheap objects
            ,scratch = Physics.scratchpad()
            // use seed as starting direction or use x axis
            ,dir = scratch.vector().clone(seed || Physics.vector.axis[ 0 ])
            ,last = scratch.vector()
            ,lastlast = scratch.vector()
            // some temp vectors
            ,v1 = scratch.vector()
            ,v2 = scratch.vector()
            ,ab
            ,ac
            ,sign
            ,axab
            ,tmp
            ,iterations = 0
            ;

        // get the first Minkowski Difference point
        tmp = support( dir );
        simplexLen = simplex.push( tmp );
        last.clone( tmp.pt );
        // negate d for the next point
        dir.negate();

        // start looping
        while ( ++iterations ) {

            // swap last and lastlast, to save on memory/speed
            last.swap(lastlast);
            // push a new point to the simplex because we haven't terminated yet
            tmp = support( dir );
            simplexLen = simplex.push( tmp );
            last.clone( tmp.pt );

            if ( debugFn ){
                debugFn( simplex, dir, { overlap: overlap, noOverlap: noOverlap } );
            }

            if ( last.equals(Physics.vector.zero) ){
                // we happened to pick the origin as a support point... lucky.
                overlap = true;
                break;
            }

            // check if the last point we added actually passed the origin
            if ( !noOverlap && last.dot( dir ) <= 0.0 ) {
                // if the point added last was not past the origin in the direction of d
                // then the Minkowski difference cannot possibly contain the origin since
                // the last point added is on the edge of the Minkowski Difference

                // if we just need the overlap...
                if ( checkOverlapOnly ){
                    break;
                }

                noOverlap = true;
            }

            // if it's a line...
            if ( simplexLen === 2 ){

                // otherwise we need to determine if the origin is in
                // the current simplex and act accordingly

                dir = getNextSearchDir( last, lastlast, dir );
                // continue...

            // if it's a triangle... and we're looking for the distance
            } else if ( noOverlap ){

                // if we know there isn't any overlap and
                // we're just trying to find the distance...
                // make sure we're getting closer to the origin
                dir.normalize();
                tmp = lastlast.dot( dir );

                if ( Math.abs(tmp - last.dot( dir )) < gjkAccuracy ){

                    distance = -tmp;
                    break;
                }

                ab = ab || scratch.vector();
                ab.clone( last ).vsub( lastlast );
                axab = last.cross( ab );

                // if we are still getting closer then only keep
                // the points in the simplex that are closest to
                // the origin (we already know that last is closer
                // than the previous two)
                // the norm is the same as distance(origin, a)
                // use norm squared to avoid the sqrt operations
                if (lastlast.normSq() < v1.clone(simplex[ 0 ].pt).normSq()) {

                    simplex.shift();

                } else {

                    simplex.splice(1, 1);
                    lastlast.clone( simplex[0].pt );
                }

                if ( axab === 0 ){
                    // if the simplex leg points directly towards the origin...
                    distance = Math.max( -last.dot(dir), 0 );
                    break;
                }

                dir = getNextSearchDir( last, lastlast, dir );
                // continue...

            // if it's a triangle
            } else {

                // we need to trim the useless point...

                ab = ab || scratch.vector();
                ac = ac || scratch.vector();

                // get the edges AB and AC
                ab.clone( lastlast ).vsub( last );
                ac.clone( simplex[ 0 ].pt ).vsub( last );

                // here normally people think about this as getting outward facing
                // normals and checking dot products. Since we're in 2D
                // we can be clever...
                sign = ab.cross( ac ) > 0;
                axab = last.cross( ab );

                if ( axab === 0 ){

                    // the origin lies along our simplex
                    overlap = true;
                    break;

                } else if ( sign ^ (axab > 0) ){

                    // ok... so there's an XOR here... don't freak out
                    // remember last = A = -AO
                    // if AB cross AC and AO cross AB have the same sign
                    // then the origin is along the outward facing normal of AB
                    // so if AB cross AC and A cross AB have _different_ (XOR) signs
                    // then this is also the case... so we proceed...

                    // point C is dead to us now...
                    simplex.shift();

                    // if we haven't deduced that we've enclosed the origin
                    // then we know which way to look...
                    // morph the ab vector into its outward facing normal
                    ab.perp( !sign );

                    // swap
                    dir.swap( ab );

                    // continue...

                    // if we get to this if, then it means we can continue to look along
                    // the other outward normal direction (ACperp)
                    // if we don't see the origin... then we must have it enclosed
                } else if ( sign ^ (ac.cross( last ) > 0) ){
                    // then the origin is along the outward facing normal
                    // of AC; (ACperp)

                    // point B is dead to us now...
                    simplex.splice(1, 1);

                    ac.perp( sign );

                    // swap
                    dir.swap( ac );

                    // continue...

                } else {

                    // we have enclosed the origin!
                    overlap = true;
                    // fewf... take a break
                    break;
                }
            }

            // woah nelly... that's a lot of iterations.
            // Stop it!
            if (iterations > gjkMaxIterations){
                scratch.done();
                return {
                    simplex: simplex,
                    iterations: iterations,
                    maxIterationsReached: true
                };
            }
        }

        // free workspace
        scratch.done();

        if ( distance === 0 ){
            overlap = true;
        }

        tmp = {
            overlap: overlap,
            simplex: simplex,
            iterations: iterations
        };

        if ( !overlap ){

            tmp.distance = distance;
            tmp.closest = getClosestPoints( simplex );
        }

        return tmp;
    };


    var supportFnStack = [];
    /**
     * Physics.gjk.getSupportFn( bodyA, bodyB ) -> Function
     * - bodyA (Object): First body
     * - bodyB (Object): Second body
     * + (Function): The support function
     *
     * Get a general support function for use with GJK algorithm
     **/
    gjk.getSupportFn = function getSupportFn( bodyA, bodyB ){

        var hash = Physics.util.pairHash( bodyA.uid, bodyB.uid )
            ,fn = supportFnStack[ hash ]
            ;

        if ( !fn ){
            fn = supportFnStack[ hash ] = function pairSupportFunction( searchDir ){

                var tA = fn.tA
                    ,tB = fn.tB
                    ,vA = fn.tmpv1
                    ,vB = fn.tmpv2
                    ;

                if ( fn.useCore ){
                    vA = bodyA.geometry.getFarthestCorePoint( searchDir.rotateInv( tA ), vA, fn.marginA );
                    vB = bodyB.geometry.getFarthestCorePoint( searchDir.rotate( tA ).rotateInv( tB ).negate(), vB, fn.marginB );
                } else {
                    vA = bodyA.geometry.getFarthestHullPoint( searchDir.rotateInv( tA ), vA );
                    vB = bodyB.geometry.getFarthestHullPoint( searchDir.rotate( tA ).rotateInv( tB ).negate(), vB );
                }

                vA.vadd( bodyA.offset ).transform( tA );
                vB.vadd( bodyB.offset ).transform( tB );
                searchDir.negate().rotate( tB );

                return {
                    a: vA.values(),
                    b: vB.values(),
                    pt: vA.vsub( vB ).values()
                };
            };

            // transforms for coordinate transformations
            fn.tA = new Physics.transform();
            fn.tB = new Physics.transform();

            // temp vectors (used too frequently to justify scratchpad)
            fn.tmpv1 = new Physics.vector();
            fn.tmpv2 = new Physics.vector();

            // this is faster...
            // http://jsperf.com/data-on-fn-vs-data-on-object
            fn.useCore = false;
            fn.bodyA = bodyA;
            fn.bodyB = bodyB;
            fn.update = function(){
                fn.tA.setRotation( bodyA.state.angular.pos ).setTranslation( bodyA.state.pos );
                fn.tB.setRotation( bodyB.state.angular.pos ).setTranslation( bodyB.state.pos );
            };

            fn.update();
        }

        fn.marginA = 0;
        fn.marginB = 0;

        return fn;
    };

    Physics.gjk = gjk;

})();
