(function(){

    var vector = Physics.vector;

    // Service
    Physics.body = Decorator('body', {

        // prototype methods
        init: function( options ){

            this.fixed = false;

            // placeholder for renderers
            this.view = null;

            // physical properties
            this.state = {
                pos: vector( options.x, options.y ),
                vel: vector( options.vx, options.vy ),
                acc: vector(),
                angular: {
                    pos: options.angle || 0,
                    vel: options.angularVelocity || 0,
                    acc: 0
                },
                old: {
                    pos: vector(),
                    vel: vector(),
                    acc: vector(),
                    angular: {
                        pos: 0,
                        vel: 0,
                        acc: 0
                    }
                }
            };

            // shape
            this.geometry = Physics.geometry('point');
        }
    });

}());