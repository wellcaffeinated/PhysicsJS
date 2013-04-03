(function(){

    // Service
    Physics.integrator = Factory('integrator', {

        // prototype
        integrate: function(){
            
            throw 'The integrator.integrate() method must be overriden';
        }
    });

}());