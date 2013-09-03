define(
    [
        'jquery',
        'physicsjs'
    ],
    function(
        $,
        Physics
    ){

        Physics.behavior('demo-mouse-events', function( parent ){

            return {

                init: function( options ){

                    var self = this;

                    this.mousePos = Physics.vector();
                    this.mousePosOld = Physics.vector();
                    this.offset = Physics.vector();
                    
                    this.el = $(options.el).on({
                        mousedown: function(e){
                            
                            var offset = $(this).offset();
                            self.mousePos.set(e.pageX - offset.left, e.pageY - offset.top);
                            
                            var body = self._world.findOne({ $at: self.mousePos }) ;
                            if ( body ){

                                // we're trying to grab a body

                                // fix the body in place
                                body.fixed = true;
                                // remember the currently grabbed body
                                self.body = body;
                                // remember the mouse offset
                                self.offset.clone( self.mousePos ).vsub( body.state.pos );
                                return;
                            }

                            self.mouseDown = true;
                        },
                        mousemove: function(e){
                            var offset = $(this).offset();
                            self.mousePosOld.clone( self.mousePos );
                            // get new mouse position
                            self.mousePos.set(e.pageX - offset.left, e.pageY - offset.top);
                        },
                        mouseup: function(e){
                            var offset = $(this).offset();
                            self.mousePosOld.clone( self.mousePos );
                            self.mousePos.set(e.pageX - offset.left, e.pageY - offset.top);

                            // release the body
                            if (self.body){
                                self.body.fixed = false;
                                self.body = false;
                            }
                            self.mouseDown = false;
                        }
                    });
                },

                connect: function( world ){

                    // subscribe the .behave() method to the position integration step
                    world.subscribe('integrate:positions', this.behave, this);
                },

                disconnect: function( world ){

                    // unsubscribe when disconnected
                    world.unsubscribe('integrate:positions', this.behave);
                },

                behave: function( data ){

                    if ( this.body ){

                        // if we have a body, we need to move it the the new mouse position.
                        // we'll also track the velocity of the mouse movement so that when it's released
                        // the body can be "thrown"
                        this.body.state.pos.clone( this.mousePos ).vsub( this.offset );
                        this.body.state.vel.clone( this.body.state.pos ).vsub( this.mousePosOld ).vadd( this.offset ).mult( 1 / 30 );
                        this.body.state.vel.clamp( { x: -1, y: -1 }, { x: 1, y: 1 } );
                        return;
                    }

                    if ( !this.mouseDown ){
                        return;
                    }

                    // if we don't have a body, then just accelerate
                    // all bodies towards the current mouse position

                    var bodies = data.bodies
                        // use a scratchpad to speed up calculations
                        ,scratch = Physics.scratchpad()
                        ,v = scratch.vector()
                        ,body
                        ;

                    for ( var i = 0, l = bodies.length; i < l; ++i ){
                            
                        body = bodies[ i ];

                        // simple linear acceleration law towards the mouse position
                        v.clone(this.mousePos)
                         .vsub( body.state.pos )
                         .normalize()
                         .mult( 0.001 )
                         ;

                        body.accelerate( v );
                    }

                    scratch.done();
                }
            };
        });

        return Physics;
    }
);