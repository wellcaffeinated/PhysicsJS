// Gilbert–Johnson–Keerthi object collison algorithm
// For general information about GJK see: 
// * http://www.codezealot.org/archives/88
// * http://mollyrocket.com/849
(function(){

    /**
     * Implementation agnostic GJK function.
     * @param  {Function} support The support function. 
     *                            Signature: function(<Physics.vector> axis).
     *                            axis: The axis to use
     * @param {Physics.vector} seed The starting direction for the simplex
     * @return {Object} The algorithm information containing properties: .overlap (bool), and .simplex (Array)
     */
    var gjk = function gjk( support, seed ){

        var overlap = false
            ,simplex = []
            ,simplexLen = 1
            // setup a scratchpad of temporary cheap objects
            ,scratch = Physics.scratchpad()
            // use seed as starting direction or use x axis
            ,dir = scratch.vector().clone(seed || Physics.vector.axis[ 0 ]);
            ,last
            ,lastlast
            ,ab
            ,ac
            ,sign
            ,tmp
            ;

        // get the first Minkowski Difference point
        last = support( dir );
        simplexLen = simplex.push( last );
        // negate d for the next point
        dir.negate();
        // start looping
        while ( true ) {
            // push a new point to the simplex because we haven't terminated yet
            lastlast = last;
            last = support( dir );
            simplexLen = simplex.push( last );

            // check if the last point we added actually passed the origin
            if ( last.dot( dir ) <= 0.0 ) {
                // if the point added last was not past the origin in the direction of d
                // then the Minkowski Sum cannot possibly contain the origin since
                // the last point added is on the edge of the Minkowski Difference
                break;
            } else {

                // otherwise we need to determine if the origin is in
                // the current simplex and act accordingly

                // if it's a line...
                if ( simplexLen === 2 ){
                    // dir = AB = B - A
                    dir.clone( lastlast ).vsub( last );
                    // if (left handed coordinate system) 
                    // A cross AB < 0 then get perpendicular counter clockwise 
                    dir.perp( (last.cross( dir ) < 0) );

                // if it's a triangle...
                } else if ( simplexLen === 3 ){

                    ab = ab || scratch.vector();
                    ac = ac || scratch.vector();

                    // get the edges AB and AC
                    ab.clone( lastlast ).vsub( last );
                    ac.clone( simplex[ 0 ] ).vsub( last );

                    // here normally people think about this as getting outward facing
                    // normals and checking dot products. Since we're in 2D
                    // we can be clever...
                    sign = ab.cross( ac ) > 0;
                    tmp = last.cross( ab );
                    // TODO: if tmp === 0, then the origin is ON an edge... optimization?

                    if ( sign ^ (tmp > 0) ){

                        // ok... so there's an XOR here... don't freak out
                        // remember last = A = -AO
                        // if AB cross AC and AO cross AB have the same sign
                        // then the origin is along the outward facing normal of AB
                        // so if AB cross AC and A cross AB have _different_ (XOR) signs
                        // then this is also the case... so we proceed...

                        // morph the ab vector into its outward facing normal
                        ab.perp( sign );
                        // swap names
                        sign = dir;
                        dir = ab;
                        ab = sign;
                        // point C is dead to us now...
                        simplex.shift();
                        // continue...

                    } else {
                        // this means we can continue to look along
                        // the other outward normal direction (ACperp)
                        // if we don't see the origin... then we must have it enclosed

                        tmp = ac.cross( last );
                        if ( sign ^ (tmp > 0) ){
                            // then the origin is along the outward facing normal 
                            // of AC; (ACperp)

                            ac.perp( !sign );
                            // swap names
                            sign = dir;
                            dir = ac;
                            ac = sign;
                            // point B is dead to us now...
                            simplex.splice(1, 1);
                            // continue...

                        } else {

                            // we have enclosed the origin!
                            overlap = true;
                            // take a break...
                            break;
                        }
                    }
                }
            }
        }

        // free workspace
        scratch.done();

        return {
            overlap: overlap,
            simplex: simplex
        }
    };
    
    Physics.gjk = gjk;
})();