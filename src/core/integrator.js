(function(){

    // Service
    Physics.integrator = Decorator('integrator', {

        // prototype
        integrate: function(){

            throw 'The integrator.integrate() method must be overriden';
        }
    });

}());