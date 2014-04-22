describe("Collision Detection", function() {

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
    world.add( Physics.behavior('sweep-prune') );
    world.add( Physics.behavior('body-collision-detection') );
    world.step();
    world.step();

    it("Should find a collision", function() {

        world.add([
            circle,
            square
        ]);

        var collide = false;
        var callback = function( data ){
            collide = true;
        };

        world.on('collisions:detected', callback);
        world.step();
        world.off('collisions:detected', callback);

        expect( collide ).toBe(true);
    });

    it("Should not find a collision after body removed", function() {

        world.removeBody( square );

        var collide = false;
        var callback = function( data ){
            collide = true;
        };

        world.on('collisions:detected', callback);
        world.step();
        world.off('collisions:detected', callback);

        expect( collide ).toBe(false);
    });

});
