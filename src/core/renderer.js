(function(){

    // Service
    Physics.renderer = Decorator('renderer', {

        // prototype methods
        render: function( bodies, stats ){

            throw 'The renderer.render() method must be overriden';
        }
    });

}());