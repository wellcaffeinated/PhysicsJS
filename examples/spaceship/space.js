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
                strokeStyle: 'rgb(0, 0, 0)',
                lineWidth: 1,
                fillStyle: 'rgb(88, 16, 11)',
                angleIndicator: false
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

            connect: function( world ){
                world.subscribe('collisions:detected', this.checkPlayerCollision, this);
                world.subscribe('integrate:positions', this.behave, this);
            },

            disconnect: function( world ){
                world.unsubscribe('collisions:detected', this.checkPlayerCollision);
                world.unsubscribe('integrate:positions', this.behave);
            },

            checkPlayerCollision: function( data ){
                var collisions = data.collisions
                    ,col
                    ;

                for ( var i = 0, l = collisions.length; i < l; ++i ){
                    col = collisions[ i ];

                    if ( col.bodyA === ship || col.bodyB === ship ){
                        this.destroyPlayer();
                        return;
                    }
                }
            },

            destroyPlayer: function(){
                var scratch = Physics.scratchpad();
                var rnd = scratch.vector();
                var pos = ship.state.pos;
                var n = 40;
                var r = 2 * ship.geometry.radius;
                var size = 4 * r / n;
                var mass = ship.mass / n;
                var verts = [
                    { x: 0, y: 0 },
                    { x: 0, y: size },
                    { x: size, y: size },
                    { x: size, y: 0 }
                ];

                // create particles
                while ( n-- ){
                    rnd.set( Math.random() - 0.5, Math.random() - 0.5 ).mult( r );
                    world.add( Physics.body('convex-polygon', {
                        x: pos.get(0) + rnd.get(0),
                        y: pos.get(1) + rnd.get(1),
                        vx: ship.state.vel.get(0),
                        vy: ship.state.vel.get(1),
                        angularVelocity: (Math.random()-0.5) * 0.06,
                        mass: mass,
                        vertices: verts,
                        restitution: 0.8
                    }));
                }

                world.removeBody( ship );
                scratch.done();
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
    
    Physics.body('asteroid', 'circle', function( parent ){
        var ast1 = new Image();
        ast1.src = './ast1.png';

        return {
            init: function( options ){
                parent.init.call(this, options);

                this.view = ast1;
            }
        };
    });

    for ( var i = 0, l = 40; i < l; ++i ){

        var ang = 4 * (Math.random() - 0.5) * Math.PI;
        var r = 700 + 100 * Math.random() + i * 10;

        world.add( Physics.body('asteroid', {
            x: 400 + Math.cos( ang ) * r,
            y: 300 + Math.sin( ang ) * r,
            vx: 0.035 * Math.sin( ang ),
            vy: - 0.035 * Math.cos( ang ),
            angularVelocity: (Math.random() - 0.5) * 0.001,
            radius: 50,
            mass: 50,
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

    // subscribe to ticker and start
    Physics.util.ticker.subscribe(function( time ){ world.step( time ); }).start();
});