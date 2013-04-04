(function(){

    var defaults = {

        
    };

    // circle body
    Physics.body('circle', function( options, instance ){

        options = Physics.util.extend({}, defaults, options);

        this.geometry = Physics.geometry('circle', {
            radius: options.radius
        });

        
    });

}());