describe("Adding and Removing things from world", function() {

    var world = Physics({ timestep: 1 });
    var circle = Physics.body('circle', {
        x: 10,
        y: 8,
        radius: 20
    });
    var square = Physics.body('convex-polygon', {
        x: 5,
        y: 5,
        vertices: [
            {x: 0, y: 0},
            {x: 0, y: 10},
            {x: 10, y: 10},
            {x: 10, y: 0}
        ]
    });
    var sweepPrune = Physics.behavior('sweep-prune');
    var bodyCollision = Physics.behavior('body-collision-detection');

    world.step( 0 );

    it("should add individual items", function() {

        world.add( circle );
        world.add( square );
        world.add( sweepPrune );
        world.add( bodyCollision );

        expect( world.getBodies().length ).toBeGreaterThan( 0 );
        expect( world.getBehaviors().length ).toBeGreaterThan( 0 );
    });

    it("should remove individual items", function() {

        world.remove( circle );
        world.remove( square );
        world.remove( sweepPrune );
        world.remove( bodyCollision );

        expect( world.getBodies().length ).toBe( 0 );
        expect( world.getBehaviors().length ).toBe( 0 );
    });

    it("should add an array of items", function() {

        world.add([ 
            circle,
            square,
            sweepPrune,
            bodyCollision
        ]);

        expect( world.getBodies().length ).toBeGreaterThan( 0 );
        expect( world.getBehaviors().length ).toBeGreaterThan( 0 );
    });

    it("should remove an array of items", function() {

        world.remove([ 
            circle,
            square,
            sweepPrune,
            bodyCollision
        ]);

        expect( world.getBodies().length ).toBe( 0 );
        expect( world.getBehaviors().length ).toBe( 0 );
    });

});