(function(){

    var defaults = {

        // drag applied during integration
        // 0 means vacuum
        // 0.9 means molasses
        drag: 0
    };

    /** related to: Physics.util.decorator
     * Physics.integrator( name[, options] ) -> Integrator
     * - name (String): The name of the integrator to create
     * - options (Object): The configuration for that integrator ( depends on integrator ).
       Available options and defaults:

       ```javascript
        {
            // drag applied during integration
            // 0 means vacuum
            // 0.9 means molasses
            drag: 0
        }
       ```
     *
     * Factory function for creating Integrators.
     *
     * Visit [the PhysicsJS wiki on Integrators](https://github.com/wellcaffeinated/PhysicsJS/wiki/Integrators)
     * for usage documentation.
     **/
    Physics.integrator = Decorator('integrator', {

        /** belongs to: Physics.integrator
         * class Integrator
         *
         * The base class for integrators created by [[Physics.integrator]] factory function.
         **/

        /** internal
         * Integrator#init( options )
         * - options (Object): The configuration options passed by the factory
         *
         * Initialization. Internal use.
         **/
        init: function( options ){

            /** related to: Physics.util.options
             * Integrator#options( options ) -> Object
             * - options (Object): The options to set as an object
             * + (Object): The options
             *
             * Set options on this instance.
             *
             * Access options directly from the options object.
             *
             * Example:
             *
             * ```javascript
             * this.options.someOption;
             * ```
             *
             **/
            this.options = Physics.util.options( defaults );
            this.options( options );
        },

        /**
         * Integrator#setWorld( world ) -> this
         * - world (Object): The world (or null)
         *
         * Set which world to apply to.
         *
         * Usually this is called internally. Shouldn't be a need to call this yourself usually.
         **/
        setWorld: function( world ){

            if ( this.disconnect && this._world ){
                this.disconnect( this._world );
            }

            this._world = world;

            if ( this.connect && world ){
                this.connect( world );
            }

            return this;
        },

        /**
         * Integrator#integrate( bodies, dt ) -> this
         * - bodies (Array): List of bodies to integrate
         * - dt (Number): Timestep size
         *
         * Integrate bodies by timestep.
         *
         * Will emit `integrate:velocities` and `integrate:positions`
         * events on the world.
         **/
        integrate: function( bodies, dt ){

            var world = this._world;

            this.integrateVelocities( bodies, dt );

            if ( world ){
                world.emit('integrate:velocities', {
                    bodies: bodies,
                    dt: dt
                });
            }

            this.integratePositions( bodies, dt );

            if ( world ){
                world.emit('integrate:positions', {
                    bodies: bodies,
                    dt: dt
                });
            }

            return this;
        },

        /**
         * Integrator#connect( world )
         * - world (Physics.world): The world to connect to
         *
         * Connect to a world.
         *
         * Extend this when creating integrators if you need to specify pubsub management.
         * Automatically called when added to world by the [[Integrator#setWorld]] method.
         **/
        connect: null,

        /**
         * Integrator#disconnect( world )
         * - world (Physics.world): The world to disconnect from
         *
         * Disconnect from a world.
         *
         * Extend this when creating integrators if you need to specify pubsub management.
         * Automatically called when added to world by the [[Integrator#setWorld]] method.
         **/
        disconnect: null,

        /**
         * Integrator#integrateVelocities( bodies, dt )
         * - bodies (Array): List of bodies to integrate
         * - dt (Number): Timestep size
         *
         * Just integrate the velocities.
         *
         * Should be overridden when creating integrators.
         **/
        integrateVelocities: function( bodies, dt ){

            throw 'The integrator.integrateVelocities() method must be overriden';
        },

        /**
         * Integrator#integratePositions( bodies, dt )
         * - bodies (Array): List of bodies to integrate
         * - dt (Number): Timestep size
         *
         * Just integrate the positions.
         *
         * Called after [[Integrator#integrateVelocities]].
         *
         * Should be overridden when creating integrators.
         **/
        integratePositions: function( bodies, dt ){

            throw 'The integrator.integratePositions() method must be overriden';
        }
    });

}());
