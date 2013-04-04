/**
 * Facilitates creation of decorator service functions
 *
 * @example
 * 
 * var service = Decorator('service', {
 *      // prototype methods...
 *      method: function( args ){
 *      }
 * });
 *
 * // define
 * service( 'name', function decorator(){
 *
 *      // extend further...
 *      return {
 *          // overrides
 *      };
 * });
 * // instantiate
 * var instance = service( 'name', options );
 */
var Decorator = function Decorator( type, proto ){

    var registry = {}
        ,constructor = function( opts ){
            if (this.init){
                this.init( opts );
            }
        }
        ;

    // TODO: not sure of the best way to make the constructor names
    // transparent and readable in debug consoles...
    constructor.prototype = proto || {};
    constructor.prototype.type = type;
    
    return function factory( name, decorator, cfg ){

        var instance
            ,result
            ,typeOfdecorator = typeof decorator
            ;

        if ( typeOfdecorator === 'function' ){

            // store the decorator function in the registry
            result = registry[ name ] = decorator;

        } else {

            cfg = decorator || {};
            result = registry[ name ];
            if (!result){

                throw 'Error: "' + name + '" ' + type + ' not defined';
            }
        }

        if ( cfg ) {

            // create a new instance from the provided decorator
            instance = new constructor( cfg );
            instance.name = name;
            result = result.call( instance, cfg, instance );
            return Physics.util.extend( instance, result );
        }
    };
};