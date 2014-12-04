/*
 * Geometry helper functions
 */

/**
 * Physics.geometry.regularPolygonVertices( sides, radius ) -> Array
 * - sides (Number): Number of sides the polygon has
 * - radius (Number): Size from center to a vertex
 * + (Array): A list of [[Vectorish]] objects representing the vertices
 *
 * Generate a list of vertices for a regular polygon of any number of sides.
 **/
Physics.geometry.regularPolygonVertices = function( sides, radius ){
    var verts = []
        ,angle = Math.PI * 2 / sides
        ,a = 0
        ,i
        ;

    for ( i = 0; i < sides; i++ ){
        verts.push({
            x: radius * Math.cos( a )
            ,y: radius * Math.sin( a )
        });

        a += angle;
    }

    return verts;
};

/**
 * Physics.geometry.isPolygonConvex( hull ) -> Boolean
 * - hull (Array): Array of ([[Vectorish]]) vertices
 * + (Boolean): `true` if the polygon is convex. `false` otherwise.
 *
 * Determine if polygon hull is convex
 **/
Physics.geometry.isPolygonConvex = function( hull ){

    var scratch = Physics.scratchpad()
        ,prev = scratch.vector()
        ,next = scratch.vector()
        ,tmp = scratch.vector()
        ,ret = true
        ,sign = false
        ,l = hull.length
        ;

    if ( !hull || !l ){
        return false;
    }

    if ( l < 3 ){
        // it must be a point or a line...
        // which are convex
        scratch.done();
        return ret;
    }

    prev.clone( hull[ 0 ] ).vsub( tmp.clone( hull[ l - 1 ] ) );

    // loop over the edges of the hull and construct vectors of the current
    // edge and retain the last edge
    // add two to the length to do a full cycle
    for ( var i = 1; i <= l; ++i ){

        next.clone( hull[ i % l ] ).vsub( tmp.clone( hull[ (i - 1) % l ] ) );

        if ( sign === false ){

            // first check the sign of the first cross product
            sign = prev.cross( next );

        } else if ( (sign > 0) ^ (prev.cross( next ) > 0) ){

            // if the cross products are different signs it's not convex
            ret = false;
            break;
        }

        // remember the last edge
        next.swap( prev );
    }

    scratch.done();
    return ret;
};

/**
 * Physics.geometry.getPolygonMOI( hull ) -> Number
 * - hull (Array): Array of ([[Vectorish]]) vertices
 * + (Number): The polygon's moment of inertia
 *
 * Gets the moment of inertia of a convex polygon
 *
 * See [List of moments of inertia](http://en.wikipedia.org/wiki/List_of_moments_of_inertia)
 * for more information.
 *
 * _Note_: we make the following assumpations:
 * * mass is unitary (== 1)
 * * axis of rotation is the origin
 **/
Physics.geometry.getPolygonMOI = function( hull ){

    var scratch = Physics.scratchpad()
        ,prev = scratch.vector()
        ,next = scratch.vector()
        ,num = 0
        ,denom = 0
        ,tmp
        ,l = hull.length
        ;

    if ( l < 2 ){
        // it must be a point
        // moi = 0
        scratch.done();
        return 0;
    }

    if ( l === 2 ){
        // it's a line
        // get length squared
        tmp = next.clone( hull[ 1 ] ).distSq( prev.clone( hull[ 0 ] ) );
        scratch.done();
        return tmp / 12;
    }

    prev.clone( hull[ 0 ] );

    for ( var i = 1; i < l; ++i ){

        next.clone( hull[ i ] );

        tmp = Math.abs( next.cross( prev ) );
        num += tmp * ( next.normSq() + next.dot( prev ) + prev.normSq() );
        denom += tmp;

        prev.swap( next );
    }

    scratch.done();
    return num / ( 6 * denom );
};

/**
 * Physics.geometry.isPointInPolygon( pt, hull ) -> Boolean
 * - pt (Vectorish): The point to test
 * - hull (Array): Array of ([[Vectorish]]) vertices
 * + (Boolean): `true` if point `pt` is inside the polygon
 *
 * Check if point is inside polygon hull.
 **/
