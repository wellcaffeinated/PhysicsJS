define(
    [
        'physicsjs'
    ],
    function(
        Physics
    ){

        Physics.behavior('radiation', function( parent ){
            
            return {
                init: function( cfg ){
                    parent.init.call(this, cfg);
                    this.sigma = cfg.sigma || 1e-11;
                },
                getEmissivePowers: function( bodies ){
                    var emms = []
                        ,body
                        ,T
                        ,r
                        ;
                    
                    for ( var i = 0, l = bodies.length; i < l; i++ ){
                        body = bodies[ i ];
                        body.powerExchange = 0;
                        T = body.temperature || 0;
                        r = body.geometry.radius;
                        emms.push(T * T * T * T * this.sigma * 2 * Math.PI * r);// stefan-boltzman law
                    }
                    
                    return emms;
                },
                // sweep through a full circular angle around "body"
                // and get the beginning and end angles of the other bodies
                // while storing other useful info
                getEndpoints: function( body, bodies ){

                    var ends = []
                        ,other
                        ,scratch = Physics.scratchpad()
                        ,T = scratch.transform()
                        ,pos = scratch.vector()
                        ,pt = scratch.vector()
                        ,end
                        ;
                    
                    for ( var i = 0, l = bodies.length; i < l; i++ ){
                        other = bodies[ i ];
                        if (body !== other){
                            end = { body: other, bodyIdx: i, type: 0 };
                            T.setRotation( other.state.angular.pos ).setTranslation( other.state.pos );
                            pos.clone( other.state.pos ).vsub( body.state.pos );
                            end.distance = pos.norm();
                            
                            pos.perp( true ).rotate( T );
                            other.geometry.getFarthestHullPoint( pos, pt );
                            pt.transformInv( T );
                            end.angle = pt.angle();
                            ends.push( end );
                            
                            end = { body: other, bodyIdx: i, distance: end.distance, type: 1 };
                            other.geometry.getFarthestHullPoint( pos.negate(), pt );
                            pt.transformInv( T );
                            end.angle = pt.angle();
                            ends.push( end );
                        }
                    }
                    scratch.done();
                    // sort by angle
                    ends.sort(function( a, b ){
                        return (a.angle - b.angle);
                    });
                    return ends;
                },
                // calculates the amount of power this body radiates to the
                // rest of the bodies and cumulates that power into .powerExchange
                radiate: function( body, bodies, emm ){
                    var ends = this.getEndpoints( body, bodies )
                        ,end
                        ,start
                        ,invPi2 = 1 / ( Math.PI * 2 )
                        ,len = ends.length
                        ;
                    
                    // ensures that shadows cast by other bodies
                    // block the power that would have been radiated
                    for ( var i = 0, l = ends.length; i < l; i++ ){
                        end = ends[ i % len ];
                        if ( !start && end.type === 1 ){
                            l++;
                        } else if ( (!start || start.type === 1) && end.type === 0){
                            start = end;
                        } else if ( start.type === 1 && end.type === 1 ){
                            bodies[ end.bodyIdx ].powerExchange += emm * (end.angle - start.angle) * invPi2;
                            start = end;
                        } else if ( end.type === 0 && start.distance > end.distance ){
                            bodies[ start.bodyIdx ].powerExchange += emm * (end.angle - start.angle) * invPi2;
                            start = end;
                        } else if ( end.type === 1 && end.distance === start.distance ){
                            bodies[ start.bodyIdx ].powerExchange += emm * (end.angle - start.angle) * invPi2;
                            start = end;
                        }
                    }
                },
                behave: function( data ){
                    var bodies = data.bodies
                        ,dt = data.dt
                        ,body
                        ,emms
                        ,emm
                        ,prop
                        ,i
                        ,l
                        ;
                    
                    // cache all of the emissive powers of the bodies
                    emms = this.getEmissivePowers( bodies );
                    
                    for ( i = 0, l = bodies.length; i < l; i++ ){
                        body = bodies[ i ];
                        this.radiate( body, bodies, emms[ i ] );
                    }
                    
                    for ( i = 0, l = bodies.length; i < l; i++ ){
                        body = bodies[ i ];
                        body.temperature += (body.powerExchange - emms[ i ]) * dt / (body.mass * (body.heatCapacity || 1));
                        body.powerExchange = 0;
                    }               
                }
            };
        });
    }
);