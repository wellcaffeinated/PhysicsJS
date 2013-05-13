(function(){

    var defaults = {

        fixed: false,
        mass: 1.0,
        restitution: 1.0,
        cof: 0.8,
        moi: 0.0,
        view: null
    };

    // Service
    Physics.body = Decorator('body', {

        // prototype methods
        init: function( options ){

            var vector = Physics.vector;

            this.options = Physics.util.extend({}, defaults, options);

            // properties
            this.fixed = this.options.fixed;
            this.mass = this.options.mass;
            this.restitution = this.options.restitution;
            this.cof = this.options.cof;
            // moment of inertia
            this.moi = this.options.moi;

            // placeholder for renderers
            this.view = this.options.view;

            // physical properties
            this.state = {
                pos: vector( options.x, options.y ),
                vel: vector( options.vx, options.vy ),
                acc: vector(),
                angular: {
                    pos: options.angle || 0.0,
                    vel: options.angularVelocity || 0.0,
                    acc: 0.0
                },
                old: {
                    pos: vector(),
                    vel: vector(),
                    acc: vector(),
                    angular: {
                        pos: 0.0,
                        vel: 0.0,
                        acc: 0.0
                    }
                }
            };

            if (this.mass === 0){
                throw "Error: Bodies must have non-zero mass";
            }

            // shape
            this.geometry = Physics.geometry('point');
        },

        accelerate: function( acc ){

            this.state.acc.vadd( acc );
            return this;
        },

        // p relative to center of mass
        applyForce: function( force, p ){

            var scratch = Physics.scratchpad()
                ,r = scratch.vector()
                ,state
                ;
                
            // if no point at which to apply the force... apply at center of mass
            if ( !p ){
                
                this.accelerate( r.clone( force ).mult( 1/this.mass ) );

            } else if ( this.moi ) {

                // apply torques
                state = this.state;
                r.clone( p );
                // r cross F
                this.state.angular.acc -= r.cross( force ) / this.moi;
                // projection of force towards center of mass
                this.applyForce( force );

            }

            scratch.done();

            return this;
        },

        aabb: function(){

            var scratch = Physics.scratchpad()
                ,trans = scratch.transform()
                ,angle = this.state.angular.pos
                ,aabb = Physics.aabb(this.geometry.aabb( angle ))
                ;

            trans.setRotation( 0 ).setTranslation(this.state.pos);
            aabb.transform( trans );

            scratch.done();
            return aabb.get();
        },

        recalc: function(){
            // override to recalculate properties
        }
    });

}());