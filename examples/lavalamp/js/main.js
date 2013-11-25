require({
	// use top level so we can access images
    baseUrl: './',
    packages: [{
        name: 'physicsjs',
        location: '../../_working/physicsjs',
        main: 'physicsjs'
    }]
}, [
	'physicsjs',
	'physicsjs/bodies/circle',
	'physicsjs/behaviors/sweep-prune',
	'physicsjs/behaviors/body-collision-detection',
	'physicsjs/behaviors/edge-collision-detection',
	'physicsjs/behaviors/body-impulse-response',

	'js/radiation-behavior',
	'js/buyancy-behavior',
	'js/metaball-renderer'

], function( Physics ){
	
	Physics(function( world ){
		
		var width = 300
			,height = 600
			// bounds of the window
			,viewportBounds = Physics.aabb(0, 0, width, height)
			,renderer = Physics.renderer('metaball', {
				el: 'viewport',
				width: width,
				height: height,
				meta: true,
				// debug:true,
				styles: {
					'circle': {
						strokeStyle: 'black',
						lineWidth: 1,
						fillStyle: 'black',
						angleIndicator: 'white'
					},
					'convex-polygon': {
						strokeStyle: 'black',
						lineWidth: 1,
						fillStyle: 'black',
						angleIndicator: 'none'
					}
				}
			})
			,edgeBounce
			;
		
		world.add(Physics.integrator('verlet', {
			drag: 0.02
		}));
	
		// render on each step
		world.subscribe('step', function () {
			world.render();
		});
	
		// constrain objects to these bounds
		edgeBounce = Physics.behavior('edge-collision-detection', {
			aabb: viewportBounds,
			restitution: 0,
			cof: 0.8
		});
		
		// objects
		var bubbles = [];
		
		for (var i = 0; i < 30; i++){
			var b = Physics.body('circle', {
				x: (i % 6) * 15 + width/2 - 40 + Math.random(),
				y: (Math.floor(i / 6)) * 15 + 50,
				radius: 5,
				restitution: 0
			});
			
			b.temperature = 5;
			b.heatCapacity = 1;
			bubbles.push( b );
		}
		
		var heatSink = Physics.body('circle', {
			x: 700,
			y: height + 100,
			radius: 100,
			fixed: true,
			hidden: true
		});
		
		heatSink.temperature = 8;
		heatSink.heatCapacity = 1e10;
		
		// add things...
		world.add( bubbles );
		world.add([
			heatSink,
			renderer,
			edgeBounce,
			// gravity
			//Physics.behavior('constant-acceleration'),
			Physics.behavior('body-collision-detection'),
			Physics.behavior('sweep-prune'),
			Physics.behavior('body-impulse-response'),
			Physics.behavior('radiation'),
			Physics.behavior('buyancy', { strength: 1e-3 })
		]);
	
		// subscribe to ticker to advance the simulation
		Physics.util.ticker.subscribe(function (time, dt) {
	
			world.step(time);
		});
	 
		// start the ticker
		Physics.util.ticker.start();
		
	});
});