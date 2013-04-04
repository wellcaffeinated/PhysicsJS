(function(){

    // Service
    Physics.integrator = Decorator('integrator', {

        init: function(){
            // empty
        },

        // prototype
        integrate: function( bodies, dt ){

            throw 'The integrator.integrate() method must be overriden';
        }
    });

}());