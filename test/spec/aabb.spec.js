describe("Physics.aabb", function() {

    function matches( aabb, other ){
        expect( aabb.x ).toEqual( other.x );
        expect( aabb.y ).toEqual( other.y );
        expect( aabb.hw ).toEqual( other.hw );
        expect( aabb.hh ).toEqual( other.hh );
    }

    it("should initialize to zero", function() {
        var aabb = Physics.aabb();

        matches( aabb, { x: 0, y: 0, hw: 0, hh: 0 });
    });

    it("should initialize provided a width/height", function() {
        var aabb = Physics.aabb( 4, 5 );
        matches( aabb, { x: 0, y: 0, hw: 2, hh: 2.5 });
    });

    it("should initialize provided a width/height and point", function() {
        var aabb = Physics.aabb( 4, 5, { x: 20, y: 9 } );
        matches( aabb, { x: 20, y: 9, hw: 2, hh: 2.5 });
    });

    it("should initialize provided two points", function() {
        var aabb = Physics.aabb({ x: 13, y: 21 }, { x: 20, y: 9 } );
        matches( aabb, { x: 16.5, y: 15, hw: 3.5, hh: 6 });
    });

    it("should initialize provided minima and maxima", function() {
        var aabb = Physics.aabb( 13, 9, 20, 21 );
        matches( aabb, { x: 16.5, y: 15, hw: 3.5, hh: 6 });
    });
});
