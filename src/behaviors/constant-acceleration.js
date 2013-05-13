Physics.behavior('constant-acceleration', function( parent ){

    var defaults = {

        acc: { x : 0, y: 0.0004 }
    };

    return {

        init: function( options ){

            parent.init.call(this, options);

            this.options = Physics.util.extend(this.options, defaults, options);
            this._acc = Physics.vector();
            this.setAcceleration( this.options.acc );
        },

        setAcceleration: function( acc ){

            this._acc.clone( acc );
            return this;
        },

        behave: function( data ){

            var bodies = data.bodies;

            for ( var i = 0, l = bodies.length; i < l; ++i ){
                
                bodies[ i ].accelerate( this._acc );
            }
        }
    };
});