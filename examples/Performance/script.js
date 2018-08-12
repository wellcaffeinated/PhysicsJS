$(document).ready(function(){

Physics(function (world) {

    var viewWidth = window.innerWidth/2
        ,viewHeight = window.innerHeight/2
        // bounds of the window
        ,viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight)
        ,edgeBounce
        ,renderer
        ;

    // create a renderer
    renderer = Physics.renderer('canvas', {
        el: 'viewport'
        ,width: viewWidth
        ,height: viewHeight
        ,meta: true
    });

    // add the renderer
    world.add(renderer);
    // render on each step
    world.on('step', function () {
        world.render();
    });

    // constrain objects to these bounds
    edgeBounce = Physics.behavior('edge-collision-detection', {
        aabb: viewportBounds
        ,restitution: 0.2
        ,cof: 1
    });

    var gravity = Physics.behavior('constant-acceleration', {
        acc: { x : 0, y: 0.0014 } // this is the default: .0004
    });


    // resize events
    window.addEventListener('resize', function () {

        viewWidth = window.innerWidth;
        viewHeight = window.innerHeight;

        renderer.el.width = viewWidth;
        renderer.el.height = viewHeight;

        viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
        // update the boundaries
        edgeBounce.setAABB(viewportBounds);

    }, true);

    // for constraints
    var rigidConstraints = Physics.behavior('verlet-constraints', {
        iterations: 10
    });

    // the "basket"
    var basket = [];
    var fpos = window.innerWidth / 6;
    var epos = window.innerHeight / 6;
    
    

    
    for(i=0;i<20;i++){
	    box = Physics.body('rectangle', {
	        x: fpos/2 + Math.random()*fpos
	        ,y: Math.random()*epos
	        ,width: 5+Math.random()*50
	        ,height: 5+Math.random()*50
		     ,styles: {
		         strokeStyle: 'white',
		         lineWidth: 2,
		         fillStyle: 'black',
		         angleIndicator: 'white'
		     }
	        ,offset:{ x: 0, y: 0 }
	    });
	    
	    world.add(box);
    }
    
   


    world.on('render', function( data ){

        var renderer = data.renderer;
        
    });

    

    // add things to the world
    world.add([
        Physics.behavior('interactive', { el: renderer.el })
        ,Physics.behavior('constant-acceleration')
        ,Physics.behavior('body-impulse-response')
        ,Physics.behavior('body-collision-detection')
        ,Physics.behavior('sweep-prune')
        ,edgeBounce
        ,gravity
    ]);

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time ) {
        world.step( time );
    });

    // start the ticker
    Physics.util.ticker.start();
});
})