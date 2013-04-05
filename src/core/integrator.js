(function(){

    var defaults = {

        // 1 means vacuum
        // 0.001 means molasses
        drag: 0.9995
    };

    // Service
    Physics.integrator = Decorator('integrator', {

        init: function( options ){
            
            this.options = Physics.util.extend({}, defaults, options);
        },

        // prototype
        integrate: function( bodies, dt ){

            throw 'The integrator.integrate() method must be overriden';
        }
    });

}());