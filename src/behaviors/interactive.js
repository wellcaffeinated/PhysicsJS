/**
 * class InteractiveBehavior < Behavior
 *
 * `Physics.behavior('interactive')`.
 *
 * User interaction helper.
 *
 * Used to get mouse/touch events and add a mouse grab interaction.
 *
 * Additional options include:
 * - el: The element of the renderer. What you input as the `el` for the renderer.
 * - moveThrottle: The min time between move events (default: `10`).
 * - inertion: Whether apply inertion after object releasing or not.
 * - type: "translate" or "rotate".
 * - specialTreatment: special treatment for grabbed object
 * - minVel: The minimum velocity clamp [[Vectorish]] (default: { x: -5, y: -5 }) to restrict velocity a user can give to a body
 * - maxVel: The maximum velocity clamp [[Vectorish]] (default: { x: 5, y: 5 }) to restrict velocity a user can give to a body
 * - minAngVel: The minimum velocity clamp for rotation (default: `0`).
 * - maxAngVel: The maximum velocity clamp for rotation (default: `5`).
 *
 * The behavior also triggers the following events on the world:
 * ```javascript
 * // a body has been grabbed
 * world.on('interact:grab', function( data ){
 *     data.x; // the x coord
 *     data.y; // the y coord
 *     data.body; // the body that was grabbed
 * });
 * // no body was grabbed, but the renderer area was clicked, or touched
 * world.on('interact:poke', function( data ){
 *     data.x; // the x coord
 *     data.y; // the y coord
 * });
 * world.on('interact:move', function( data ){
 *     data.x; // the x coord
 *     data.y; // the y coord
 *     data.body; // the body that was grabbed (if applicable)
 * });
 * // when the viewport is released (mouseup, touchend)
 * world.on('interact:release', function( data ){
 *     data.x; // the x coord
 *     data.y; // the y coord
 * });
 * ```
 **/
