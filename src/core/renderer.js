(function(){

    // Service
    Physics.renderer = Decorator('renderer', {

        init: function(){
            //empty
        },

        // prototype methods
        render: function( bodies, stats ){

            throw 'The renderer.render() method must be overriden';
        }
    });

}());