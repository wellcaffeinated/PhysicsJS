/**
 * Facilitates creation of factory functions for instances
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
        ,constructor = function(){}
        ;

    // TODO: not sure of the best way to make the constructor names
    // transparent and readable in debug consoles...
    constructor.prototype = proto || {};
    constructor.prototype.type = type;
    
    return function test( name, decorator ){

        var instance
            ,result
            ,typeOfdecorator = typeof decorator
            ;

        if ( typeOfdecorator === 'function' ){

            // store the decorator function in the registry
            registry[ name ] = decorator;

        } else {

            // create a new instance from the provided decorator
            result = registry[ name ];
            if (!result){

                throw 'The ' + type + ' "' + name + '" has not been defined';
            }

            instance = new constructor();
            result = new result( decorator, instance );
            return Physics.util.extend( instance, result );
        }
    };
};