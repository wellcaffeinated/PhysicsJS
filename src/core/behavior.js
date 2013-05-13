(function(){

    // Service
    Physics.behavior = Physics.behaviour = Decorator('behavior', {

        // lowest priority by default
        priority: 0,

        init: function(){
            
            this.options = {};
        },

        connect: function( world ){

            if (this.behave){
                world.subscribe('integrate:positions', this.behave, this, this.priority);
            }
        },
        disconnect: function( world ){

            if (this.behave){
                world.unsubscribe('integrate:positions', this.behave);
            }
        },

        behave: function( bodies, dt ){

            throw 'The behavior.behave() method must be overriden';
        }
    });

}());