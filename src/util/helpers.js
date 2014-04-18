/**
 * Physics.util.indexOf( arr, value ) -> Number
 * - arr (Array): The array to search
 * - value (Mixed): The value to find
 * + (Number): The index of `value` in the array OR `-1` if not found
 *
 * Fast indexOf implementation.
 **/
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
 * Physics.util.options( def[, target] ) -> Function
 * - def (Object): Default options to set
 * - target (Object): Where to copy the options to. Defaults to the returned function.
 * + (Function): The options function
 *
 * Options helper to keep track of options. Call it with a config object. Access options directly on the function.
 *
 * Example:
 *
 * ```javascript
 * this.options = Physics.util.options({ foo: 'bar', opt: 'def' });
 * this.options({ opt: 'myVal' });
 *
 * this.options.foo; // === 'bar'
 * this.options.def; // === 'myVal'
 *
 * // can also change defaults later
 * this.options.defaults({ foo: 'baz' });
 *
 * // can add a change callback
 * this.options.onChange(function( opts ){
 *     // some option changed
 *     // opts is the target
 * });
 * ```
 **/
Physics.util.options = function( def, target ){

    var _def = {}
        ,fn
        ,callbacks = []
        ;

    // set options
    fn = function fn( options ){

        Physics.util.extend(target, options, null);
        for ( var i = 0, l = callbacks.length; i < l; ++i ){
            callbacks[ i ]( target );
        }
        return target;
    };

    // add defaults
    fn.defaults = function defaults( def ){
        Physics.util.extend( _def, def );
        Physics.util.defaults( target, _def );
        return _def;
    };

    fn.onChange = function( cb ){
        callbacks.push( cb );
    };

    target = target || fn;

    fn.defaults( def );

    return fn;
};

/**
 * Physics.util.pairHash( id1, id2 ) -> Number
 * - id1 (Number): The id of the first thing
 * - id2 (Number): The id of the second thing
 * + (Number): A unique numeric hash (valid for values < 2^16)
 *
 * Generate a unique numeric hash from two input IDs.
 *
 * Useful for speedy indexing of pairs.
 **/
Physics.util.pairHash = function( id1, id2 ){
    id1 = id1|0;
    id2 = id2|0;

    if ( (id1|0) === (id2|0) ){

        return -1;
    }

    // valid for values < 2^16
    return ((id1|0) > (id2|0) ?
        (id1 << 16) | (id2 & 0xFFFF) :
        (id2 << 16) | (id1 & 0xFFFF))|0
        ;
};
