Physics(function( world, Physics ){

    var renderer = Physics.renderer('canvas', {
        el: 'viewport',
        width: document.width,
        height: document.height,
        meta: true,
        // debug:true,
        styles: {
            'circle': {
                strokeStyle: 'hsla(60, 37%, 17%, 1)',
                lineWidth: 1,
                fillStyle: 'hsla(60, 37%, 57%, 0.8)',
                angleIndicator: 'hsla(60, 37%, 17%, 0.4)'
            },
            'convex-polygon' : {
                strokeStyle: 'hsla(60, 37%, 17%, 1)',
                lineWidth: 1,
                fillStyle: 'hsla(60, 47%, 37%, 0.8)',
                angleIndicator: 'hsla(0, 0%, 0%, 0)'
            }
        }
    });

    // bodies
    var ship = Physics.body('player', 'circle', function( parent ){

        var deg = Math.PI/180;
        var shipImg = new Image();
        var shipThrustImg = new Image();
        
        shipImg.src = './ship.png';
        shipThrustImg.src = './ship-thrust.png';

        return {
            init: function( options ){
                parent.init.call( this, options );

                this.view = shipImg;
            },
            turn: function( amount ){
                this.state.angular.vel = 0.2 * amount * deg;
            },
            thrust: function( amount ){
                var angle = this.state.angular.pos;
                var scratch = Physics.scratchpad();
                amount *= 0.0001;
                var v = scratch.vector().set(
                    amount * Math.cos( angle ), 
                    amount * Math.sin( angle ) 
                );
                this.accelerate( v );
                scratch.done();

                if ( amount ){
                    this.view = shipThrustImg;
                } else {
                    this.view = shipImg;
                }
            }
        };
    }, {
        x: 400,
        y: 100,
        vx: 0.08,
        radius: 30
    });

    var playerBehavior = Physics.behavior('player', function( parent ){
        return {
            init: function( options ){
                var self = this;
                parent.init.call(this, options);

                // events
                document.addEventListener('keydown', function( e ){
                    switch ( e.keyCode ){
                        case 38: // up
                            self.movePlayer();
                        break;
                        case 40: // down
                        break;
                        case 37: // left
                            ship.turn( -1 );
                        break;
                        case 39: // right
                            ship.turn( 1 );
                        break;
                    }
                });
                document.addEventListener('keyup', function( e ){
                    switch ( e.keyCode ){
                        case 38: // up
                            self.movePlayer( false );
                        break;
                        case 40: // down
                        break;
                        case 37: // left
                            ship.turn( 0 );
                        break;
                        case 39: // right
                            ship.turn( 0 );
                        break;
                    }
                });
            },

            movePlayer: function( active ){

                if ( active === false ){
                    this.playerMove = false;
                    return;
                }
                this.playerMove = true;
            },

            behave: function( data ){

                ship.thrust( this.playerMove ? 1 : 0 );
            }
        };
    }, {});
    

    var planet = Physics.body('circle', {
        // fixed: true,
        // hidden: true,
        mass: 10000,
        radius: 120,
        x: 400,
        y: 300
    });
    planet.view = new Image();
    planet.view.src = './planet.png';

    // init
    
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

    world.subscribe('step', function(){
        // follow player
        renderer.options.offset.clone({ x: 0.5 * renderer.options.width, y: 0.5 * renderer.options.height }).vsub( ship.state.pos );
        world.render();
    });

    // draw minimap
    world.subscribe('render', function( data ){
        var r = 100;
        var shim = 15;
        var x = renderer.options.width - r - shim;
        var y = r + shim;
        var scratch = Physics.scratchpad();
        var d = scratch.vector();

        renderer.drawCircle(x, y, r, { strokeStyle: '#090', fillStyle: '#010' });
        renderer.drawCircle(x, y, r * 2 / 3, { strokeStyle: '#090' });
        renderer.drawCircle(x, y, r / 3, { strokeStyle: '#090' });

        for (var i = 0, l = data.bodies.length, b = data.bodies[ i ]; b = data.bodies[ i ]; i++){

            d.clone( ship.state.pos ).vsub( b.state.pos ).mult( -0.05 );
            renderer.drawCircle(x + d.get(0), y + d.get(1), 1, '#dd0');
        }

        scratch.done();
    });

    // subscribe to ticker and start
    Physics.util.ticker.subscribe(function( time ){ world.step( time ); }).start();
});