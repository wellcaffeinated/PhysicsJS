(function(){

    // Service
    Physics.integrator = Decorator('integrator', {

        init: function(){
            // empty
        },

        // prototype
        integrate: function(){

            throw 'The integrator.integrate() method must be overriden';
        }
    });

}());