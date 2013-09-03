---
layout: default
title: PhysicsJS
---

# Physics<span class="js">JS</span> <small>is a modular, extendable, and easy-to-use physics engine for javascript</small><canvas id="intro-viewport"></canvas>

**PhysicsJS is still under development (alpha version 0.5.0), and documentation is unfinished. Stay tuned! It will be online soon.**

## Demos

Check out the [demo page][demos] for some sweet examples of what you can do.





[demos]: /examples


<script>
Physics(function(world){
  
    var el = document.getElementById('intro-viewport').parentNode;
    var viewWidth = el.offsetWidth;
    var viewHeight = 80;
        
    var renderer = Physics.renderer('canvas', {
    el: 'intro-viewport',
    width: viewWidth,
    height: viewHeight,
    meta: false,
    styles: {
        'circle' : {
            strokeStyle: 'hsla(60, 37%, 17%, 1)',
            lineWidth: 1,
            fillStyle: 'hsla(60, 37%, 57%, 0.8)',
            angleIndicator: 'hsla(60, 37%, 17%, 0.4)'
        }
    }
    });

    // add the renderer
    world.add( renderer );

    // bounds of the window
    var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);

    // constrain objects to these bounds
    world.add(Physics.behavior('edge-collision-detection', {
      aabb: viewportBounds,
      restitution: 0.99,
      cof: 0.99
    }));

    // add a circle
    world.add(
      Physics.body('circle', {
          x: 20,
          y: 30,
          vx: 0.2,
          radius: 20,
          restitution: 0.99
      })
    );

    // ensure objects bounce when edge collision is detected
    world.add( Physics.behavior('body-impulse-response') );

    // add some gravity
    world.add( Physics.behavior('constant-acceleration') );

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.subscribe(function( time, dt ){

      world.step( time );

      // only render if not paused
      if ( !world.isPaused() ){
          world.render();
      }
    });

    // start the ticker
    Physics.util.ticker.start();

});
</script>