/**
 * class InteractiveBehavior < Behavior
 *
 * `Physics.behavior('interactive')`.
 *
 * User interaction helper.
 *
 * Used to get mouse/touch events and add grab interactions.
 *
 * Additional options include:
 * - el: The element of the renderer. What you input as the `el` for the renderer.
 * - moveThrottle: The min time between move events (default: `10`).
 * - minVel: The minimum velocity clamp [[Vectorish]] (default: { x: -5, y: -5 }) to restrict velocity a user can give to a body
 * - maxVel: The maximum velocity clamp [[Vectorish]] (default: { x: 5, y: 5 }) to restrict velocity a user can give to a body
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
 * // when a mouse or pointer moves
 * world.on('interact:move', function( data ){
 *     data.x; // the x coord
 *     data.y; // the y coord
 *     data.body; // the grabbed body that was moved (if applicable)
 * });
 * // when the viewport is released (mouseup, touchend)
 * world.on('interact:release', function( data ){
 *     data.x; // the x coord
 *     data.y; // the y coord
 *     data.body; // the body that was grabbed (if applicable)
 * });
 * ```
 *
 * The behavior also sets body.isGrabbed = true for any grabbed bodies while they are grabbed.
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
            // minimum velocity clamp
            minVel: { x: -5, y: -5 },
            // maximum velocity clamp
            maxVel: { x: 5, y: 5 }
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
        ;

    return {
        // extended
        init: function( options ){

            var self = this
                ,prevTreatment
                ,time
                ;

            // call parent init method
            parent.init.call( this );
            this.options.defaults( defaults );
            this.options( options );

            // vars
            this.bodies = {};
            this.touchPoints = {};
            this.touchPointsOld = {};
            this.offsets = {};

            this.el = typeof this.options.el === 'string' ? document.getElementById(this.options.el) : this.options.el;

            if ( !this.el ){
                throw "No DOM element specified";
            }

            // init events
            // when there are multiple touchdowns, grab is usually called separately for each,
            // but we loop through e.changedTouches just in case
            var grab = function grab( e ){
                var pos
                    ,body
                    ,touchId
                    ,touch
                    ,offset
                    ,touchIndex
                    ,l
                    ;

                if ( self._world ){

                    // Adjust for PointerEvent and older browsers
                    if ( !e.changedTouches ) {
                        e.changedTouches = [ e ];
                    }

                    offset = getElementOffset( e.target );

                    for ( touchIndex = 0, l = e.changedTouches.length; touchIndex < l; touchIndex++) {
                        touch = e.changedTouches[touchIndex];
                        touchId = touch.identifier || touch.pointerId || "mouse";
                        pos = { idx: touchId, x: touch.pageX - offset.left, y: touch.pageY - offset.top };
                        body = self._world.findOne({ $at: new Physics.vector( pos ) });

                        if ( body ){
                            // we're trying to grab a body

                            // fix the body in place
                            prevTreatment = body.treatment;
                            body.treatment = 'kinematic';
                            body.state.vel.zero();
                            body.state.angular.vel = 0;
                            body.isGrabbed = true;
                            // remember the currently grabbed bodies
                            self.bodies[touchId] = body;
                            // remember the click/touch offset
                            self.touchPoints[touchId] = self.touchPoints[touchId] || new Physics.vector();
                            self.touchPoints[touchId].clone( pos );

                            self.offsets[touchId] = self.offsets[touchId] || new Physics.vector();
                            self.offsets[touchId].clone( pos ).vsub( body.state.pos );
                            // init touchPointsOld here, too, so we don't have to do it in "move"
                            self.touchPointsOld[touchId] = self.touchPointsOld[touchId] || new Physics.vector();

                            pos.body = body;
                            self._world.emit('interact:grab', pos);

                        } else {

                            self._world.emit('interact:poke', pos);
                        }
                    }
                }
            };

            // when there are multiple touchdowns, move is called once
            // and e.changedTouches will have one or more touches in it
            var move = Physics.util.throttle(function move( e ){
                var pos
                    ,state
                    ,body
                    ,touchId
                    ,touch
                    ,offset
                    ,touchIndex
                    ,l
                    ;

                if ( self._world ){

                    // Adjust for PointerEvent and older browsers
                    if ( !e.changedTouches ) {
                        e.changedTouches = [ e ];
                    }

                    offset = getElementOffset( e.target );

                    for ( touchIndex = 0, l = e.changedTouches.length; touchIndex < l; touchIndex++) {
                        touch = e.changedTouches[touchIndex];
                        touchId = touch.identifier || touch.pointerId || "mouse";
                        pos = { idx: touchId, x: touch.pageX - offset.left, y: touch.pageY - offset.top };
                        body = self.bodies[touchId];

                        if ( body ){
                            time = Physics.util.ticker.now();

                            // set old mouse position
                            self.touchPointsOld[touchId].clone( self.touchPoints[touchId] );
                            // get new mouse position
                            self.touchPoints[touchId].set(pos.x, pos.y);

                            pos.body = body;
                        }

                        self._world.emit('interact:move', pos);
                    }
                }

            }, self.options.moveThrottle);

            // when there are multiple touchups, release is called once
            // and e.changedTouches will have one or more touches in it
            var release = function release( e ){
                var pos
                    ,body
                    ,touchId
                    ,touch
                    ,offset
                    ,dt = Math.max(Physics.util.ticker.now() - time, self.options.moveThrottle)
                    ,touchIndex
                    ,l
                    ;

                if ( self._world ){

                    // Adjust for PointerEvent and older browsers
                    if (!e.changedTouches) {
                        e.changedTouches = [];
                        e.changedTouches.push(e);
                    }

                    for ( touchIndex = 0, l = e.changedTouches.length; touchIndex < l; touchIndex++) {
                        offset = getElementOffset( e.target );
                        touch = e.changedTouches[touchIndex];
                        touchId = touch.identifier || touch.pointerId || "mouse";
                        pos = { idx: touchId, x: touch.pageX - offset.left, y: touch.pageY - offset.top };
                        body = self.bodies[touchId];

                        // release the body
                        if ( body ){
                            // get new mouse position
                            self.touchPoints[touchId].set(pos.x, pos.y);

                            body.treatment = prevTreatment;
                            // calculate the release velocity
                            body.state.vel.clone( self.touchPoints[touchId] ).vsub( self.touchPointsOld[touchId] ).mult( 1 / dt );
                            // make sure it's not too big
                            body.state.vel.clamp( self.options.minVel, self.options.maxVel );

                            body.isGrabbed = false;
                            pos.body = body;
                        }

                        // emit before we delete the vars in case
                        // the listeners need the body
                        self._world.emit('interact:release', pos);

                        // remove vars
                        delete self.touchPoints[touchId];
                        delete self.touchPointsOld[touchId];
                        delete self.offsets[touchId];
                        delete self.bodies[touchId];

                        if ( body ) {
                            delete body.isGrabbed;
                        }
                    }
                }
            };

            if ( window.PointerEvent ) {

                this.el.addEventListener('pointerdown', grab);
                this.el.addEventListener('pointermove', move);
                this.el.addEventListener('pointerup', release);

            } else {

                this.el.addEventListener('mousedown', grab);
                this.el.addEventListener('touchstart', grab);

                this.el.addEventListener('mousemove', move);
                this.el.addEventListener('touchmove', move);

                this.el.addEventListener('mouseup', release);
                this.el.addEventListener('touchend', release);

            }

        },

        // extended
        connect: function( world ){

            // subscribe the .behave() method to the position integration step
            world.on('integrate:positions', this.behave, this);
        },

        // extended
        disconnect: function( world ){

            // unsubscribe when disconnected
            world.off('integrate:positions', this.behave, this);
        },

        // extended
        behave: function( data ){

            var self = this
                ,state
                ,dt = Math.max(data.dt, self.options.moveThrottle)
                ,body
                ;

            // if we have one or more bodies grabbed, we need to move them to the new mouse/finger positions.
            // we'll do this by adjusting the velocity so they get there at the next step
            for ( var touchId in self.bodies ) {
                body = self.bodies[touchId];
                state = body.state;
                state.vel.clone( self.touchPoints[touchId] ).vsub( self.offsets[touchId] ).vsub( state.pos ).mult( 1 / dt );
            }
        }
    };
});
