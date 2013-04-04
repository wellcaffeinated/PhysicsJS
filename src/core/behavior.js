(function(){

    // Service
    Physics.behavior = Physics.behaviour = Decorator('behavior', {

        init: function(){
            //empty
        },

        behave: function( bodies, dt ){

            throw 'The behavior.behave() method must be overriden';
        }
    });

}());