describe("Polygon geometry", function() {

    var square = Physics.geometry('convex-polygon', {
            vertices: [
                { x: 5, y: 5 },
                { x: 5, y: 0 },
                { x: 0, y: 0 },
                { x: 0, y: 5 }
            ]
        })
        ,triangle = Physics.geometry('convex-polygon', {
            vertices: [
                { x: 5, y: 5 },
                { x: 5, y: 0 },
                { x: 0, y: 0 }
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

    it("polygons must have vertices defined", function(){

        var create = function(){
            Physics.geometry('convex-polygon');
        };

        expect( create ).toThrow();
    });

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

    it("check farthest hull points pentagon", function() {

        var dir = Physics.vector()
            ,pt
            ;

        dir.set(1, 0.1);
        pt = poly.getFarthestHullPoint( dir );
        expect( pt.get(0) ).toEqual( poly.vertices[ 0 ].get(0) );
        expect( pt.get(1) ).toEqual( poly.vertices[ 0 ].get(1) );

        dir.set(0.1, 1);
        pt = poly.getFarthestHullPoint( dir );
        expect( pt.get(0) ).toEqual( poly.vertices[ 4 ].get(0) );
        expect( pt.get(1) ).toEqual( poly.vertices[ 4 ].get(1) );

        dir.set(0.1, -1);
        pt = poly.getFarthestHullPoint( dir );
        expect( pt.get(0) ).toEqual( poly.vertices[ 1 ].get(0) );
        expect( pt.get(1) ).toEqual( poly.vertices[ 1 ].get(1) );

        dir.set(-0.1, -1);
        pt = poly.getFarthestHullPoint( dir );
        expect( pt.get(0) ).toEqual( poly.vertices[ 2 ].get(0) );
        expect( pt.get(1) ).toEqual( poly.vertices[ 2 ].get(1) );
    });

    it("check farthest hull points triangle", function() {

        var dir = Physics.vector()
            ,pt
            ;

        dir.set(1, -0.1);
        pt = triangle.getFarthestHullPoint( dir );
        expect( pt.get(0) ).toEqual( triangle.vertices[ 1 ].get(0) );
        expect( pt.get(1) ).toEqual( triangle.vertices[ 1 ].get(1) );

        dir.set(1, 1);
        pt = triangle.getFarthestHullPoint( dir );
        expect( pt.get(0) ).toEqual( triangle.vertices[ 0 ].get(0) );
        expect( pt.get(1) ).toEqual( triangle.vertices[ 0 ].get(1) );

        dir.set(-1, -0.1);
        pt = triangle.getFarthestHullPoint( dir );
        expect( pt.get(0) ).toEqual( triangle.vertices[ 2 ].get(0) );
        expect( pt.get(1) ).toEqual( triangle.vertices[ 2 ].get(1) );
    });


    it("check aabb", function() {
        
        var aabb = poly.aabb();

        expect( aabb.hw ).toEqual( 1 );
        expect( aabb.hh ).toEqual( 1.5 / 2 );
    });

    it("should return correct vertices for getFarthestHullPoint", function(){
        var shape = Physics.geometry('convex-polygon',{
            vertices: [
                { x:0, y:242 },
                { x:300, y:242.01 },
                { x:150, y:45 }
            ]
        });

        var vertex = shape.getFarthestHullPoint( Physics.vector(1, 0) );
        expect( vertex.equals(shape.vertices[1]) ).toBe( true );

        vertex = shape.getFarthestHullPoint( Physics.vector(-1, 0) );
        expect( vertex.equals(shape.vertices[0]) ).toBe( true );

        vertex = shape.getFarthestHullPoint( Physics.vector(0, 1) );
        expect( vertex.equals(shape.vertices[1]) ).toBe( true );

        vertex = shape.getFarthestHullPoint( Physics.vector(0, -1) );
        expect( vertex.equals(shape.vertices[2]) ).toBe( true );
    });
});