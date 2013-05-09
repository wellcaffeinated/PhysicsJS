(function(){

    var defaults = {

        // 0 means vacuum
        // 0.9 means molasses
        drag: 0
    };

    // Service
    Physics.integrator = Decorator('integrator', {

        init: function( options ){
            
            this.options = Physics.util.extend({}, defaults, options);
        },

        integrate: function( bodies, dt ){

            var world = this._world;

            this.integrateVelocities( bodies, dt );
            
            if ( world ){
                world.publish({
                    topic: 'integrate:velocities',
                    bodies: bodies,
                    dt: dt
                });
            }

            this.integratePositions( bodies, dt );
            
            if ( world ){
                world.publish({
                    topic: 'integrate:positions',
                    bodies: bodies,
                    dt: dt
                });
            }
        },

        integrateVelocities: function( bodies, dt ){

            throw 'The integrator.integrateVelocities() method must be overriden';
        },

        integratePositions: function( bodies, dt ){

            throw 'The integrator.integratePositions() method must be overriden';
        }
    });

}());