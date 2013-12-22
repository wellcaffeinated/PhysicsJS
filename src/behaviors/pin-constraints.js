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

                throw 'The pin constraints behavior needs a world with a "verlet" compatible integrator.';
            }

            world.subscribe('integrate:positions', this.resolve, this);
        },

        disconnect: function (world) {

            world.unsubscribe('integrate:positions', this.resolve);
        },

        drop: function () {

            this._constraints = [];
            return this;
        },

        constrain: function (bodyA, bodyB, offsetA, offsetB) {

            var constraint = {
                id: Physics.util.uniqueId('pin-constraint'),
                bodyA: bodyA,
                bodyB: bodyB,
                offsetA: offsetA,
                offsetB: offsetB
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
                , l = constraints.length
                , constraint
                , bodyA
                , bodyB
                , bodyAAngle
                , bodyBAngle
                , bodyAPosX
                , bodyBPosY
                , offsetA
                , offsetB
                , offsetADistance
                , offsetBDistance
                , offsetAAngle
                , offsetBAngle
                , pinAPosX
                , pinAPosY
                , pinBPosX
                , pinBPosY
                , bodyBProportion
                , bodyACorrectedAngle
                , bodyBCorrectedAngle
                , i;

            for (i = 0; i < l; i++) {

                constraint = constraints[i];

                bodyA = constraint.bodyA;
                bodyB = constraint.bodyB;

                bodyAPosX = bodyA.state.pos._[0];
                bodyAPosY = bodyA.state.pos._[1];
                bodyBPosX = bodyB.state.pos._[0];
                bodyBPosY = bodyB.state.pos._[1];

                bodyAAngle = bodyA.state.angular.pos;
                bodyBAngle = bodyB.state.angular.pos;

                offsetA = constraint.offsetA;
                offsetB = constraint.offsetB;

                // Find the distance from each body's COM to its pin offset
                offsetADistance = Math.sqrt((offsetA.x * offsetA.x) + (offsetA.y * offsetA.y));
                offsetBDistance = Math.sqrt((offsetB.x * offsetB.x) + (offsetB.y * offsetB.y));

                // Find the angle between each body's COM and its pin offset
                offsetAAngle = -(Math.atan2(-offsetA.y, offsetA.x) - halfPi);
                offsetBAngle = -(Math.atan2(-offsetB.y, offsetB.x) - halfPi);

                // Find world positions of pins
                pinAPosX = bodyAPosX + (offsetADistance * Math.sin(bodyAAngle + offsetAAngle));
                pinAPosY = bodyAPosY - (offsetADistance * Math.cos(bodyAAngle + offsetAAngle));
                pinBPosX = bodyBPosX + (offsetBDistance * Math.sin(bodyBAngle + offsetBAngle));
                pinBPosY = bodyBPosY - (offsetBDistance * Math.cos(bodyBAngle + offsetBAngle));

                // Find the target point between the 2 bodies' pin positions based on the relative mass of body A and B
                bodyBProportion = bodyB.mass / (bodyA.mass + bodyB.mass);
                midPoint = {
                    x: pinAPosX + (bodyBProportion * (pinBPosX - pinAPosX))
                    , y: pinAPosY + (bodyBProportion * (pinBPosY - pinAPosY))
                };


                // Rotate body A so that its COM and its pin lie along the same angle towards the target point
                bodyACorrectedAngle = -(Math.atan2(-(midPoint.y - bodyAPosY), midPoint.x - bodyAPosX) - halfPi);
                bodyACorrectedAngle -= offsetAAngle;
                bodyA.state.angular.pos = bodyACorrectedAngle;

                // Recalculate pin A position
                pinAPosX = bodyAPosX + (offsetADistance * Math.sin(bodyACorrectedAngle + offsetAAngle));
                pinAPosY = bodyAPosY - (offsetADistance * Math.cos(bodyACorrectedAngle + offsetAAngle));

                // Move body A along its new angle to meet its required pin position
                bodyA.state.pos._[0] += (midPoint.x - pinAPosX);
                bodyA.state.pos._[1] += (midPoint.y - pinAPosY);


                // Rotate body B so that its COM and its pin lie along the same angle towards the target point
                bodyBCorrectedAngle = -(Math.atan2(-(midPoint.y - bodyBPosY), midPoint.x - bodyBPosX) - halfPi);
                bodyBCorrectedAngle -= offsetBAngle;
                bodyB.state.angular.pos = bodyBCorrectedAngle;

                // Recalculate pin B position
                pinBPosX = bodyBPosX + (offsetBDistance * Math.sin(bodyBCorrectedAngle + offsetBAngle));
                pinBPosY = bodyBPosY - (offsetBDistance * Math.cos(bodyBCorrectedAngle + offsetBAngle));

                // Move body B so that its pin meets the new pin position
                bodyB.state.pos._[0] += (midPoint.x - pinBPosX);
                bodyB.state.pos._[1] += (midPoint.y - pinBPosY);
            }
        },

        getConstraints: function () {

            return [].concat(this._constraints);
        }
    };
});
