describe("Polygon geometry", function() {

    var square = Physics.geometry('convex-polygon', {
            vertices: [
                { x: 5, y: 5 },
                { x: 5, y: 0 },
                { x: 0, y: 0 },
                { x: 0, y: 5 }
            ]
        })
        ,poly = Physics.geometry('convex-polygon', {
            vertices: [
                { x: 1, y: 0 },
                { x: 0.5, y: -0.5 },
                { x: -0.5, y: -0.5 },
                { x: -1, y: 0 },
                { x: 0, y: 1 }
            ]
        })
        ;

    console.log(poly.vertices+'');

    it("check centroid repositioning", function() {

        var verts = square.vertices;

        expect( verts[0].get(0) ).toEqual( 2.5 );
        expect( verts[0].get(1) ).toEqual( 2.5 );
        expect( verts[1].get(0) ).toEqual( 2.5 );
        expect( verts[1].get(1) ).toEqual( -2.5 );
        expect( verts[2].get(0) ).toEqual( -2.5 );
        expect( verts[2].get(1) ).toEqual( -2.5 );
        expect( verts[3].get(0) ).toEqual( -2.5 );
        expect( verts[3].get(1) ).toEqual( 2.5 );
    });

    it("check farthest hull points", function() {

        var dir = Physics.vector()
            ,pt
            ;

        dir.set(1, 0.1);
        pt = poly.getFarthestHullPoint( dir );
        expect( pt.get(0) ).toEqual( 1 );
        expect( pt.get(1) ).toEqual( -0.09523809523809523 );

        dir.set(0.1, 1);
        pt = poly.getFarthestHullPoint( dir );
        expect( pt.get(0) ).toEqual( 0 );
        expect( pt.get(1) ).toEqual( 0.9047619047619048 );

        dir.set(0.5, -0.9);
        pt = poly.getFarthestHullPoint( dir );
        expect( pt.get(0) ).toEqual( 0.5 );
        expect( pt.get(1) ).toEqual( -0.5952380952380952 );

        dir.set(-0.5, -0.6);
        pt = poly.getFarthestHullPoint( dir );
        expect( pt.get(0) ).toEqual( -0.5 );
        expect( pt.get(1) ).toEqual( -0.5952380952380952 );
    });

    it("check aabb", function() {
        
        var aabb = poly.aabb();

        expect( aabb.halfWidth ).toEqual( 1 );
        expect( aabb.halfHeight ).toEqual( 1.5 / 2 );
    });
});