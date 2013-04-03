(function(window){
        
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

    return this;
}

function stop(){

    active = false;
    return this;
}

function subscribe( listener ){

    // if function and not already in listeners...
    if ( typeof listener === 'function' ){

        for ( var i = 0, l = listeners.length; i < l; ++i ){
            
            if (listener === listeners[ i ]){
                return this;
            }
        }

        // add it
        listeners.push( listener );
    }
    
    return this;
}

function unsubscribe( listener ){

    var fns = listeners;

    for ( var i = 0, l = fns.length; i < l; ++i ){
        
        if ( fns[ i ] === listener ){

            // remove it
            fns.splice( i, 1 );
            return this;
        }
    }

    return this;
}

function isActive(){

    return !!active;
}

// API
Physics.util.ticker = {
    start: start,
    stop: stop,
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    isActive: isActive
};

}(this));