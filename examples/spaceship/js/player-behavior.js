define(
    [
        'physicsjs'
    ],
    function(
        Physics
    ){

        Physics.behavior('player-behavior', function( parent ){

            return {
                init: function( options ){
                    var self = this;
                    parent.init.call(this, options);
                    // the player will be passed in via the config options
                    // so we need to store the player
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
                        return false;
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
                        return false;
                    });
                },

                // this is automatically called by the world
                // when this behavior is added to the world
                connect: function( world ){

                    // we want to subscribe to world events
                    world.subscribe('collisions:detected', this.checkPlayerCollision, this);
                    world.subscribe('integrate:positions', this.behave, this);
                },

                // this is automatically called by the world
                // when this behavior is removed from the world
                disconnect: function( world ){

                    // we want to unsubscribe from world events
                    world.unsubscribe('collisions:detected', this.checkPlayerCollision);
                    world.unsubscribe('integrate:positions', this.behave);
                },

                // check to see if the player has collided
                checkPlayerCollision: function( data ){
                    
                    var self = this
                        ,world = self._world
                        ,collisions = data.collisions
                        ,col
                        ,player = this.player
                        ;

                    for ( var i = 0, l = collisions.length; i < l; ++i ){
                        col = collisions[ i ];

                        // if we aren't looking at debris
                        // and one of these bodies is the player...
                        if ( col.bodyA.gameType !== 'debris' && 
                            col.bodyB.gameType !== 'debris' && 
                            (col.bodyA === player || col.bodyB === player) 
                        ){
                            player.blowUp();
                            world.removeBehavior( this );
                            this.gameover = true;

                            // when we crash, we'll publish an event to the world
                            // that we can listen for to prompt to restart the game
                            world.publish('lose-game');
                            return;
                        }
                    }
                },

                // toggle player motion
                movePlayer: function( active ){

                    if ( active === false ){
                        this.playerMove = false;
                        return;
                    }
                    this.playerMove = true;
                },

                behave: function( data ){

                    // activate thrusters if playerMove is true
                    this.player.thrust( this.playerMove ? 1 : 0 );
                }
            };
        });
    }
);