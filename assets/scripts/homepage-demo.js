require([

    'jquery',

    'physicsjs',
    
    'physicsjs/renderers/canvas',

    'physicsjs/bodies/circle',
    'physicsjs/bodies/convex-polygon',

    'demo-mouse-events',
    'physicsjs/behaviors/edge-collision-detection',
    'physicsjs/behaviors/body-impulse-response',
    'physicsjs/behaviors/constant-acceleration',
    'physicsjs/behaviors/rigid-constraint-manager',
    'physicsjs/behaviors/body-collision-detection',
    'physicsjs/behaviors/sweep-prune'

], function($, Physics){

    'use strict';

    Physics(function(world){
      
        var el = document.getElementById('intro-viewport').parentNode;
        var viewWidth = Math.max(el.offsetWidth, 400);
        var viewHeight = 300;
            
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
            },

            'convex-polygon' : {
                strokeStyle: 'hsla(60, 37%, 17%, 1)',
                lineWidth: 1,
                fillStyle: 'hsla(60, 37%, 57%, 0.8)',
                angleIndicator: 'none'
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
          restitution: 0.2,
          cof: 0.8
        }));

        // add a circle
        world.add(
          Physics.body('circle', {
              x: viewWidth/2,
              y: 60,
              radius: 20,
              restitution: 0.99
          })
        );

        // add a square
        world.add(
          Physics.body('convex-polygon', {
              x: 30,
              y: 60,
              vx: 0.2,
              vertices: [
                {x: 0, y: 50},
                {x: 50, y: 50},
                {x: 50, y: 0},
                {x: 0, y: 0}
              ],
              restitution: 0.99
          })
        );

        // add a weird shape
        world.add(
          Physics.body('convex-polygon', {
              x: viewWidth - 100,
              y: 60,
              vx: -0.2,
              vertices: [
                {x: 0, y: 80},
                {x: -20, y: 50},
                {x: -40, y: 0},
                {x: -20, y: -40},
                {x: 0, y: -50},
                {x: 30, y: -20},
                {x: 30, y: 0}
              ],
              angle: Math.PI/1.5,
              restitution: 0.99
          })
        );

        // the "basket"
        var basket = []
          ,rigidConstraints = Physics.behavior('rigid-constraint-manager', {
            targetLength: 9
          })
          ,l
          ;

        for ( var i = 100; i < viewWidth - 100; i += 10 ){
                
            l = basket.push(
                Physics.body('circle', {
                    x: i,
                    y: viewHeight / 2 + 50,
                    radius: 1,
                    restitution: 0.2,
                    mass: .5,
                    hidden: true
                })
            );

            rigidConstraints.constrain( basket[ l - 1 ], basket[ l - 2 ] );
        }

        world.subscribe('render', function( data ){

            var renderer = data.renderer;
            for ( var i = 1, l = basket.length; i < l; ++i ){
                
                renderer.drawLine(basket[ i - 1 ].state.pos, basket[ i ].state.pos, {
                    strokeStyle: '#C30000',
                    lineWidth: 3
                });
            }
        });

        // fix the ends
        basket[ 0 ].fixed = true;
        basket[ l - 1 ].fixed = true;

        basket[ 0 ].hidden = false;
        basket[ l - 1 ].hidden = false;

        world.add( basket );
        world.add( rigidConstraints );

        // ensure objects bounce when edge collision is detected
        world.add( Physics.behavior('body-impulse-response') );
        world.add( Physics.behavior('body-collision-detection', { checkAll: false }) );
        world.add( Physics.behavior('sweep-prune') );

        // add some gravity
        world.add( Physics.behavior('constant-acceleration') );

        // add mouse events
        world.add( Physics.behavior('demo-mouse-events', { el: '#intro-viewport' }) );

        world.pause();
        world.render();

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

        $(function(){

            world.unpause();
        });
    });
});