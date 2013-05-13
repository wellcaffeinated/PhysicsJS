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
                                body.fixed = true;
                                self.body = body;
                                self.offset.clone( self.mousePos ).vsub( body.state.pos );
                                return;
                            }

                            self.mouseDown = true;
                        },
                        mousemove: function(e){
                            var offset = $(this).offset();
                            self.mousePosOld.clone( self.mousePos );
                            self.mousePos.set(e.pageX - offset.left, e.pageY - offset.top);
                        },
                        mouseup: function(e){
                            var offset = $(this).offset();
                            self.mousePosOld.clone( self.mousePos );
                            self.mousePos.set(e.pageX - offset.left, e.pageY - offset.top);
                            if (self.body){
                                self.body.fixed = false;
                                self.body = false;
                            }
                            self.mouseDown = false;
                        }
                    });
                },

                connect: function( world ){

                    world.subscribe('integrate:positions', this.behave, this);
                },

                disconnect: function( world ){

                    world.unsubscribe('integrate:positions', this.behave);
                },

                behave: function( data ){

                    if ( this.body ){

                        this.body.state.pos.clone( this.mousePos ).vsub( this.offset );
                        this.body.state.vel.clone( this.body.state.pos ).vsub( this.mousePosOld ).vadd( this.offset ).mult( 1 / 30 );
                        this.body.state.vel.clamp( { x: -1, y: -1 }, { x: 1, y: 1 } );
                        return;
                    }

                    if ( !this.mouseDown ){
                        return;
                    }

                    var bodies = data.bodies
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