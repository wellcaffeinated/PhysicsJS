Physics.behavior('pin-constraints', function (parent) {

    var halfPi = Math.PI / 2;

    return {

        init: function (options) {

            parent.init.call(this, options);

            this._constraints = [];
        },

        connect: function (world) {

            var integrator = world.integrator();
            if (integrator && integrator.name.indexOf('verlet') < 0) {
                throw 'The pin constraints behavior needs a world with an "verlet" compatible integrator.';
            }

            world.subscribe('integrate:positions', this.resolve, this);
        },

        disconnect: function (world) {

            world.unsubscribe('integrate:positions', this.resolve);
        },

        drop: function () {

            // drop the current constraints
            this._constraints = [];
            return this;
        },

        constrain: function (bodyA, bodyB, offsetA, offsetB) {

            var constraint = {
                id: Physics.util.uniqueId('pin-constraint'),
                bodyA: bodyA,
                bodyB: bodyB,
                offsetA: Physics.vector(offsetA.x, offsetA.y),
                offsetB: Physics.vector(offsetB.x, offsetB.y),
            };

            this._constraints.push(constraint);

            return constraint;
        },

        remove: function (indexCstrOrId) {

            var constraints = this._constraints
                , isObj
            ;

            if (typeof indexCstrOrId === 'number') {

                constraints.splice(indexCstrOrId, 1);
                return this;
            }

            isObj = Physics.util.isObject(indexCstrOrId);

            for (var i = 0, l = constraints.length; i < l; ++i) {

                if ((isObj && constraints[i] === indexCstrOrId) ||
                    (!isObj && constraints[i].id === indexCstrOrId)) {

                    constraints.splice(i, 1);
                    return this;
                }
            }

            return this;
        },

        resolve: function () {
            
            var constraints = this._constraints
                , constraint
                , bodyA
                , bodyB
                , offsetA
                , offsetB
                , offsetAngleA
                , offsetAngleB
                , bodyBProportion
                , scratch = Physics.scratchpad()
                , pinA = scratch.vector()
                , pinB = scratch.vector()
                , targetPoint = scratch.vector()
                , bodyACorrectedAngle
                , bodyBCorrectedAngle
                , i
                , l = constraints.length;

            for (i = 0; i < l; i++) {
                constraint = constraints[i];

                bodyA = constraint.bodyA;
                bodyB = constraint.bodyB;

                offsetA = constraint.offsetA;
                offsetB = constraint.offsetB;

                offsetAngleA = offsetA.angle() + halfPi;
                offsetAngleB = offsetB.angle() + halfPi;


                // Find world position of pin A
                pinA.clone(bodyA.state.pos);
                pinA.vadd(offsetA);
                pinA.rotate(bodyA.state.angular.pos, bodyA.state.pos);

                // Find world position of pin B
                pinB.clone(bodyB.state.pos);
                pinB.vadd(offsetB);
                pinB.rotate(bodyB.state.angular.pos, bodyB.state.pos);


                // Find the target point between the 2 bodies' pin positions based on the relative mass of body A and B
                bodyBProportion = bodyB.mass / (bodyA.mass + bodyB.mass);
                targetPoint.clone(pinB).vsub(pinA);
                targetPoint.mult(bodyBProportion);
                targetPoint.vadd(pinA);


                // Rotate body A so that its COM and its pin lie along the same angle towards the target point
                bodyACorrectedAngle = -(Math.atan2(-(targetPoint._[1] - bodyA.state.pos._[1]), targetPoint._[0] - bodyA.state.pos._[0]) - halfPi);
                bodyACorrectedAngle -= offsetAngleA;
                bodyA.state.angular.pos = bodyACorrectedAngle;

                // Recalculate pin A position
                pinA.clone(bodyA.state.pos);
                pinA.vadd(offsetA);
                pinA.rotate(bodyACorrectedAngle, bodyA.state.pos);

                // Move body A so that its pin meets the new pin position
                bodyA.state.pos.vadd(targetPoint).vsub(pinA);


                // Rotate body B so that its COM and its pin lie along the same angle towards the target point
                bodyBCorrectedAngle = -(Math.atan2(-(targetPoint._[1] - bodyB.state.pos._[1]), targetPoint._[0] - bodyB.state.pos._[0]) - halfPi);
                bodyBCorrectedAngle -= offsetAngleB;
                bodyB.state.angular.pos = bodyBCorrectedAngle;

                // Recalculate pin B position
                pinB.clone(bodyB.state.pos);
                pinB.vadd(offsetB);
                pinB.rotate(bodyBCorrectedAngle, bodyB.state.pos);

                // Move body B so that its pin meets the new pin position
                bodyB.state.pos.vadd(targetPoint).vsub(pinB);
            }

            scratch.done();
        },

        getConstraints: function () {

            return [].concat(this._constraints);
        }
    };
});
