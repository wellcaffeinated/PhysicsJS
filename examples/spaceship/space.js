Physics(function( world, Physics ){

    var renderer = Physics.renderer('canvas', {
        el: 'viewport',
        width: window.innerWidth,
        height: window.innerHeight,
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

        var Pi2 = 2 * Math.PI;
        // VERY crude approximation to a gaussian random number.. but fast
        var gauss = function gauss( mean, stddev ){
            var r = 2 * (Math.random() + Math.random() + Math.random()) - 3;
            return r * stddev + mean;
        };
        // will give a random polygon that, for small jitter, will likely be convex
        var rndPolygon = function rndPolygon( size, n, jitter ){

            var points = [{ x: 0, y: 0 }]
                ,ang = 0
                ,invN = 1 / n
                ,mean = Pi2 * invN
                ,stddev = jitter * (invN - 1/(n+1)) * Pi2
                ,i = 1
                ,last = points[ 0 ]
                ;

            while ( i < n ){
                ang += gauss( mean, stddev );
                points.push({
                    x: size * Math.cos( ang ) + last.x,
                    y: size * Math.sin( ang ) + last.y
                });
                last = points[ i++ ];
            }

            return points;
        };

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
                amount *= 0.00001;
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
            },
            shoot: function(){
                var angle = this.state.angular.pos;
                var cos = Math.cos( angle );
                var sin = Math.sin( angle );
                var r = this.geometry.radius + 5;
                var laser = Physics.body('circle', {
                    x: this.state.pos.get(0) + r * cos,
                    y: this.state.pos.get(1) + r * sin,
                    vx: (0.5 + this.state.vel.get(0)) * cos,
                    vy: (0.5 + this.state.vel.get(1)) * sin,
                    radius: 2
                });
                laser.gameType = 'laser';

                setTimeout(function(){
                    world.removeBody( laser );
                    laser = undefined;
                }, 600);
                world.add( laser );
            },
            blowUp: function(){
                var scratch = Physics.scratchpad();
                var rnd = scratch.vector();
                var pos = this.state.pos;
                var n = 40;
                var r = 2 * this.geometry.radius;
                var size = 8 * r / n;
                var mass = this.mass / n;
                var verts;
                var debris = [];
                
                // create particles
                while ( n-- ){
                    verts = rndPolygon( size, 3, 1.5 );
                    if ( Physics.geometry.isPolygonConvex( verts ) ){
                        rnd.set( Math.random() - 0.5, Math.random() - 0.5 ).mult( r );
                        debris.push( Physics.body('convex-polygon', {
                            x: pos.get(0) + rnd.get(0),
                            y: pos.get(1) + rnd.get(1),
                            vx: this.state.vel.get(0),
                            vy: this.state.vel.get(1),
                            angularVelocity: (Math.random()-0.5) * 0.06,
                            mass: mass,
                            vertices: verts,
                            restitution: 0.8
                        }));
                    }
                }

                world.add( debris );
                world.removeBody( this );
                scratch.done();
            },
        };
    }, {
        x: 400,
        y: 100,
        vx: 0.08,
        radius: 30
    });

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

    var playerBehavior = Physics.behavior('player', function( parent ){

        return {
            init: function( options ){
                var self = this;
                parent.init.call(this, options);
                var player = self.player = options.player;
                self.gameover = false;

                // events
                document.addEventListener('keydown', function( e ){
                    if (self.gameover){
                        return;
                    }
                    switch ( e.keyCode ){
                        case 38: // up
                            self.movePlayer();
                        break;
                        case 40: // down
                        break;
                        case 37: // left
                            player.turn( -1 );
                        break;
                        case 39: // right
                            player.turn( 1 );
                        break;
                        case 32: // space
                            player.shoot();
                        break;
                    }
                });
                document.addEventListener('keyup', function( e ){
                    if (self.gameover){
                        return;
                    }
                    switch ( e.keyCode ){
                        case 38: // up
                            self.movePlayer( false );
                        break;
                        case 40: // down
                        break;
                        case 37: // left
                            player.turn( 0 );
                        break;
                        case 39: // right
                            player.turn( 0 );
                        break;
                        case 32: // space
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
                    ,player = this.player
                    ;

                for ( var i = 0, l = collisions.length; i < l; ++i ){
                    col = collisions[ i ];

                    if ( col.bodyA.gameType !== 'debris' && col.bodyB.gameType !== 'debris' && (col.bodyA === player || col.bodyB === player) ){
                        player.blowUp();
                        world.removeBehavior( this );
                        this.gameover = true;
                        return;
                    }
                }
            },

            movePlayer: function( active ){

                if ( active === false ){
                    this.playerMove = false;
                    return;
                }
                this.playerMove = true;
            },

            behave: function( data ){

                this.player.thrust( this.playerMove ? 1 : 0 );
            }
        };
    }, { player: ship });
    
    Physics.body('asteroid', 'circle', function( parent ){
        var ast1 = new Image();
        ast1.src = './ast1.png';

        return {
            init: function( options ){
                parent.init.call(this, options);

                this.view = ast1;
            },
            blowUp: function(){
                var scratch = Physics.scratchpad();
                var rnd = scratch.vector();
                var pos = this.state.pos;
                var n = 40;
                var r = 2 * this.geometry.radius;
                var size = r / n;
                var mass = 0.001;
                var d;
                var debris = [];
                
                // create particles
                while ( n-- ){
                    rnd.set( Math.random() - 0.5, Math.random() - 0.5 ).mult( r );
                    d = Physics.body('circle', {
                        x: pos.get(0) + rnd.get(0),
                        y: pos.get(1) + rnd.get(1),
                        vx: this.state.vel.get(0) + (Math.random() - 0.5),
                        vy: this.state.vel.get(1) + (Math.random() - 0.5),
                        angularVelocity: (Math.random()-0.5) * 0.06,
                        mass: mass,
                        radius: size,
                        restitution: 0.8
                    });
                    d.gameType = 'debris';

                    debris.push( d );
                }

                setTimeout(function(){
                    for ( var i = 0, l = debris.length; i < l; ++i ){
                        world.removeBody( debris[ i ] );
                    }
                    debris = undefined;
                }, 1000);

                world.add( debris );
                world.removeBody( this );
                scratch.done();
            }
        };
    });

    for ( var i = 0, l = 80; i < l; ++i ){

        var ang = 4 * (Math.random() - 0.5) * Math.PI;
        var r = 700 + 100 * Math.random() + i * 10;

        world.add( Physics.body('asteroid', {
            x: 400 + Math.cos( ang ) * r,
            y: 300 + Math.sin( ang ) * r,
            vx: 0.035 * Math.sin( ang ),
            vy: - 0.035 * Math.cos( ang ),
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