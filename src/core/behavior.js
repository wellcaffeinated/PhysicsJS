(function(){

    var defaults = {
        priority: 0
    };

    /** related to: Physics.util.decorator
     * Physics.behavior( name[, options] ) -> Behavior
     * - name (String): The name of the behavior to create
     * - options (Object): The configuration for that behavior ( depends on behavior ).
       Available options and defaults:
       
       ```javascript
        {
           priority: 0 // the priority of this body
        }
       ```
     *
     * Factory function for creating Behaviors.
     *
     * Visit [the PhysicsJS wiki on Behaviors](https://github.com/wellcaffeinated/PhysicsJS/wiki/Behaviors)
     * for usage documentation.
     **/
    Physics.behavior = Decorator('behavior', {

        /** belongs to: Physics.behavior
         * class Behavior
         *
         * The base class for behaviors created by [[Physics.behavior]] factory function.
         **/

        /** internal
         * Behavior#init( options )
         * - options (Object): The configuration options passed by the factory
         * 
         * Initialization. Internal use.
         **/
        init: function( options ){
            
            /** related to: Physics.util.options
             * Behavior#options( options ) -> Object
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
         * Behavior#applyTo( arr ) -> this
         * - arr (Array): Array of bodies to apply this behavior to. Specify `true` for all objects in world.
         * 
         * Apply the behavior to a group of bodies.
         **/
        applyTo: function( arr ){

            if ( arr === true ){
                this._targets = null;
            } else {
                this._targets = Physics.util.uniq( arr );
            }
            return this;
        },

        /**
         * Behavior#getTargets() -> Array
         * + (Array): The array of bodies (by reference!) this behavior is applied to.
         * 
         * Get the array of bodies (by reference!) this behavior is applied to.
         **/
        getTargets: function(){
            
            return this._targets || ( this._world ? this._world._bodies : [] );
        },

        /**
         * Behavior#setWorld( world ) -> this
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
         * Behavior#connect( world )
         * - world (Physics.world): The world to connect to
         * 
         * Connect to a world.
         *
         * Extend this when creating behaviors if you need to specify pubsub management.
         * Automatically called when added to world by the [[Behavior#setWorld]] method.
         **/
        connect: function( world ){

            if (this.behave){
                world.on('integrate:positions', this.behave, this, this.options.priority);
            }
        },

        /**
         * Behavior#disconnect( world )
         * - world (Physics.world): The world to disconnect from
         * 
         * Disconnect from a world.
         *
         * Extend this when creating behaviors if you need to specify pubsub management.
         * Automatically called when added to world by the [[Behavior#setWorld]] method.
         **/
        disconnect: function( world ){

            if (this.behave){
                world.off('integrate:positions', this.behave, this);
            }
        },

        /**
         * Behavior#behave( data )
         * - data (Object): The pubsub `integrate:positions` event data
         * 
         * Default method run on every world integration.
         *
         * You _must_ extend this when creating a behavior,
         * unless you extend the [[Behavior#connect]] and [[Behavior#disconnect]] methods.
         **/
        behave: null
    });

}());