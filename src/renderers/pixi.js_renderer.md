# Pixi.JS custom renderer

The PIXI.js custom renderer allows you to use Physics.JS and PIXI.js together. PIXI.js is a powerful rendering framework that has some great features.

## Required

In order to use the PIXI.js renderer with Physics.js, you need to load PIXI.js in your browser. You can get it [here](http://pixijs.com). Then just ensure you've included it in your DOM:

	<script src="js/pixi.dev.js"></script>

## Usage


### Creation

To use the PIXI renderer, simply call it when creating your renderer:

	var renderer = Physics.renderer('pixi', {
		el: 'viewport', // The DOM element to append the stage to
		width: viewWidth,
		height: viewHeight,
		meta: false // Turns debug info on/off
	});
	
	// add the renderer
	world.add( renderer );
	
	// render on each step
	world.subscribe('step', function(){
		world.render();
	});
	
This will create a new canvas and append it to the DOM element ID specified with the `el` variable. If no DOM element with that ID, the canvas will be appended to the body.

The last two statements add the renderer to the world, and cause rendering to occur on every step.

## Views

There are two ways to attach views to a physics object: default and creating a PIXI DisplayObject. The renderer can handle both of these for you.

It is important to remember that all views are just PIXI objects: you can manipulate them as you would normally with any PIXI object.

	var circle = Physics.body('circle', {
			x: 50, // x-coordinate
			y: 70, // y-coordinate
			vx: 0.2, // velocity in x-direction
			vy: 0.11, // velocity in y-direction,
			radius: 25
		});

	world.add( circle );
	
The above will cause the renderer to automatically create a PIXI.Graphics object that represents the circle:

![](https://www.evernote.com/shard/s229/sh/e12a5d72-95d7-4b0a-b34b-504a7b897077/6a967407aad864bb0eaab65fdd61286e/deep/0/bluerex.ca-projects-physicsjs-pixi-.png)

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

The above creates a physics body, then assigns a view to it. The `createDisplay` object is a helper function the renderer supplies you - it will create either a sprite or a movie clip for you to and add it to the PIXI stage.

![](https://www.evernote.com/shard/s229/sh/579c8d59-0079-4bd3-99cc-d6964edbbbf5/da72ef13e96225380a459782452833c6/deep/0/bluerex.ca-projects-physicsjs-pixi-.png)

#### `createDisplay()` options:

	{
		// Defines the texture to assign to a sprite
		texture: 'image.png', 
		
		// Sets the anchor for the PIXI display object
		anchor: {	
			x: 0.5,
			y: 0.5
		},
		
		// If set, the object will be added to the specified container instead of the stage
		container: someContainer, 
		
		// Defines the animation frames to assign to the movie clip
		frames: ['one.png', 'two.png', three.png']
		
	}
	
## Loading assets

To load assets (for use in movieclips, for example) you can use the renderers helper function, `loadAssets()`:

	// Load our spritesheet assets
	// Call loadActors() defined below when assets are loaded
	renderer.loadSpritesheets(['img/frog.json'], loadActors);
	
	function loadActors() {
		
		// Do things with the textures here, like create views
	}

`loadActors()` takes two arguments: an array of assets to load, and a callback function to call once loading is complete.

## Adding non Physics.JS things to the stage

You can add backgrounds, textures, and filters to the stage that don't need physics by simply calling the renderer stage:

	// Apply some cool pixi effects here!
	var displacementTexture = PIXI.Texture.fromImage("img/displacement_map.jpg");
	var displacementFilter = new PIXI.DisplacementFilter(displacementTexture);
	displacementFilter.scale.x = 50;
	displacementFilter.scale.y = 50;
	
	// Add a background to the stage
	var bg = PIXI.Sprite.fromImage("img/Rock-Bottom-1.png");
	
	// Add the above textures and filters to the stage
	renderer.stage.addChild(bg);
	renderer.stage.filters = [displacementFilter];
	
By having direct access to the stage, you'll be able to do anything you could normally do in PIXI, so go crazy!