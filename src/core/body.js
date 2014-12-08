(function(){

    var defaults = {

        // is the body hidden (not to be rendered)?
        hidden: false,
        // is the body `dynamic`, `kinematic` or `static`?
        // http://www.box2d.org/manual.html#_Toc258082973
        treatment: 'dynamic',
        // body mass
        mass: 1.0,
        // body restitution. How "bouncy" is it?
        restitution: 1.0,
        // what is its coefficient of friction with another surface with COF = 1?
        cof: 0.8,
        // what is the view object (mixed) that should be used when rendering?
        view: null
    };

    var uidGen = 1;

    var Pi2 = Math.PI * 2;
    function cycleAngle( ang ){
        return ((ang % Pi2) + Pi2) % Pi2;
    }

    /** related to: Physics.util.decorator
     * Physics.body( name[, options] ) -> Body
     * - name (String): The name of the body to create
     * - options (Object): The configuration for that body ( depends on body ).
       Available options and defaults:

       ```javascript
        {
            // is the body hidden (not to be rendered)?
            hidden: false,
            // is the body `dynamic`, `kinematic` or `static`?
            // http://www.box2d.org/manual.html#_Toc258082973
            treatment: 'dynamic',
            // body mass
            mass: 1.0,
            // body restitution. How "bouncy" is it?
            restitution: 1.0,
            // what is its coefficient of friction with another surface with COF = 1?
            cof: 0.8,
            // what is the view object (mixed) that should be used when rendering?
            view: null,
            // the vector offsetting the geometry from its center of mass
            offset: Physics.vector(0,0)
        }
       ```
     *
     * Factory function for creating Bodies.
     *
     * Visit [the PhysicsJS wiki on Bodies](https://github.com/wellcaffeinated/PhysicsJS/wiki/Bodies)
     * for usage documentation.
     **/
    Physics.body = Decorator('body', {

        /** belongs to: Physics.body
         * class Body
         *
         * The base class for bodies created by [[Physics.body]] factory function.
         **/

        /** internal
         * Body#init( options )
         * - options (Object): The configuration options passed by the factory
         *
         * Initialization. Internal use.
         **/
        init: function( options ){

            var self = this;
            var vector = Physics.vector;

            /** related to: Physics.util.options
             * Body#options( options ) -> Object
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
            // all options get copied onto the body.
            this.options = Physics.util.options( defaults, this );
            this.options.onChange(function( opts ){
                self.offset = new vector( opts.offset );
            });
            this.options( options );

            /**
             * Body#state
             *
             * The physical state container.
             *
             * - ``this.state.pos`` ([[Physics.vector]]) The position vector.
             * - ``this.state.vel`` ([[Physics.vector]]) The velocity vector.
             * - ``this.state.acc`` ([[Physics.vector]]) The acceleration vector.
             * - ``this.state.angular.pos`` ([[Number]]) The angular position (in radians, positive is clockwise starting along the x axis)
             * - ``this.state.angular.vel`` ([[Number]]) The angular velocity
             * - ``this.state.angular.acc`` ([[Number]]) The angular acceleration
             *
             * Properties from the previous timestep are stored in:
             * ```javascript
             * this.state.old; // .pos, .vel, ...
             * ```
             **/
            this.state = {
                pos: new vector( this.x, this.y ),
                vel: new vector( this.vx, this.vy ),
                acc: new vector(),
                angular: {
                    pos: this.angle || 0.0,
                    vel: this.angularVelocity || 0.0,
                    acc: 0.0
                },
                old: {
                    pos: new vector(),
                    vel: new vector(),
                    acc: new vector(),
                    angular: {
                        pos: 0.0,
                        vel: 0.0,
                        acc: 0.0
                    }
                }
            };

            // private storage for sleeping
            this._sleepAngPosMean = 0;
            this._sleepAngPosVariance = 0;
            this._sleepPosMean = new vector();
            this._sleepPosVariance = new vector();
            this._sleepMeanK = 0;

            // cleanup
            delete this.x;
            delete this.y;
            delete this.vx;
            delete this.vy;
            delete this.angle;
            delete this.angularVelocity;

            if (this.mass === 0){
                throw "Error: Bodies must have non-zero mass";
            }

            /**
             * Body#uid = Number
             *
             * The unique id for the body
             **/
            this.uid = uidGen++;

            /** related to: Physics.geometry
             * Body#geometry
             *
             * The geometry for this body.
             *
             * By default it is a `point` geometry which gets overridden.
             **/
            this.geometry = Physics.geometry('point');

            /**
             * Body#mass = 1.0
             *
             * The mass.
             **/

            /**
             * Body#offset
             *
             * The vector offsetting the body's shape from its center of mass.
             **/

             /**
              * Body#restitution = 1.0
              *
              * The restitution.
              *
              * This is the "bounciness" of the body.
              * It's a number between `0` and `1`.
              *
              * A restitution of 1 is the bounciest.
              *
              * A restitution of 0 is not bouncy.
              *
              * When colliding the restitutions of bodies are
              * multiplied together to get the restitution between two
              * bodies.
              *
              **/

              /**
               * Body#cof = 0.8
               *
               * The coefficient of friction of the body.
               *
               * It's how much "slide" it has during collisions.
               *
               * A `cof` of `0` will really slidy.
               *
               * A `cof` of `1` has no slide.
               *
               * This is a very simplistic implementation at the moment.
               * What would be better is to have both static and kinetic
               * friction. But that's not done yet.
               **/

               /**
                * Body#treatment = String
                *
                * How the body is treated by the simulation.
                *
                * The body can be `dynamic`, `kinematic` or `static` as
                * described by the [analogous box2d docs](http://www.box2d.org/manual.html#_Toc258082973).
                *
                * * _dynamic_ bodies are treated "normally". They are integrated, and collide, and all that.
                * * _kinematic_ bodies are bodies that move at a specified velocity. Other bodies collide with them, but they don't bounce off of other bodies.
                * * _static_ bodies just stand still. They are like obstacles.
                **/

                /**
                 * Body#hidden = false
                 *
                 * Determines whether the body should be hidden by the renderer.
                 **/

                /** related to: Physics.renderer
                 * Body#view = it_depends
                 *
                 * Storage for use by the renderer.
                 *
                 * The type of renderer will put different things in the view property.
                 * Basically, this is how the body "looks". It could be a HTMLElement, or
                 * an Image, etc...
                 *
                 * If your body changes appearance (shape), you should modify this somehow
                 * otherwise the renderer will keep using this same view. If you're letting
                 * the renderer create the view for you, just set this to `undefined` if the
                 * body gets modified in shape during the simulation.
                 **/

                /** related to: Physics.renderer
                 * Body#styles
                 *
                 * The styles the renderer should use for creating the view.
                 *
                 * The styles depend on the renderer. See [[Renderer#createView]] for style options.
                 **/
        },

        /**
         * Body#sleep( [dt] ) -> Boolean
         * - dt (Number): Time to advance the idle time
         * - dt (Boolean): If `true`, the body will be forced to sleep. If `false`, the body will be forced to awake.
         *
         * Get and/or set whether the body is asleep.
         *
         * If called with a time (in ms), the time will be added to the idle time and sleep conditions will be checked.
         **/
        sleep: function( dt ){

            if ( dt === true ){
                // force sleep
                this.asleep = true;

            } else if ( dt === false ){
                // force wakup
                this.asleep = false;
                this._sleepMeanK = 0;
                this._sleepAngPosMean = 0;
                this._sleepAngPosVariance = 0;
                this._sleepPosMean.zero();
                this._sleepPosVariance.zero();
                this.sleepIdleTime = 0;

            } else if ( dt && !this.asleep ) {

                this.sleepCheck( dt );
            }

            return this.asleep;
        },

        /**
         * Body#sleepCheck( [dt] )
         * - dt (Number): Time to advance the idle time
         *
         * Check if the body should be sleeping.
         *
         * Call with no arguments if some event could possibly wake up the body. This will force the body to recheck.
         **/
        sleepCheck: function( dt ){

            var opts = this._world && this._world.options;

            // if sleeping disabled. stop.
            if ( this.sleepDisabled || (opts && opts.sleepDisabled) ){
                return;
            }

            var limit
                ,v
                ,d
                ,r
                ,aabb
                ,scratch = Physics.scratchpad()
                ,diff = scratch.vector()
                ,diff2 = scratch.vector()
                ,kfac
                ,stats
                ;

            dt = dt || 0;
            aabb = this.geometry.aabb();
            r = Math.max(aabb.hw, aabb.hh);

            if ( this.asleep ){
                // check velocity
                v = this.state.vel.norm() + Math.abs(r * this.state.angular.vel);
                limit = this.sleepSpeedLimit || (opts && opts.sleepSpeedLimit) || 0;

                if ( v >= limit ){
                    this.sleep( false );
                    return scratch.done();
                }
            }

            this._sleepMeanK++;
            kfac = this._sleepMeanK > 1 ? 1/(this._sleepMeanK - 1) : 0;
            Physics.statistics.pushRunningVectorAvg( this.state.pos, this._sleepMeanK, this._sleepPosMean, this._sleepPosVariance );
            // we take the sin because that maps the discontinuous angle to a continuous value
            // then the statistics calculations work better
            stats = Physics.statistics.pushRunningAvg( Math.sin(this.state.angular.pos), this._sleepMeanK, this._sleepAngPosMean, this._sleepAngPosVariance );
            this._sleepAngPosMean = stats[0];
            this._sleepAngPosVariance = stats[1];
            v = this._sleepPosVariance.norm() + Math.abs(r * Math.asin(stats[1]));
            v *= kfac;
            limit = this.sleepVarianceLimit || (opts && opts.sleepVarianceLimit) || 0;
            // console.log(v, limit, kfac, this._sleepPosVariance.norm(), stats[1])
            if ( v <= limit ){
                // check idle time
                limit = this.sleepTimeLimit || (opts && opts.sleepTimeLimit) || 0;
                this.sleepIdleTime = (this.sleepIdleTime || 0) + dt;

                if ( this.sleepIdleTime > limit ){
                    this.asleep = true;
                }
            } else {
                this.sleep( false );
            }

            scratch.done();
        },

        /**
         * Body#setWorld( world ) -> this
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
         * Body#accelerate( acc ) -> this
         * - acc (Physics.vector): The acceleration vector
         *
         * Accelerate the body by adding supplied vector to its current acceleration
         **/
        accelerate: function( acc ){

            if ( this.treatment === 'dynamic' ){
                this.state.acc.vadd( acc );
            }

            return this;
        },

        /**
         * Body#applyForce( force[, p] ) -> this
         * - force (Vectorish): The force vector
         * - p (Vectorish): The point vector from the COM at which to apply the force
         *
         * Apply a force at center of mass, or at point `p` relative to the center of mass
         **/
        applyForce: function( force, p ){

            if ( this.treatment !== 'dynamic' ){
                return this;
            }

            var scratch = Physics.scratchpad()
                ,r = scratch.vector()
                ,state
                ;

            // if no point at which to apply the force... apply at center of mass
            if ( p && this.moi ){

                // apply torques
                state = this.state;
                r.clone( p );
                // r cross F
                this.state.angular.acc -= r.cross( force ) / this.moi;
            }

            this.accelerate( r.clone( force ).mult( 1/this.mass ) );

            scratch.done();
            return this;
        },

        /** related to: Body#offset
         * Body#getGlobalOffset( [out] ) -> Physics.vector
         * - out (Physics.vector): A vector to use to put the result into. One is created if `out` isn't specified.
         * + (Physics.vector): The offset in global coordinates
         *
         * Get the body offset vector (from the center of mass) for the body's shape in global coordinates.
         **/
        getGlobalOffset: function( out ){

            out = out || new Physics.vector();
            out.clone( this.offset ).rotate( this.state.angular.pos );
            return out;
        },

        /** related to: Physics.aabb
         * Body#aabb() -> Object
         * + (Object): The aabb of this body
         *
         * Get the Axis aligned bounding box for the body in its current position and rotation
         **/
        aabb: function(){

            var angle = this.state.angular.pos
                ,scratch = Physics.scratchpad()
                ,v = scratch.vector()
                ,aabb = this.geometry.aabb( angle )
                ;

            this.getGlobalOffset( v );

            aabb.x += this.state.pos._[0] + v._[0];
            aabb.y += this.state.pos._[1] + v._[1];

            return scratch.done( aabb );
        },

        /**
         * Body#toBodyCoords( v ) -> Physics.vector
         * - v (Physics.vector): The vector to transform
         * + (Physics.vector): The transformed vector
         *
         * Transform a vector into coordinates relative to this body.
         **/
        toBodyCoords: function( v ){
            return v.vsub( this.state.pos ).rotate( -this.state.angular.pos );
        },

        /**
          * Body#toWorldCoords( v ) -> Physics.vector
          * - v (Physics.vector): The vector to transform
          * + (Physics.vector): The transformed vector
          *
          * Transform a vector from body coordinates into world coordinates.
          **/
        toWorldCoords: function( v ){
            return v.rotate( this.state.angular.pos ).vadd( this.state.pos );
        },

        /**
         * Body#recalc() -> this
         *
         * Recalculate properties.
         *
         * Intended to be overridden by subclasses. Call when body physical properties are changed.
         **/
        recalc: function(){
            // override to recalculate properties
            return this;
        }
    });

    /**
     * Body.getCOM( bodies[, com] ) -> Physics.vector
     * - bodies (Array): The list of bodies
     * - com (Physics.vector): The vector to put result into. A new vector will be created if not provided.
     * + (Physics.vector): The center of mass position
     *
     * Get center of mass position from list of bodies.
     **/
    Physics.body.getCOM = function( bodies, com ){
        // @TODO add a test for this fn
        var b
            ,pos
            ,i
            ,l = bodies && bodies.length
            ,M = 0
            ;

        com = com || new Physics.vector();

        if ( !l ){
            return com.zero();
        }

        if ( l === 1 ){
            return com.clone( bodies[0].state.pos );
        }

        com.zero();

        for ( i = 0; i < l; i++ ){
            b = bodies[ i ];
            pos = b.state.pos;
            com.add( pos._[0] * b.mass, pos._[1] * b.mass );
            M += b.mass;
        }

        com.mult( 1 / M );

        return com;
    };

}());
