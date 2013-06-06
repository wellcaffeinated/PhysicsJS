describe("Physics.noConflict", function() {

    it("Should return the original value referenced by window.Physics", function() {

        var Ph = Physics;
        var p = Physics.noConflict();

        expect( Ph ).toEqual( p );
        expect( window.Physics ).toBeUndefined();

        window.Physics = p;
    });

});