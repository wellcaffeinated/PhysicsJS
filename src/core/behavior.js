(function(){

    // Service
    Physics.behavior = Physics.behaviour = Decorator('behavior', {

        // lowest priority by default
        priority: 0,

        init: function(){
            //empty
        },

        behave: function( bodies, dt ){

            throw 'The behavior.behave() method must be overriden';
        }
    });

}());