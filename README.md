# PhysicsJS

Under development.


# Extending objects

Example:

    Physics.body('my-circle', 'circle', function( parent ){

        return {
            init: function( options ){

                // override incoming options...
                options.radius = 15;
                parent.init.call(this, options);
                
                // custom stuff
                this.myThing = 2;
            },
            overrideMethod: function(){

                // overridden!
            }
        };
    });

    var mine = Physics.body('my-circle', {
            // options
        });

    world.add(mine);
