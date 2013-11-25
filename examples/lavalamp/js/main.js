require({
    shim: {
        'datgui': {
            exports: 'dat'
        }
    },
    // use top level so we can access images
    baseUrl: './',
    packages: [{
        name: 'physicsjs',
        location: 'http://wellcaffeinated.net/PhysicsJS/assets/scripts/vendor/physicsjs-0.5.3/',
        main: 'physicsjs-0.5.3.min'
    }],
    paths: {
        'datgui': 'http://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.5/dat.gui.min'
    }
}, [
    'datgui',
    'physicsjs',
    'physicsjs/bodies/circle',
    'physicsjs/behaviors/newtonian',
    'physicsjs/behaviors/sweep-prune',
    'physicsjs/behaviors/body-collision-detection',
    'physicsjs/behaviors/edge-collision-detection',
    'physicsjs/behaviors/body-impulse-response',

    'js/radiation-behavior',
    'js/buoyancy-behavior',
    'js/metaball-renderer'

], function( dat, Physics ){

    var gui = new dat.GUI();
    
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
            ,integrator
            ;

        integrator = Physics.integrator('verlet', {
            drag: 0.02
        });

        world.add( integrator );
    
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
        
        for (var i = 0; i < 25; i++){
            var b = Physics.body('circle', {
                x: Math.random() * (width-10) + 10,
                y: (height-10) - Math.random() * 10,
                radius: 5,
                restitution: 0
            });
            
            b.temperature = 5 + 0.1 * (Math.random()-0.5);
            b.heatCapacity = 1;
            bubbles.push( b );
        }

        for (var i = 0; i < 25; i++){
            var b = Physics.body('circle', {
                x: Math.random() * (width-10) + 10,
                y: Math.random() * 10,
                radius: 5,
                restitution: 0
            });
            
            b.temperature = 5 + 0.1 * (Math.random()-0.5);
            b.heatCapacity = 1;
            bubbles.push( b );
        }
        
        var heatSource = Physics.body('circle', {
            x: 700,
            y: height + 100,
            radius: 100,
            fixed: true,
            hidden: true
        });
        
        heatSource.temperature = 8;
        heatSource.heatCapacity = 1e10;
        
        var buoyancy = Physics.behavior('buoyancy', { strength: 1e-3 });
        var newtonian = Physics.behavior('newtonian', {strength: 1e-3});

        // add things...
        world.add( bubbles );
        world.add([
            heatSource,
            renderer,
            edgeBounce,
            // gravity
            //Physics.behavior('constant-acceleration'),
            Physics.behavior('body-collision-detection'),
            Physics.behavior('sweep-prune'),
            Physics.behavior('body-impulse-response'),
            Physics.behavior('radiation'),
            newtonian,
            buoyancy
        ]);
    
        // subscribe to ticker to advance the simulation
        Physics.util.ticker.subscribe(function (time, dt) {
    
            world.step(time);
        });
     
        // start the ticker
        Physics.util.ticker.start();

        var f = gui.addFolder('Environment');
        f.open();
        f.add(integrator.options, 'drag', 0, 0.1);
        f.add(buoyancy, 'ambientT', 0, 30);
        
        f = gui.addFolder('Buyancy');
        f.open();
        f.add(buoyancy, 'strength', 0, 1e-2);
        
        f = gui.addFolder('Heat Source');
        f.open();
        f.add(heatSource, 'temperature', 0, 20);

        f = gui.addFolder('Blobs');
        f.open();
        var controller = f.add(bubbles[0], 'heatCapacity', 0, 5);
        controller.onChange(function(n) {
            for ( var i = 0, l = bubbles.length; i < l; ++i ){
                    
                bubbles[ i ].heatCapacity = n;
            }
        });
        f.add(newtonian, 'strength', 0, 0.01);
    });
});