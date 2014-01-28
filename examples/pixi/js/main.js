/**
 * PhysicsJS by Jasper Palfree <wellcaffeinated.net>
 * http://wellcaffeinated.net/PhysicsJS
 *
 * Example use of PIXI renderer with physics 
 * By Nathan Gallagher (ngallagher87: bluerex.ca)
 */
Physics(function(world){
	
	var viewWidth = 500;
	var viewHeight = 300;
	
	var renderer = Physics.renderer('pixi', {
		el: 'viewport',
		width: viewWidth,
		height: viewHeight,
		meta: true
	});
	
	// add the renderer
	world.add( renderer );
	
	// Load our spritesheet assets
	// Call loadActors() defined below when assets are loaded
	renderer.loadSpritesheets(['img/frog.json'], loadActors);
	
	// render on each step
	world.subscribe('step', function(){
		world.render();
	});
	
	// bounds of the window
	var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
	
	// constrain objects to these bounds
	world.add(Physics.behavior('edge-collision-detection', {
		aabb: viewportBounds,
		restitution: 0.99,
		cof: 0.99
	}));
	
	// ensure objects bounce when edge collision is detected
	world.add( Physics.behavior('body-impulse-response') );
	// Bounce the comet of the monster
	world.add( Physics.behavior('body-collision-detection', { checkAll: false }) );
	world.add( Physics.behavior('sweep-prune') );
	
	// subscribe to ticker to advance the simulation
	Physics.util.ticker.subscribe(function( time, dt ){
	
		world.step( time );
		
		// Move our displacement filter and overlay here
		overlay.tilePosition.x -= 0.5;
		overlay.tilePosition.y -= 1;
		displacementFilter.offset.x += 2;
		displacementFilter.offset.y += 2;
	});
	
	/**
	Lets add some cool PIXI stuff here, like some filters and backgrounds
	*/
	var underwater = new PIXI.DisplayObjectContainer();
	// Apply some cool pixi effects here!
	var displacementTexture = PIXI.Texture.fromImage("img/displacement_map.jpg");
	var displacementFilter = new PIXI.DisplacementFilter(displacementTexture);
	displacementFilter.scale.x = 50;
	displacementFilter.scale.y = 50;
	
	var bg = PIXI.Sprite.fromImage("img/Rock-Bottom-1.png");
	underwater.addChild(bg);
	
	var overlay = new PIXI.TilingSprite(PIXI.Texture.fromImage("img/Ripples-1.png"), 630, 410);
	overlay.alpha = 0.1;
	
	underwater.addChild(overlay);
	underwater.filters = [displacementFilter];
	renderer.stage.addChild(underwater);
	
	// start the ticker
	Physics.util.ticker.start();
	
	function loadActors() {
		
		// Example of a sprite
		var lilypad = Physics.body('circle', {
			x: 50, // x-coordinate
			y: 70, // y-coordinate
			vx: 0.2, // velocity in x-direction
			vy: 0.11, // velocity in y-direction,
			radius: 25
		});
		lilypad.view = renderer.createDisplay('sprite', {
			texture: 'img/Lilypad-Flower-1.png',
			anchor: {
				x: 0.5,
				y: 0.5
			}
		});
		// Add another lilypad
		var lilypad2 = Physics.body('circle', {
			x: 20, // x-coordinate
			y: 150, // y-coordinate
			vx: -0.15, // velocity in x-direction
			vy: -0.11, // velocity in y-direction,
			radius: 25
		});
		lilypad2.view = renderer.createDisplay('sprite', {
			texture: 'img/Lilypad-1.png',
			anchor: {
				x: 0.5,
				y: 0.5
			}
		});
		
		var square = [
			{x: 0, 	y: 40},
			{x: 40, 	y: 40},
			{x: 40, 	y: 0},
			{x: 0, 	y: 0}
		];
		var frogFrames = [
			'Small-Frog-1.png', 'Small-Frog-2.png',
			'Small-Frog-3.png', 'Small-Frog-4.png',
			'Small-Frog-5.png', 'Small-Frog-6.png',
			'Small-Frog-7.png', 'Small-Frog-6.png',
			'Small-Frog-5.png', 'Small-Frog-4.png',
			'Small-Frog-3.png', 'Small-Frog-2.png',
			'Small-Frog-1.png', 'Small-Frog-2.png',
			'Small-Frog-3.png', 'Small-Frog-3.png',
			'Small-Frog-3.png', 'Small-Frog-3.png',
			'Small-Frog-3.png', 'Small-Frog-2.png'
			
		];
		for (var i = 0; i < 3; i++) {
			// Example of a movie clip
			var frog = Physics.body('convex-polygon', {
				vertices: square,
				x: 50 + (20 * (i + (Math.random() / 10))), // x-coordinate
				y: 200 + (10 * (i + (Math.random() / 10))), // y-coordinate
				vx: 0.01 + (Math.random() / 10), // velocity in x-direction
				vy: 0.01 - (Math.random() / 10), // velocity in y-direction,
				mass: 1,
				restitution: 0.5,
				cof: 1
			});
			frog.view = renderer.createDisplay('movieclip', {
				// Define the animations frames here
				frames: frogFrames,
				anchor: {
					x: 0.5,
					y: 0.3
				},
				container: underwater
			});
			frog.view.animationSpeed = 0.07;
			frog.view.gotoAndPlay(Math.random() * 7);
			
			world.add( frog );
		}
		
		// add our components!
		world.add( lilypad );
		world.add( lilypad2 );
	}

});