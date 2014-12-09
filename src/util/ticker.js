/**
 * class Physics.util.ticker
 *
 * The Ticker _singleton_ for easily binding callbacks to animation loops (requestAnimationFrame).
 *
 * Requires window.requestAnimationFrame... so polyfill it if you need to.
 **/
(function(window){

    var active = true
        ,ps = Physics.util.pubsub()
        ,perf = window.performance
        ;

    function now(){
        // http://updates.html5rocks.com/2012/05/requestAnimationFrame-API-now-with-sub-millisecond-precision
        return (perf && perf.now) ?
            (perf.now() + perf.timing.navigationStart) :
            Date.now();
    }

    /*
     * step( time )
     * - time (Number): The current time
     *
     * Publish a tick to subscribed callbacks
     */
    function step(){

        var time;

        window.requestAnimationFrame( step );

        if (!active){
            return;
        }

        time = now();

        if (!time){
            return;
        }

        ps.emit( 'tick', time );
    }

    // start stepping if we can
    if ( window.requestAnimationFrame ){
        step();
    } else {
        active = false;
    }

    /**
     * Physics.util.ticker.start() -> this
     *
     * Start the ticker
     **/
    function start(){

        active = true;
        return this;
    }

    /**
     * Physics.util.ticker.stop() -> this
     *
     * Stop the ticker
     **/
    function stop(){

        active = false;
        return this;
    }

    /**
     * Physics.util.ticker.on( listener( time ) ) -> this
     * - listener (Function): The callback function
     * - time (Number): The current timestamp
     *
     * Subscribe a callback to the ticker.
     **/
    function on( listener ){

        ps.on('tick', listener);
        return this;
    }

    /**
     * Physics.util.ticker.off( listener ) -> this
     * - listener (Function): The callback function previously bound
     *
     * Unsubscribe a callback from the ticker.
     **/
    function off( listener ){

        ps.off('tick', listener);
        return this;
    }

    /**
     * Physics.util.ticker.isActive() -> Boolean
     * + (Boolean): `true` if running, `false` otherwise.
     *
     * Determine if ticker is currently running.
     **/
    function isActive(){

        return !!active;
    }

    // API
    Physics.util.ticker = {
        now: now,
        start: start,
        stop: stop,
        on: on,
        off: off,
        isActive: isActive
    };

}(this));
