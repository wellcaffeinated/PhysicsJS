/*!
 * Fast indexOf
 * @param  {Array} arr   The array to search
 * @param  {Mixed} value The value to find
 * @return {Number}       The index OR -1
 */
Physics.util.indexOf = function indexOf(arr, value) {
    var fr = 0, bk = arr.length;
    while (fr < bk) {
        bk--;
        if (arr[ fr ] === value) {
            return fr;
        }
        if (arr[ bk ] === value) {
            return bk;
        }
        fr++;
    }
    return -1;
};

/**
 * Options helper to keep track of options
 * @param  {Object} def Default options to set
 * @param  {Object} target   (optional) Where to copy the options to. Defaults to the returned function.
 * @return {function}        The options function
 */
Physics.util.options = function( def, target, callback ){

    var _def = Physics.util.extend( {}, def )
        ,fn
        ,callbacks = []
        ;

    // set options
    fn = function fn( options ){

        Physics.util.extend(target, _def, options);
        for ( var i = 0, l = callbacks.length; i < l; ++i ){
            callbacks[ i ]( target );
        }
        return target;
    };

    // add defaults
    fn.defaults = function defaults( def ){
        return Physics.util.extend( _def, def );
    };

    fn.onChange = function( cb ){
        callbacks.push( cb );
    };

    target = target || fn;

    return fn;
};

