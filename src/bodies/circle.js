// circle body
Physics.body('circle', function( parent ){

    var defaults = {
        
    };

    return {
        init: function( options ){

            // call parent init method
            parent.init.call(this, options);

            options = Physics.util.extend({}, defaults, options);

            this.geometry = Physics.geometry('circle', {
                radius: options.radius
            });

        }
    }
});
