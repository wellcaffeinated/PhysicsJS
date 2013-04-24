// Gilbert–Johnson–Keerthi object collison algorithm
// For general information about GJK see: 
// * http://www.codezealot.org/archives/88
// * http://mollyrocket.com/849
(function(){

var gjkAccuracy = 0.0001;
var gjkMaxIterations = 100;

// get the next search direction from two simplex points
var getNextSearchDir = function getNextSearchDir( ptA, ptB, dir ){

    var ABdotB = ptB.normSq() - ptB.dot( ptA )
        ,ABdotA = ptB.dot( ptA ) - ptA.normSq()
        ;

    if ( ABdotB < 0 ){

        return dir.clone( ptB ).negate();

    } else if ( ABdotA > 0 ){

        return dir.clone( ptA ).negate();

    } else {

        // dir = AB = B - A
        dir.clone( ptB ).vsub( ptA );
        // if (left handed coordinate system) 
        // A cross AB < 0 then get perpendicular counter clockwise 
        return dir.perp( (ptA.cross( dir ) < 0) );
    }
};

/**
 * Implementation agnostic GJK function.
 * @param  {Function} support The support function. 
 *                            Signature: function(<Physics.vector> axis).
 *                            axis: The axis to use
 * @param {Physics.vector} seed The starting direction for the simplex
 * @return {Object} The algorithm information containing properties: .overlap (bool), and .simplex (Array)
 */
var gjk = function gjk( support, seed, checkOverlapOnly ){

    var overlap = false
        ,noOverlap = false // if we're sure we're not overlapping
        ,distance = false
        ,simplex = []
        ,simplexLen = 1
        // setup a scratchpad of temporary cheap objects
        ,scratch = Physics.scratchpad()
        // use seed as starting direction or use x axis
        ,dir = scratch.vector().clone(seed || Physics.vector.axis[ 0 ])
        ,last
        ,lastlast
        ,ab
        ,ac
        ,sign
        ,tmp
        ,iterations = 0
        ;

    // get the first Minkowski Difference point
    last = support( dir );
    simplexLen = simplex.push( last );
    // negate d for the next point
    dir.negate();

    // start looping
    while ( ++iterations ) {

        // push a new point to the simplex because we haven't terminated yet
        lastlast = last;
        last = support( dir );
        simplexLen = simplex.push( last );

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
            tmp = last.dot( dir );
            if ( (tmp - lastlast.dot( dir )) < gjkAccuracy ){

                distance = -tmp;
                // we didn't end up using the lastlast point
                simplex.splice(1, 1);
                break;
            }

            // if we are still getting closer then only keep
            // the points in the simplex that are closest to
            // the origin (we already know that last is closer
            // than the previous two)
            // the norm is the same as distance(origin, a)
            // use norm squared to avoid the sqrt operations
            if (lastlast.normSq() < simplex[ 0 ].normSq()) {
                
                simplex.shift();

            } else {
                
                simplex.splice(1, 1);
            }

            dir = getNextSearchDir( simplex[ 1 ], simplex[ 0 ], dir );
            // continue...

        // if it's a triangle
        } else {

            // we need to trim the useless point...

            ab = ab || scratch.vector();
            ac = ac || scratch.vector();

            // get the edges AB and AC
            ab.clone( lastlast ).vsub( last );
            ac.clone( simplex[ 0 ] ).vsub( last );

            // here normally people think about this as getting outward facing
            // normals and checking dot products. Since we're in 2D
            // we can be clever...
            sign = ab.cross( ac ) > 0;
            
            if ( sign ^ (last.cross( ab ) > 0) ){

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
                ab.perp( sign );
                // swap names
                sign = dir;
                dir = ab;
                ab = sign;
                
                // continue...

                // if we get to this if, then it means we can continue to look along
                // the other outward normal direction (ACperp)
                // if we don't see the origin... then we must have it enclosed
            } else if ( sign ^ (ac.cross( last ) > 0) ){
                // then the origin is along the outward facing normal 
                // of AC; (ACperp)

                // point B is dead to us now...
                simplex.splice(1, 1);

                ac.perp( !sign );
                // swap names
                sign = dir;
                dir = ac;
                ac = sign;
                
                // continue...

            } else {

                // we have enclosed the origin!
                overlap = true;
                // fewf... take a break
                break;
            }
        }

        if (iterations > gjkMaxIterations){
            return {
                simplex: simplex,
                iterations: iterations,
                distance: 0,
                maxIterationsReached: true
            };
        }
    }

    // free workspace
    scratch.done();

    tmp = {
        overlap: overlap,
        simplex: simplex,
        iterations: iterations
    };

    if ( distance !== false ){

        tmp.distance = distance;
    }

    return tmp;
};

Physics.gjk = gjk;

})();