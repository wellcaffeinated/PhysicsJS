/**
 * PhysicsJS v1.0.0-rc1 - 2014-04-15
 * A modular, extendable, and easy-to-use physics engine for javascript
 * http://wellcaffeinated.net/PhysicsJS
 *
 * Copyright (c) 2014 Jasper Palfree <jasper@wellcaffeinated.net>
 * Licensed MIT
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['physicsjs'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory.apply(root, ['physicsjs'].map(require));
    } else {
        factory.call(root, root.Physics);
    }
}(this, function (Physics) {
    'use strict';
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
     * - minVel: The minimum velocity clamp [[Vectorish]] (default: { x: -5, y: -5 }) to restrict velocity a user can give to a body
     * - maxVel: The maximum velocity clamp [[Vectorish]] (default: { x: 5, y: 5 }) to restrict velocity a user can give to a body
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
                    ,prevTreatment
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
                var grab = function grab( e ){
                    var pos = getCoords( e )
                        ,body
                        ;
    
                    if ( self._world ){
                        body = self._world.findOne({ $at: new Physics.vector( pos.x, pos.y ) });
    
                        if ( body ){
                            // we're trying to grab a body
    
                            // fix the body in place
                            prevTreatment = body.treatment;
                            body.treatment = 'kinematic';
                            body.state.vel.zero();
                            body.state.angular.vel = 0;
                            // remember the currently grabbed body
                            self.body = body;
                            // remember the mouse offset
                            self.mousePos.clone( pos );
                            self.offset.clone( pos ).vsub( body.state.pos );
    
                            pos.body = body;
                            self._world.emit('interact:grab', pos);
    
                        } else {
                            
                            self._world.emit('interact:poke', pos);
                        }
                    }
                };
    
                var move = Physics.util.throttle(function move( e ){
                    var pos
                        ,state
                        ;
    
                    if ( self.body ){
                        pos = getCoords( e );
                        time = Date.now();
    
                        self.mousePosOld.clone( self.mousePos );
                        // get new mouse position
                        self.mousePos.set(pos.x, pos.y);
                    }
                }, self.options.moveThrottle);
    
                var release = function release( e ){
                    var pos = getCoords( e )
                        ,body
                        ,dt = Math.max(Date.now() - time, self.options.moveThrottle)
                        ;
    
                    // get new mouse position
                    self.mousePos.set(pos.x, pos.y);
    
                    // release the body
                    if (self.body){
                        self.body.treatment = prevTreatment;
                        // calculate the release velocity
                        self.body.state.vel.clone( self.mousePos ).vsub( self.mousePosOld ).mult( 1 / dt );
                        // make sure it's not too big
                        self.body.state.vel.clamp( self.options.minVel, self.options.maxVel );
                        self.body = false;
                    }
    
                    if ( self._world ){
    
                        self._world.emit('interact:release', pos);
                    }
                };
    
                this.el.addEventListener('mousedown', grab);
                this.el.addEventListener('touchstart', grab);
    
                this.el.addEventListener('mousemove', move);
                this.el.addEventListener('touchmove', move);
    
                this.el.addEventListener('mouseup', release);
                this.el.addEventListener('touchend', release);
            },
    
            // extended
            connect: function( world ){
    
                // subscribe the .behave() method to the position integration step
                world.on('integrate:positions', this.behave, this);
            },
    
            // extended
            disconnect: function( world ){
    
                // unsubscribe when disconnected
                world.off('integrate:positions', this.behave);
            },
    
            // extended
            behave: function( data ){
    
                var self = this
                    ,state
                    ;
    
                if ( self.body ){
    
                    // if we have a body, we need to move it the the new mouse position.
                    // we'll do this by adjusting the velocity so it gets there at the next step
                    state = self.body.state;
                    state.vel.clone( self.mousePos ).vsub( self.offset ).vsub( state.pos ).mult( 1 / self.options.moveThrottle );
                }
            }
        };
    });
    
    // end module: behaviors/interactive.js
    return Physics;
}));// UMD