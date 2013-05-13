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

                    this.el = $(options.el).on({
                        mousedown: function(e){
                            self.mouseDown = true;
                        },
                        mousemove: function(e){
                            var offset = $(this).offset();
                            self.mousePos.set(e.screenX - offset.left, e.screenY - offset.top);
                        },
                        mouseup: function(e){
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

                    if ( !this.mouseDown ) return;

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