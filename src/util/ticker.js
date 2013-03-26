(function(window, exp){
        
var lastTime = 0
    ,active = false
    ,listeners = []
    ;

function step( time ){

    var fns = listeners;

    if (!active){
        return;
    }

    window.requestAnimationFrame( step );
    
    for ( var i = 0, l = fns.length; i < l; ++i ){
        
        fns[ i ]( time, time - lastTime );
    }

    lastTime = time;
}

function start(){
    
    lastTime = (new Date()).getTime();
    active = true;
    step();
}

function stop(){

    active = false;
}

function subscribe( listener ){

    function cb( l ){

        if ( l === listener )
            return false;
    }

    // if function and not already in listeners...
    if ( typeof listener === 'function' && each( listeners, cb ) ){

        // add it
        listeners.push( listener );
    }
}

function unsubscribe( listener ){

    var fns = listeners;

    for ( var i = 0, l = fns.length; i < l; ++i ){
        
        if ( fns[ i ] === listener ){

            // remove it
            fns.splice( i, 1 );
            return;
        }
    }
}

function isActive(){

    return !!active;
}

// API
exp.ticker = {
    start: start,
    stop: stop,
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    isActive: isActive
};

}(this, Physics.util));