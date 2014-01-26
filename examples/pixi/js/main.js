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
	renderer.loadSpritesheets(['img/enemy.json'], loadActors);
	
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
	world.add( Physics.behavior('body-collision-detection', { checkAll: true }) );
	
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
	var container = new PIXI.DisplayObjectContainer();
	// Apply some cool pixi effects here!
	var displacementTexture = PIXI.Texture.fromImage("img/displacement_map.jpg");
	var displacementFilter = new PIXI.DisplacementFilter(displacementTexture);
	displacementFilter.scale.x = 50;
	displacementFilter.scale.y = 50;
	
	var bg = PIXI.Sprite.fromImage("img/displacement_BG.jpg");
	container.addChild(bg);
	
	var overlay = new PIXI.TilingSprite(PIXI.Texture.fromImage("img/zeldaWaves.png"), 630, 410);
	overlay.alpha = 0.1;
	
	renderer.stage.addChild(container);
	renderer.stage.filters = [displacementFilter];
	
	// start the ticker
	Physics.util.ticker.start();
	
	function loadActors() {
		// Example of a sprite
		var comet = Physics.body('circle', {
			x: 50, // x-coordinate
			y: 70, // y-coordinate
			vx: 0.2, // velocity in x-direction
			vy: 0.11, // velocity in y-direction,
			radius: 20
		});
		comet.view = renderer.createDisplay('sprite', {
			texture: 'img/comet.png',
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
		// Example of a movie clip
		var enemy = Physics.body('convex-polygon', {
			vertices: square,
			x: 50, // x-coordinate
			y: 100, // y-coordinate
			vx: 0.4, // velocity in x-direction
			vy: 0.01, // velocity in y-direction,
			mass: 1,
			restitution: 0.5,
			cof: 1
		});
		enemy.view = renderer.createDisplay('movieclip', {
			// Define the animations frames here
			frames: [
				'enemy-walk-1.png', 'enemy-walk-2.png',
				'enemy-walk-3.png', 'enemy-walk-4.png',
				'enemy-walk-5.png', 'enemy-walk-6.png',
				'enemy-walk-5.png', 'enemy-walk-4.png',
				'enemy-walk-3.png', 'enemy-walk-2.png'
			],
			anchor: {
				x: 0.5,
				y: 0.5
			}
		});
		enemy.view.animationSpeed = 0.2;
		enemy.view.gotoAndPlay(1);
		
		// Make a generic circle (no textures)
		var circle = Physics.body('circle', {
			x: 80, // x-coordinate
			y: 20, // y-coordinate
			vx: 0.3, // velocity in x-direction
			vy: 0.01, // velocity in y-direction,
			radius: 20
		});
		
		var pent = [
			{ x: 50, y: 0 },
			{ x: 25, y: -25 },
			{ x: -25, y: -25 },
			{ x: -50, y: 0 },
			{ x: 0, y: 50 }
		];
		// Make a generic polygon (no textures)
		var poly = Physics.body('convex-polygon', {
			vertices: pent,
			x: 50, // x-coordinate
			y: 40, // y-coordinate
			vx: 0.1, // velocity in x-direction
			vy: 0.01 // velocity in y-direction,
		});
		
		// add our components!
		world.add( comet );
		world.add( enemy );
		world.add( circle );
		world.add( poly );
		
		renderer.stage.addChild(overlay);
	}

});