Physics.behavior('interactive', function( parent ){

    if ( !document ){
        // must be in node environment
        return {};
    }

    var defaults = {
            // the element to monitor
            el: null,
            // time between move events
            moveThrottle: 1000 / 100 | 0,
            // inertion after release
            inertion: true,
            // interaction type
            type: "translate",
            // minimum velocity clamp
            minVel: { x: -5, y: -5 },
            // maximum velocity clamp
            maxVel: { x: 5, y: 5 },
            // minimum angular velocity clamp
            minAngVel: 0,
            // maximum angular velocity clamp
            maxAngVel: 5,
            // special treatment for grabbed object
            specialTreatment: "kinematic",
        }

        ,getElementOffset = function( el ){
            var curleft = 0
                ,curtop = 0
                ;

            if (el.offsetParent) {
                do {
                    curleft += el.offsetLeft;
                    curtop += el.offsetTop;
                } while (el = el.offsetParent);
            }

            return { left: curleft, top: curtop };
        }
        ,getCoords = function( e ){
            var offset = getElementOffset( e.target )
                ,obj = ( e.changedTouches && e.changedTouches[0] ) || e
                ,x = obj.pageX - offset.left
                ,y = obj.pageY - offset.top
                ;

            return {
                x: x
                ,y: y
            };
        }
        ;

    return {
        // extended
        init: function( options ){

            var self = this
                ,time
                ;

            // call parent init method
            parent.init.call( this );
            this.options.defaults( defaults );
            this.options( options );

            // vars
            this.mousePos = new Physics.vector();
            this.mousePosOld = new Physics.vector();
            this.offset = new Physics.vector();

            this.el = typeof this.options.el === 'string' ? document.getElementById(this.options.el) : this.options.el;

            if ( !this.el ){
                throw "No DOM element specified";
            }

            // init events
            this.grab = function grab( e ){
                var pos = getCoords( e );

                if ( self._world ){
                    var body = self._world.findOne({ $at: new Physics.vector( pos.x, pos.y ) });

                    self.grabBody(e, body);
                }
            };

            this.move = Physics.util.throttle(function move( e ){
                var pos = getCoords( e )
                    ,state
                    ;

                if ( self.body && self._targets === null || self._targets.indexOf(self.body) !== -1 ){
                    time = Physics.util.ticker.now();

                    self.mousePosOld.clone( self.mousePos );
                    // get new mouse position
                    self.mousePos.set(pos.x, pos.y);

                    self.body.state.vel.zero();
                    self.body.state.angular.vel = 0;
                    self.body.state.acc.zero();
                    self.body.state.angular.acc = 0;

                    pos.body = self.body;
                }

                self._world.emit('interact:move', pos);

            }, self.options.moveThrottle);

            this.release = function release( e ){
                var pos = getCoords( e )
                    ,dt = Math.max(Physics.util.ticker.now() - time, self.options.moveThrottle)
                    ;

                // get new mouse position
                self.mousePos.set(pos.x, pos.y);

                // release the body
                if ( self.body && self._targets === null || self._targets.indexOf(self.body) !== -1 ){
                    self.body.treatment = self.prevTreatment;
                    // calculate the release velocity
                    var state = self.body.state;
                    if ( self.options.inertion ){
                        if ( self.options.type === "translate" ){
                            state.vel.clone( self.mousePos ).vsub( self.mousePosOld ).mult( 1 / dt );
                            // make sure it's not too big
                            state.vel.clamp( self.options.minVel, self.options.maxVel );
                        } else if ( self.options.type === "rotate" ){
                            var vec = self.mousePos.clone().vsub( self.mousePosOld );
                            var grabPos = self.offset.clone().rotate( state.angular.pos - self.angularOffset );
                            var angle = Math.atan2( vec.y, vec.x ) - Math.atan2( grabPos.y, grabPos.x );
                            state.angular.vel = angle / dt;
                            // make sure it's not too big
                            if ( state.angular.vel > self.options.maxAngVel ) {
                                state.angular.vel = self.options.maxAngVel;
                            } else if ( state.angular.vel < self.options.minAngVel ) {
                                state.angular.vel = self.options.minAngVel;
                            }
                        }
                    } else {
                        state.vel.zero();
                        state.angular.vel = 0;
                        state.acc.zero();
                        state.angular.acc = 0;
                    }


                    self.body = false;
                }

                if ( self._world ){

                    self._world.emit('interact:release', getCoords( e ));
                }
            };
        },

        grabBody: function( e, body ){
            var self = this;
            if ( body && self._targets === null || self._targets.indexOf(body) !== -1 ){
                var pos = getCoords( e );
                // we're trying to grab a body

                // fix the body in place
                self.prevTreatment = body.treatment;
                body.treatment = self.options.specialTreatment;
                body.state.vel.zero();
                body.state.angular.vel = 0;
                body.state.acc.zero();
                body.state.angular.acc = 0;
                // remember the currently grabbed body
                self.body = body;
                // remember the mouse offset
                self.mousePos.clone( pos );
                self.offset.clone( pos ).vsub( body.state.pos );
                self.angularOffset = body.state.angular.pos;

                pos.body = body;
                self._world.emit('interact:grab', pos);

            } else {

                self._world.emit('interact:poke', getCoords( e ));
            }
        },

        // extended
        connect: function( world ){

            // subscribe the .behave() method to the position integration step
            world.on('integrate:positions', this.behave, this);

            this.el.addEventListener('mousedown', this.grab);
            this.el.addEventListener('touchstart', this.grab);

            this.el.addEventListener('mousemove', this.move);
            this.el.addEventListener('touchmove', this.move);

            this.el.addEventListener('mouseup', this.release);
            this.el.addEventListener('touchend', this.release);
        },

        // extended
        disconnect: function( world ){

            // unsubscribe when disconnected
            world.off('integrate:positions', this.behave);

            this.el.removeEventListener('mousedown', this.grab);
            this.el.removeEventListener('touchstart', this.grab);

            this.el.removeEventListener('mousemove', this.move);
            this.el.removeEventListener('touchmove', this.move);

            this.el.removeEventListener('mouseup', this.release);
            this.el.removeEventListener('touchend', this.release);
        },

        // extended
        behave: function( data ){

            var self = this
                ,state
                ,dt = Math.max(data.dt, self.options.moveThrottle)
                ;

            if ( self.body && self._targets === null || self._targets.indexOf(self.body) !== -1 ){

                // if we have a body, we need to move it the the new mouse position.
                // we'll do this by adjusting the velocity so it gets there at the next step
                state = self.body.state;
                if ( self.options.type === "translate" ){
                    state.vel.clone( self.mousePos ).vsub( self.offset ).vsub( state.pos ).mult( 1 / dt );
                } else if ( self.options.type === "rotate" ){
                    var vec = self.mousePos.clone().vsub( state.pos );
                    var grabPos = self.offset.clone().rotate( state.angular.pos - self.angularOffset );
                    var angle = Math.atan2( vec.y, vec.x ) - Math.atan2( grabPos.y, grabPos.x );
                    state.angular.vel = angle / dt;
                }
            }
        }
    };
});
