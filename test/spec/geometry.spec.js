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

        expect( Physics.geometry.isConvex( convex ) ).toBe(true);
        expect( Physics.geometry.isConvex( notConvex ) ).toBe(false);
        // clockwise
        convex.reverse();
        expect( Physics.geometry.isConvex( convex ) ).toBe(true);
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
        var inside = { x: 0, y: 0 }
        ,outside = { x: 9, y: 9 }
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

        expect( Physics.geometry.isPointInPolygon( inside, line ) ).toBe( true );
        expect( Physics.geometry.isPointInPolygon( inside, square ) ).toBe( true );
        expect( Physics.geometry.isPointInPolygon( outside, line ) ).toBe( false );
        expect( Physics.geometry.isPointInPolygon( outside, square ) ).toBe( false );
    });
});