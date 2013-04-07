// edge-bounce behavior
Physics.behavior('edge-bounce', function( parent ){

    var defaults = {

        bounds: null,
        callback: null
    };

    return {

        init: function( options ){

            // call parent init method
            parent.init.call(this, options);

            options = Physics.util.extend({}, defaults, options);

            this.bounds = options.bounds;
            this.callback = options.callback;
            this.pos = Physics.vector();
        },
        
        behave: function( bodies, dt ){

            var body
                ,pos
                ,state
                ,p = this.pos
                ,bounds = this.bounds
                ,callback = this.callback
                ,dim
                ,x
                ;

            if (!bounds) throw "Bounds not set";
            
            for ( var i = 0, l = bodies.length; i < l; ++i ){
                
                body = bodies[ i ];
                state = body.state;
                pos = body.state.pos;

                switch ( body.geometry.name ){

                    case 'circle':
                        dim = body.geometry.radius;
                        x = body.moi / body.mass;

                        // right
                        if ( (pos._[ 0 ] + dim) >= bounds.max._[ 0 ] ){

                            // adjust position
                            pos._[ 0 ] = bounds.max._[ 0 ] - dim;
                            // adjust velocity
                            state.vel._[ 0 ] = -state.vel._[ 0 ];

                            if (x){
                                // angular momentum transfer to perpendicular velocity
                                state.vel._[ 1 ] /= (1 + x);
                                state.vel._[ 1 ] -= dim * state.angular.vel * x / (1 + x);
                                state.angular.vel = -state.vel._[ 1 ] / dim;
                            }

                            p.set( bounds.max._[ 0 ], pos._[ 1 ] );
                            callback && callback( body, p );
                        }
                        
                        // left
                        if ( (pos._[ 0 ] - dim) <= bounds.min._[ 0 ] ){

                            // adjust position
                            pos._[ 0 ] = bounds.min._[ 0 ] + dim;
                            // adjust velocity
                            state.vel._[ 0 ] = -state.vel._[ 0 ];

                            if (x){
                                // angular momentum transfer to perpendicular velocity
                                state.vel._[ 1 ] /= (1 + x);
                                state.vel._[ 1 ] += dim * state.angular.vel * x / (1 + x);
                                state.angular.vel = state.vel._[ 1 ] / dim;
                            }

                            p.set( bounds.min._[ 0 ], pos._[ 1 ] );
                            callback && callback( body, p );
                        }

                        // bottom
                        if ( (pos._[ 1 ] + dim) >= bounds.max._[ 1 ] ){

                            // adjust position
                            pos._[ 1 ] = bounds.max._[ 1 ] - dim;
                            // adjust velocity
                            state.vel._[ 1 ] = -state.vel._[ 1 ];

                            if (x){
                                // angular momentum transfer to perpendicular velocity
                                state.vel._[ 0 ] /= (1 + x);
                                state.vel._[ 0 ] += dim * state.angular.vel * x / (1 + x);
                                state.angular.vel = state.vel._[ 0 ] / dim;
                            }

                            p.set( pos._[ 0 ], bounds.max._[ 1 ] );
                            callback && callback( body, p );
                        }
                            
                        // top
                        if ( (pos._[ 1 ] - dim) <= bounds.min._[ 1 ] ){

                            // adjust position
                            pos._[ 1 ] = bounds.min._[ 1 ] + dim;
                            // adjust velocity
                            state.vel._[ 1 ] = -state.vel._[ 1 ];

                            if (x){
                                // angular momentum transfer to perpendicular velocity
                                state.vel._[ 0 ] /= (1 + x);
                                state.vel._[ 0 ] -= dim * state.angular.vel * x / (1 + x);
                                state.angular.vel = -state.vel._[ 0 ] / dim;
                            }

                            p.set( pos._[ 0 ], bounds.min._[ 1 ] );
                            callback && callback( body, p );
                        }

                    break;
                }
            }
        }
    };
});
