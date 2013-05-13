/**
 * Rigid constraint manager
 */
Physics.behavior('rigid-constraint-manager', function( parent ){

    var defaults = {

        // set a default target length
        targetLength: 20
    };

    return {

        init: function( options ){

            parent.init.call(this);

            Physics.util.extend(this.options, defaults, options);

            this._constraints = [];
        },

        connect: function( world ){

            var intg = world.getIntegrator();

            if ( intg && intg.name.indexOf('verlet') < 0 ){

                throw 'The rigid constraint manager needs a world with a "verlet" compatible integrator.';
            }

            world.subscribe('integrate:positions', this.resolve, this);
        },

        disconnect: function( world ){

            world.unsubscribe('integrate:positions', this.resolve);
        },

        drop: function(){

            // drop the current constraints
            this._constraints = [];
            return this;
        },

        constrain: function( bodyA, bodyB, targetLength ){

            if (!bodyA || !bodyB){

                return this;
            }

            this._constraints.push({
                id: Physics.util.uniqueId('rigid-constraint'),
                bodyA: bodyA,
                bodyB: bodyB,
                targetLength: targetLength || this.options.targetLength
            });

            return this;
        },

        remove: function( indexCstrOrId ){

            var constraints = this._constraints
                ,isObj
                ;

            if (typeof indexCstrOrId !== 'string'){

                constraints.splice( indexCstrOrId, 1 );
                return this;   
            }

            isObj = Physics.util.isObject( indexCstrOrId );
            
            for ( var i = 0, l = constraints.length; i < l; ++i ){
                
                if ( (isObj && constraints[ i ] === indexCstrOrId) ||
                    ( !isObj && constraints[ i ].id === indexCstrOrId) ){

                    constraints.splice( i, 1 );
                    return this;
                }
            }

            return this;
        },

        resolve: function(){

            var constraints = this._constraints
                ,scratch = Physics.scratchpad()
                ,A = scratch.vector()
                ,BA = scratch.vector()
                ,con
                ,len
                ,corr
                ,proportion
                ;

            for ( var i = 0, l = constraints.length; i < l; ++i ){
            
                con = constraints[ i ];

                // move constrained bodies to target length based on their
                // mass proportions
                A.clone( con.bodyA.state.pos );
                BA.clone( con.bodyB.state.pos ).vsub( A );
                len = BA.norm();
                corr = ( len - con.targetLength ) / len;
                
                BA.mult( corr );
                proportion = con.bodyB.mass / (con.bodyA.mass + con.bodyB.mass);

                if ( !con.bodyA.fixed ){

                    BA.mult( proportion );
                    con.bodyA.state.pos.vadd( BA );
                    BA.mult( 1 / proportion );
                }

                if ( !con.bodyB.fixed ){

                    BA.mult( 1 - proportion );
                    con.bodyB.state.pos.vsub( BA );
                }
            }

            scratch.done();
        },

        getConstraints: function(){

            return [].concat(this._constraints);
        }
    };
});
