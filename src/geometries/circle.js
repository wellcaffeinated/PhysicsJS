(function(){

    var defaults = {

        radius: 1.0
    };

    // circle geometry
    Physics.geometry('circle', function( options, instance ){

        options = Physics.util.extend({}, defaults, options);

        this.radius = options.radius;

        return {
            
            getWidth: function(){
                
                return this.radius * 2;
            },

            getHeight: function(){
                return this.radius * 2;
            }
        };
    });

}());