define(
    [
        'physicsjs'
    ],
    function(
        Physics
    ){

        Physics.behavior('buoyancy', function( parent ){
                        
            return {
                init: function( cfg ){
                    parent.init.call(this, cfg);
                    this.strength = cfg.strength || 1;
                    this.ambientT = cfg.ambientT || 5;
                },
                
                // apply an acceleration (up/down) based on the temperature of the body
                behave: function( data ){
                    var bodies = data.bodies
                        ,body
                        ,To = this.ambientT
                        ,scratch = Physics.scratchpad()
                        ,a = scratch.vector()
                        ;
                    
                    for ( var i = 0, l = bodies.length; i < l; i++ ){
                        body = bodies[ i ];
                        a.set( 0, this.strength * (To - body.temperature) );
                        body.accelerate( a );
                    }
                    
                    scratch.done();
                }
            };
        });
    }
);