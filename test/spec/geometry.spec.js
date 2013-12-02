describe("Physics.geometry static methods", function() {

    it("test if a polygon is convex", function() {
        var convex = [
            { x: 1, y: 0 },
            { x: 0.5, y: -0.5 },
            { x: -0.5, y: -0.5 },
            { x: -1, y: 0 },
            { x: 0, y: 1 }
        ];

        var notConvex = [
            { x: 1, y: 0 },
            { x: 0.5, y: -0.5 },
            { x: -0.5, y: -0.5 },
            { x: -1, y: 0 },
            { x: 2.3, y: 1 }
        ];

        expect( Physics.geometry.isPolygonConvex( convex ) ).toBe(true);
        expect( Physics.geometry.isPolygonConvex( notConvex ) ).toBe(false);
        // clockwise
        convex.reverse();
        expect( Physics.geometry.isPolygonConvex( convex ) ).toBe(true);
    });

    it("check moments of inertia of polygons", function() {
        var point = [{ x: 0, y: 0 }]
        ,line = [
            { x: -1, y: 0 },
            { x: 1, y: 0 }
        ]
        ,square = [
            { x: 1, y: 1 },
            { x: 1, y: -1 },
            { x: -1, y: -1 },
            { x: -1, y: 1 }
        ]
        ;

        expect( Physics.geometry.getPolygonMOI( point ) ).toEqual( 0 );
        expect( Physics.geometry.getPolygonMOI( line ) ).toEqual( 4 / 12 );
        expect( Physics.geometry.getPolygonMOI( square ) ).toEqual( 2 * 2 / 6 );
    });

    it("check if points are inside a polygon", function() {
        var inside = { x: 1, y: 0 }
        ,outside = { x: 5, y: 5.1 }
        ,line = [
            { x: -5, y: 0 },
            { x: 5, y: 0 }
        ]
        ,square = [
            {x: -5, y: -5},
            {x: -5, y:  5},
            {x: 5, y: 5},
            {x: 5, y: -5}
        ]
        ;

        expect( Physics.geometry.isPointInPolygon( inside, line ) ).toBe( true );
        expect( Physics.geometry.isPointInPolygon( inside, square ) ).toBe( true );
        expect( Physics.geometry.isPointInPolygon( outside, line ) ).toBe( false );
        expect( Physics.geometry.isPointInPolygon( outside, square ) ).toBe( false );
    });

    it("calculate polygon area", function() {
        var point = [{ x: 9, y: 9 }]
        ,line = [
            { x: 1, y: 0 },
            { x: 5, y: 0 }
        ]
        ,square = [
            { x: 5, y: 5 },
            { x: 5, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 5 }
        ]
        ;

        expect( Physics.geometry.getPolygonArea( point ) ).toEqual( 0 );
        expect( Physics.geometry.getPolygonArea( line ) ).toEqual( 0 );
        expect( Physics.geometry.getPolygonArea( square ) ).toEqual( 25 );
        square.reverse();
        expect( Physics.geometry.getPolygonArea( square ) ).toEqual( -25 );
    });

    it("calculate polygon centroid", function() {
        var point = [{ x: 9, y: 9 }]
        ,line = [
            { x: 1, y: 0 },
            { x: 5, y: 0 }
        ]
        ,square = [
            { x: 3, y: 3 },
            { x: 3, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 3 }
        ]
        ,centroid
        ;

        centroid = Physics.geometry.getPolygonCentroid( point );
        expect( centroid.equals(Physics.vector(9, 9)) ).toBe( true );

        centroid = Physics.geometry.getPolygonCentroid( line );
        expect( centroid.equals(Physics.vector(3, 0)) ).toBe( true );

        centroid = Physics.geometry.getPolygonCentroid( square );
        expect( centroid.equals(Physics.vector(1.5, 1.5)) ).toBe( true );
    });


    it("check nearest point on a line", function() {

        var point = {};
        var line1 = { x: 0, y: 2 };
        var line2 = { x: 6, y: 8 };
        var result;

        point.x = 1;
        point.y = -5;
        result = Physics.geometry.nearestPointOnLine( point, line1, line2 );
        expect( result.get(0) ).toEqual( line1.x );
        expect( result.get(1) ).toEqual( line1.y );

        point.x = 2;
        point.y = 2;
        result = Physics.geometry.nearestPointOnLine( point, line1, line2 );
        expect( result.get(0) ).toEqual( 1 );
        expect( result.get(1) ).toEqual( 3 );

        point.x = 10;
        point.y = 8;
        result = Physics.geometry.nearestPointOnLine( point, line1, line2 );
        expect( result.get(0) ).toEqual( line2.x );
        expect( result.get(1) ).toEqual( line2.y );
    });
});