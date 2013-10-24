describe("Circle body spec", function() {

    var circle;

    it("Check basic circle creation", function() {

        var state, old, boundingBox;

        circle = Physics.body('circle', { radius: 1 });
        expect(circle).toBeDefined();

        // Circle default
        expect(circle.geometry.radius).toBe(1);

        // Body defaults
        expect(circle.fixed).toBe(false);
        expect(circle.hidden).toBeUndefined();
        expect(circle.mass).toBe(1.0);
        expect(circle.restitution).toBe(1.0);
        expect(circle.cof).toBe(0.8);
        expect(circle.view).toBeNull();

        // State
        state = circle.state;
        expect(state).toBeDefined();
        expect(state.pos).toEqual(Physics.vector.zero);
        expect(state.vel).toEqual(Physics.vector.zero);
        expect(state.acc).toEqual(Physics.vector.zero);
        expect(state.angular).toBeDefined();
        expect(state.angular.pos).toEqual(0.0);
        expect(state.angular.vel).toEqual(0.0);
        expect(state.angular.acc).toEqual(0.0);

        // I think the below should work, but it does not because state is captured as a set
        // expect(state).toEqual(circle.state.old);

        // State
        old = circle.state.old;
        expect(old).toBeDefined();
        expect(old.pos).toEqual(Physics.vector.zero);
        expect(old.vel).toEqual(Physics.vector.zero);
        expect(old.acc).toEqual(Physics.vector.zero);
        expect(old.angular).toBeDefined();
        expect(old.angular.pos).toEqual(0.0);
        expect(old.angular.vel).toEqual(0.0);
        expect(old.angular.acc).toEqual(0.0);

        boundingBox = circle.aabb();
        expect(boundingBox).toBeDefined();
        expect(boundingBox.pos.x).toEqual(0);
        expect(boundingBox.pos.y).toEqual(0);
        // Eh?
        expect(boundingBox.halfHeight).toEqual(1);
        expect(boundingBox.halfWidth).toEqual(1);

        expect(boundingBox.x).toEqual(1);
        expect(boundingBox.y).toEqual(1);
    });
});