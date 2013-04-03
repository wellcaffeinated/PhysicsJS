/**
 * Facilitates creation of factory functions for instances
 *
 * @example
 * 
 * var service = Factory('service', {
 *      // prototype methods...
 *      method: function( args ){
 *      }
 * });
 *
 * // define
 * service( 'name', function factory(){
 *
 *      // extend further...
 *      return {
 *          // overrides
 *      };
 * });
 * // instantiate
 * var instance = service( 'name', options );
 */
var Factory = function Factory( type, proto ){

    var registry = {}
        ,constructor = function(){}
        ;

    constructor.prototype = proto || {};
    constructor.prototype.type = type;
    
    return function test( name, factory ){

        var instance
            ,result
            ,typeOfFactory = typeof factory
            ;

        if ( typeOfFactory === 'function' ){

            registry[ name ] = factory;

        } else {

            result = registry[ name ];
            if (!result){

                throw 'The ' + type + ' "' + name + '" has not been defined';
            }

            instance = new constructor();
            result = new result( factory, instance );
            return Physics.util.extend( instance, result );
        }
    };
};