Physics.geometry.isPointInPolygon = function( pt, hull ){

    var scratch = Physics.scratchpad()
        ,point = scratch.vector().clone( pt )
        ,prev = scratch.vector()
        ,next = scratch.vector()
        ,ang = 0
        ,l = hull.length
        ;

    if ( l < 2 ){
        // it's a point...
        ang = point.equals( prev.clone( hull[ 0 ] ));
        scratch.done();
        return ang;
    }

    if ( l === 2 ){
        // it's a line
        ang = point.angle( prev.clone( hull[ 0 ] ));
        ang += point.angle( prev.clone( hull[ 1 ] ));
        scratch.done();
        return ( Math.abs(ang) === Math.PI );
    }

    prev.clone( hull[ 0 ] ).vsub( point );

    // calculate the sum of angles between vector pairs
    // from point to vertices
    for ( var i = 1; i <= l; ++i ){

        next.clone( hull[ i % l ] ).vsub( point );
        ang += next.angle( prev );
        prev.swap( next );
    }

    scratch.done();
    return ( Math.abs(ang) > 1e-6 );
};

/**
 * Physics.geometry.getPolygonArea( hull ) -> Number
 * - hull (Array): Array of ([[Vectorish]]) vertices
 * + (Number): The area (positive for clockwise ordering)
 *
 * Get the signed area of the polygon.
 **/
Physics.geometry.getPolygonArea = function getPolygonArea( hull ){

    var scratch = Physics.scratchpad()
        ,prev = scratch.vector()
        ,next = scratch.vector()
        ,ret = 0
        ,l = hull.length
        ;

    if ( l < 3 ){
        // it must be a point or a line
        // area = 0
        scratch.done();
        return 0;
    }

    prev.clone( hull[ l - 1 ] );

    for ( var i = 0; i < l; ++i ){

        next.clone( hull[ i ] );

        ret += prev.cross( next );

        prev.swap( next );
    }

    scratch.done();
    return ret / 2;
};

/**
 * Physics.geometry.getPolygonCentroid( hull ) -> Physics.vector
 * - hull (Array): Array of ([[Vectorish]]) vertices
 * + (Physics.vector): The centroid
 *
 * Get the coordinates of the centroid.
 **/
Physics.geometry.getPolygonCentroid = function getPolygonCentroid( hull ){

    var scratch = Physics.scratchpad()
        ,prev = scratch.vector()
        ,next = scratch.vector()
        ,ret = new Physics.vector()
        ,tmp
        ,l = hull.length
        ;

    if ( l < 2 ){
        // it must be a point
        scratch.done();
        return new Physics.vector( hull[0] );
    }

    if ( l === 2 ){
        // it's a line
        // get the midpoint
        scratch.done();
        return new Physics.vector((hull[ 1 ].x + hull[ 0 ].x)/2, (hull[ 1 ].y + hull[ 0 ].y)/2 );
    }

    prev.clone( hull[ l - 1 ] );

    for ( var i = 0; i < l; ++i ){

        next.clone( hull[ i ] );

        tmp = prev.cross( next );
        prev.vadd( next ).mult( tmp );
        ret.vadd( prev );

        prev.swap( next );
    }

    tmp = 1 / (6 * Physics.geometry.getPolygonArea( hull ));

    scratch.done();
    return ret.mult( tmp );
};

/**
 * Physics.geometry.nearestPointOnLine( pt, linePt1, linePt2 ) -> Physics.vector
 * - pt (Vectorish): The point
 * - linePt1 (Vectorish): The first endpoint of the line
 * - linePt2 (Vectorish): The second endpoint of the line
 * + (Vector): The closest point
 *
 * Get the closest point on a discrete line to specified point.
 **/
Physics.geometry.nearestPointOnLine = function nearestPointOnLine( pt, linePt1, linePt2 ){

    var scratch = Physics.scratchpad()
        ,p = scratch.vector().clone( pt )
        ,A = scratch.vector().clone( linePt1 ).vsub( p )
        ,L = scratch.vector().clone( linePt2 ).vsub( p ).vsub( A )
        ,lambdaB
        ,lambdaA
        ;

    if ( L.equals(Physics.vector.zero) ){
        // oh.. it's a zero vector. So A and B are both the closest.
        // just use one of them
        scratch.done();
        return new Physics.vector( linePt1 );
    }

    lambdaB = - L.dot( A ) / L.normSq();
    lambdaA = 1 - lambdaB;

    if ( lambdaA <= 0 ){
        // woops.. that means the closest simplex point
        // isn't on the line it's point B itself
        scratch.done();
        return new Physics.vector( linePt2 );
    } else if ( lambdaB <= 0 ){
        // vice versa
        scratch.done();
        return new Physics.vector( linePt1 );
    }

    // guess we'd better do the math now...
    p = new Physics.vector( linePt2 ).mult( lambdaB ).vadd( A.clone( linePt1 ).mult( lambdaA ) );
    scratch.done();
    return p;
};
