/*
 * scratchpad
 * thread-safe management of temporary (voletile)
 * objects for use in calculations
 * https://github.com/wellcaffeinated/scratchpad.js
 */
Physics.scratchpad = (function(){

    // Errors
    var SCRATCH_USAGE_ERROR = 'Error: Scratchpad used after .done() called. (Could it be unintentionally scoped?)';
    var SCRATCH_INDEX_OUT_OF_BOUNDS = 'Error: Scratchpad usage space out of bounds. (Did you forget to call .done()?)';
    var SCRATCH_MAX_REACHED = 'Error: Too many scratchpads created. (Did you forget to call .done()?)';
    var ALREADY_DEFINED_ERROR = 'Error: Object is already registered.';

    // cache previously created scratches
    var scratches = [];
    var numScratches = 0;
    var Scratch, Scratchpad;
    
    var regIndex = 0;


    /** section: Classes
     * class Scratch
     *
     * A scratchpad session.
     * 
     * This class keeps track of temporary objects used
     * in this session and releases them when finished (call to `.done()`).
     *
     * Use this to retrieve temporary objects:
     * - `.vector()`: retrieve a temporary [[Physics.vector]]
     * - `.transform()`: retrieve a temporary [[Physics.transform]]
     *
     * See [[Physics.scratchpad]] for more info.
     **/
    Scratch = function Scratch(){

        // private variables
        this._active = false;
        this._indexArr = [];
        
        if (++numScratches >= Scratchpad.maxScratches){
            throw SCRATCH_MAX_REACHED;
        }
    };

    Scratch.prototype = {

        /**
         * Scratch#done( [val] ) -> Mixed
         * - val (Mixed): No effect on this method, just passed on to the return value so you can do things like:
         return scratch.done( myReturnVal );
         * + (Mixed): Whatever you specified as `val`
         * 
         * Declare that your work is finished.
         * 
         * Release temp objects for use elsewhere. Must be called when immediate work is done.
         **/
        done: function( val ){

            this._active = false;
            this._indexArr = [];
            // add it back to the scratch stack for future use
            scratches.push( this );
            return val;
        }
    };


    // API

    /**
     * Physics.scratchpad( [fn] ) -> Scratch|Function
     * - fn (Function): Some function you'd like to wrap in a scratch session. First argument is the scratch instance.
     * + (Function): The wrapped function (if `fn` arg specified) that can be reused like the original minus the first (scratch) parameter.
     * + (Scratch): The scratch session.
     * 
     * Get a new scratch session to work from or wrap a function in a scratch session.
     * 
     * Call `.done()` on it when finished.
     *
     * Example:
     * 
     * ```javascript
     * // get a scratch session manually
     * var myAlg = function( scratch, arg1, arg2, ... ){
     *     var scratch = Physics.scratchpad()
     *     ,vec = scratch.vector().set( 0, 0 ) // need to reinitialize... it's recycled!
     *     ;
     *     // ...
     *     return scratch.done( result );
     * };
     * // later...
     * while( awesome ){
     *     myAlg( arg1, arg2, ... );
     * }
     * ```
     *
     * Example:
     * 
     * ```javascript
     * // wrap a function in a scratch session
     * var myAlg = Physics.scratchpad(function( scratch, arg1, arg2, ... ){
     *     var vec = scratch.vector().set( 0, 0 ); // need to reinitialize... it's recycled!
     *     //...
     *     return result;
     * });
     * // later...
     * while( awesome ){
     *     myAlg( arg1, arg2, ... );
     * }
     * ```
     **/
    Scratchpad = function Scratchpad( fn ){

        if ( fn ){
            return Scratchpad.fn( fn );
        }

        var scratch = scratches.pop() || new Scratch();
        scratch._active = true;
        return scratch;
    };

    // options
    Scratchpad.maxScratches = 100; // maximum number of scratches
    Scratchpad.maxIndex = 20; // maximum number of any type of temp objects

    /**
     * Physics.scratchpad.fn( fn ) -> Function
     * - fn (Function): Some function you'd like to wrap in a scratch session. First argument is the scratch instance. See [[Physics.scratchpad]].
     * + (Function): The wrapped function that can be reused like the original minus the first (scratch) parameter.
     * 
     * Wrap a function in a scratch session.
     *
     * Same as calling `Physics.scratchpad( fn )` with a function specified.
     **/
    Scratchpad.fn = function( fn ){
        
        var args = [];
        for ( var i = 0, l = fn.length; i < l; i++ ){
            args.push( i );
        }

        args = 'a' + args.join(',a');
        var handle = new Function('fn, scratches, Scratch', 'return function('+args+'){ '+
               'var scratch = scratches.pop() || new Scratch( scratches );'+
               'scratch._active = true;'+
               'return scratch.done( fn(scratch, '+args+') );'+
           '};'
        );

        return handle(fn, scratches, Scratch);
    };

    /**
     * Physics.scratchpad.register( name, constructor )
     * - name (String): Name of the object class
     * - constructor (Function): The object constructor
     * 
     * Register a new object to be included in scratchpads.
     *
     * Example:
     *
     * ```javascript
     * // register a hypothetical vector class...
     * Physics.scratchpad.register('vector', Vector);
     * ```
     **/
    Scratchpad.register = function register( name, constructor, options ){

        var proto = Scratch.prototype
            ,idx = regIndex++
            ,stackname = '_' + name + 'Stack'
            ;

        if ( name in proto ) {
            throw ALREADY_DEFINED_ERROR;
        }

        proto[ name ] = function(){

            var stack = this[ stackname ] || ( this[ stackname ] = [])
                ,stackIndex = (this._indexArr[ idx ] | 0) + 1
                ,instance
                ;

            this._indexArr[ idx ] = stackIndex;

            // if used after calling done...
            if (!this._active){
                throw SCRATCH_USAGE_ERROR;
            }

            // if too many objects created...
            if (stackIndex >= Scratchpad.maxIndex){
                throw SCRATCH_INDEX_OUT_OF_BOUNDS;
            }

            // return or create new instance
            instance = stack[ stackIndex ];

            if ( !instance ){
                stack.push( instance = new constructor() );
            }

            return instance;
        };

    };

    // register some classes
    Scratchpad.register('vector', Physics.vector);
    Scratchpad.register('transform', Physics.transform);

    return Scratchpad;

})();