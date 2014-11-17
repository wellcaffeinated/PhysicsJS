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
    var callbacks;

    beforeEach(function(){
        callbacks = jasmine.createSpyObj('callbacks', [
            'addedBodies',
            'removedBodies',
            'addedBehaviors',
            'removedBehaviors'
        ]);

        world.on({
            'add:body': callbacks.addedBodies,
            'remove:body': callbacks.removedBodies,
            'add:behavior': callbacks.addedBehaviors,
            'remove:behavior': callbacks.removedBehaviors
        }, callbacks);
    });

    afterEach(function(){
        // unsubscribe all
        world.off( 'add:body', true );
        world.off( 'remove:body', true );
        world.off( 'add:behavior', true );
        world.off( 'remove:behavior', true );
    });

    world.step( 0 );

    it("should add individual items", function() {

        world.add( circle );
        world.add( square );
        world.add( sweepPrune );
        world.add( bodyCollision );

        expect( world.getBodies().length ).toBeGreaterThan( 0 );
        expect( world.getBehaviors().length ).toBeGreaterThan( 0 );
        expect( world.has( circle ) ).toBe( true );
        expect( world.has( square ) ).toBe( true );
        expect( world.has( sweepPrune ) ).toBe( true );
        expect( world.has( bodyCollision ) ).toBe( true );
        expect( callbacks.addedBodies.calls.length ).toEqual( 2 );
        expect( callbacks.addedBehaviors.calls.length ).toEqual( 2 );
        expect( callbacks.removedBodies.calls.length ).toEqual( 0 );
        expect( callbacks.removedBehaviors.calls.length ).toEqual( 0 );
    });

    it("should remove individual items", function() {

        world.remove( circle );
        world.remove( square );
        world.remove( sweepPrune );
        world.remove( bodyCollision );

        expect( world.getBodies().length ).toBe( 0 );
        expect( world.getBehaviors().length ).toBe( 0 );
        expect( world.has( circle ) ).toBe( false );
        expect( world.has( square ) ).toBe( false );
        expect( world.has( sweepPrune ) ).toBe( false );
        expect( world.has( bodyCollision ) ).toBe( false );
        expect( callbacks.addedBodies.calls.length ).toEqual( 0 );
        expect( callbacks.addedBehaviors.calls.length ).toEqual( 0 );
        expect( callbacks.removedBodies.calls.length ).toEqual( 2 );
        expect( callbacks.removedBehaviors.calls.length ).toEqual( 2 );
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
        expect( callbacks.addedBodies.calls.length ).toEqual( 2 );
        expect( callbacks.addedBehaviors.calls.length ).toEqual( 2 );
        expect( callbacks.removedBodies.calls.length ).toEqual( 0 );
        expect( callbacks.removedBehaviors.calls.length ).toEqual( 0 );
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
        expect( callbacks.addedBodies.calls.length ).toEqual( 0 );
        expect( callbacks.addedBehaviors.calls.length ).toEqual( 0 );
        expect( callbacks.removedBodies.calls.length ).toEqual( 2 );
        expect( callbacks.removedBehaviors.calls.length ).toEqual( 2 );
    });

    it("should behave nicely for empty arrays", function() {

        world.add([]);
        world.remove([]);
    });

    it("should not allow duplicates", function() {

        world.add([
            circle,
            circle,
            square,
            sweepPrune,
            sweepPrune,
            bodyCollision
        ]);

        expect( world.getBodies().length ).toBeGreaterThan( 0 );
        expect( world.getBehaviors().length ).toBeGreaterThan( 0 );
        expect( callbacks.addedBodies.calls.length ).toEqual( 2 );
        expect( callbacks.addedBehaviors.calls.length ).toEqual( 2 );
        expect( callbacks.removedBodies.calls.length ).toEqual( 0 );
        expect( callbacks.removedBehaviors.calls.length ).toEqual( 0 );
    });

});
