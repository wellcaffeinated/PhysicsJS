(function (Physics) {
    'use strict';

    describe("Rectangle body spec", function() {

        var rectangle;

        it("Check basic rectangle creation", function() {

            rectangle = Physics.body('rectangle', {
                x: 20,
                y: 40,
                width: 200,
                height: 300
            });

            expect(rectangle).toBeDefined();
            expect(rectangle.state.pos.get(0)).toBe(20);
            expect(rectangle.state.pos.get(1)).toBe(40);
            expect(rectangle.geometry._area).toEqual(200 * 300);
            expect(Physics.geometry.getPolygonCentroid(rectangle.geometry.vertices).get(0)).toBe(0);
            expect(Physics.geometry.getPolygonCentroid(rectangle.geometry.vertices).get(1)).toBe(0);

            expect(rectangle.geometry.vertices[0].x).toEqual(-100);

            expect(rectangle.aabb().x).toBeCloseTo(100,1);
            expect(rectangle.aabb().y).toBeCloseTo(150,1);


        });
    });
}(window.Physics));