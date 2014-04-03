describe("Transformations", function() {

    var aabb = Physics.aabb(0, 0, 50, 30)
        ,v = Physics.vector(5, 3)
        ,T = Physics.transform({ x: 70, y: 70 }, Math.PI/2)
        ;

    it("should transform vectors correctly", function(){

        v.transform( T );

        expect( v.get(0) ).toBeCloseTo( 67, 6 );
        expect( v.get(1) ).toBeCloseTo( 75, 6 );

        v.transformInv( T );

        expect( v.get(0) ).toBeCloseTo( 5, 6 );
        expect( v.get(1) ).toBeCloseTo( 3, 6 );
    });

    it("should rotate vectors correctly about different origin", function(){

        T.setRotation( -Math.PI/2, Physics.vector(2, 2) );
        v.rotate( T );

        expect( v.get(0) ).toBeCloseTo( 3, 6 );
        expect( v.get(1) ).toBeCloseTo( -1, 6 );

        v.rotateInv( T );

        expect( v.get(0) ).toBeCloseTo( 5, 6 );
        expect( v.get(1) ).toBeCloseTo( 3, 6 );
    });

    // removed functionality
    // it("should transform aabb correctly", function() {

    //     T.setRotation( Math.PI/2 );

    //     aabb.transform( T );

    //     var vals = aabb.get();
        
    //     expect( vals.halfWidth ).toBeCloseTo( 15, 6 );
    //     expect( vals.halfHeight ).toBeCloseTo( 25, 6 );
    //     expect( vals.pos.x ).toBeCloseTo( 95, 6 );
    //     expect( vals.pos.y ).toBeCloseTo( 85, 6 );
    // });

    it("should clone correctly", function(){

        T.setRotation( 3, { x: 3, y: 5 } );
        T.setTranslation({ x: -3, y: -7 });

        var T2 = Physics.transform( T );

        expect( T2.v.get(0) ).toEqual( -3 );
        expect( T2.v.get(1) ).toEqual( -7 );

        expect( T2.o.get(0) ).toEqual( 3 );
        expect( T2.o.get(1) ).toEqual( 5 );

        expect( T2.sinA ).toBeCloseTo( Math.sin(3), 6 );
        expect( T2.cosA ).toEqual( Math.cos(3), 6 );
    });
});