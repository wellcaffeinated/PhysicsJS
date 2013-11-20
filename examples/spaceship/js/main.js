require(
{
    // use top level so we can access images
    baseUrl: './',
    packages: [{
        name: 'physicsjs',
        location: '../../_working/physicsjs',
        main: 'physicsjs'
    }]
},
[
    'require',
    'physicsjs',

    // custom modules
    'js/player',
    'js/player-behavior',
    'js/asteroid',

    // official modules
    'physicsjs/renderers/canvas',
    'physicsjs/bodies/circle',
    'physicsjs/bodies/convex-polygon',
    'physicsjs/behaviors/newtonian',
    'physicsjs/behaviors/sweep-prune',
    'physicsjs/behaviors/body-collision-detection',
    'physicsjs/behaviors/body-impulse-response'
], function(
    require,
    Physics
){
    // display start game message
    document.body.className = 'before-game';
    var inGame = false;
    document.addEventListener('keydown', function( e ){

        // if user presses spacebar inbetween games, we'll load a new game
        if (!inGame && e.keyCode === 32){
            document.body.className = 'in-game';
            inGame = true;
            newGame();
        }
    });

    // set up the renderer and point it to the viewport
    var renderer = Physics.renderer('canvas', {
        el: 'viewport',
        width: window.innerWidth,
        height: window.innerHeight,
        // meta: true,
        // debug:true,
        styles: {
            'circle': {
                strokeStyle: 'hsla(0, 0%, 30%, 1)',
                lineWidth: 1,
                fillStyle: 'hsla(0, 0%, 30%, 1)',
                angleIndicator: false
            },
            'convex-polygon' : {
                strokeStyle: 'rgb(60, 0, 0)',
                lineWidth: 1,
                fillStyle: 'rgb(60, 16, 11)',
                angleIndicator: false
            }
        }
    });

    var init = function init( world, Physics ){

        // bodies
        var ship = Physics.body('player', {
            x: 400,
            y: 100,
            vx: 0.08,
            radius: 30
        });

        var playerBehavior = Physics.behavior('player-behavior', { player: ship });
        
        var asteroids = [];
        for ( var i = 0, l = 30; i < l; ++i ){

            var ang = 4 * (Math.random() - 0.5) * Math.PI;
            var r = 700 + 100 * Math.random() + i * 10;

            asteroids.push( Physics.body('asteroid', {
                x: 400 + Math.cos( ang ) * r,
                y: 300 + Math.sin( ang ) * r,
                vx: 0.03 * Math.sin( ang ),
                vy: - 0.03 * Math.cos( ang ),
                angularVelocity: (Math.random() - 0.5) * 0.001,
                radius: 50,
                mass: 30,
                restitution: 0.6
            }));
        }

        var planet = Physics.body('circle', {
            // fixed: true,
            // hidden: true,
            mass: 10000,
            radius: 120,
            x: 400,
            y: 300
        });
        planet.view = new Image();
        planet.view.src = require.toUrl('images/planet.png');

        // middle of canvas
        var middle = { 
            x: 0.5 * renderer.options.width, 
            y: 0.5 * renderer.options.height
        };
        // render on every step
        world.subscribe('step', function(){
            // follow player
            renderer.options.offset.clone( middle ).vsub( ship.state.pos );
            world.render();
        });

        // count number of asteroids destroyed
        var killCount = 0;
        world.subscribe('blow-up', function( data ){
            
            killCount++;
            if ( killCount === asteroids.length ){
                world.publish('win-game');
            }
        });

        // blow up anything that touches a laser pulse
        world.subscribe('collisions:detected', function( data ){
            var collisions = data.collisions
                ,col
                ;

            for ( var i = 0, l = collisions.length; i < l; ++i ){
                col = collisions[ i ];

                if ( col.bodyA.gameType === 'laser' || col.bodyB.gameType === 'laser' ){
                    if ( col.bodyA.blowUp ){
                        col.bodyA.blowUp();
                        world.removeBody( col.bodyB );
                    } else if ( col.bodyB.blowUp ){
                        col.bodyB.blowUp();
                        world.removeBody( col.bodyA );
                    }
                    return;
                }
            }
        });

        // draw minimap
        world.subscribe('render', function( data ){
            var r = 100;
            var shim = 15;
            var x = renderer.options.width - r - shim;
            var y = r + shim;
            var scratch = Physics.scratchpad();
            var d = scratch.vector();
            var lightness;

            renderer.drawCircle(x, y, r, { strokeStyle: '#090', fillStyle: '#010' });
            renderer.drawCircle(x, y, r * 2 / 3, { strokeStyle: '#090' });
            renderer.drawCircle(x, y, r / 3, { strokeStyle: '#090' });

            for (var i = 0, l = data.bodies.length, b = data.bodies[ i ]; b = data.bodies[ i ]; i++){

                d.clone( ship.state.pos ).vsub( b.state.pos ).mult( -0.05 );
                lightness = Math.max(Math.min(Math.sqrt(b.mass*10)|0, 100), 10);
                if (d.norm() < r){
                    renderer.drawCircle(x + d.get(0), y + d.get(1), 1, 'hsl(60, 100%, '+lightness+'%)');
                }
            }

            scratch.done();
        });

        // add things to the world
        world.add([
            ship,
            playerBehavior,
            planet,
            Physics.behavior('newtonian', { strength: 1e-4 }),
            Physics.behavior('sweep-prune'),
            Physics.behavior('body-collision-detection'),
            Physics.behavior('body-impulse-response'),
            renderer
        ]);
        world.add( asteroids );
    };

    var world = null;
    var newGame = function newGame(){

        if (world){
            world.destroy();
        }

        world = Physics( init );
        world.subscribe('lose-game', function(){
            document.body.className = 'lose-game';
            inGame = false;
        });
        world.subscribe('win-game', function(){
            world.pause();
            document.body.className = 'win-game';
            inGame = false;
        });
    };

    // subscribe to ticker and start looping
    Physics.util.ticker.subscribe(function( time ){
        if (world){
            world.step( time ); 
        }
    }).start();
});