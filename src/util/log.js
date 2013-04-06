(function(window){
    var log;

    if (window && window.console && window.console.log){
        log = function(){
            window.console.log.apply(window, arguments);
        };
    } else {
        log = function(){};
    }

    Physics.util.log = log;
}(this));