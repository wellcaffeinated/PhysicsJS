# PhysicsJS

Currently an **pre-alpha**. Not claimed to be stable. But claimed to be awesome.

Steps before alpha release:

* Documentation
* Examples
* Community code review


# Extending objects

Example:

```javascript
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
```

# Directionality

Positive direction of:

    * x: right
    * y: down
    * angle: clockwise

