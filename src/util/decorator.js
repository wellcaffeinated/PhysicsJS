/** related to: factory
 * Physics.util.decorator( type [, protoDef ] ) -> Function
 * - type (String): The name of the factory you are creating
 * - protoDef (Object): The top-level prototype
 * + (Function): The factory function
 *
 * Facilitates creation of decorator factory functions.
 *
 * See the [[factory]] definition for the factory signatures.
 * [For full documentation and examples, please visit the wiki](https://github.com/wellcaffeinated/PhysicsJS/wiki/Fundamentals#the-factory-pattern).
 *
 * Example:
 *
 * ```javascript
 * var factory = Physics.util.decorator('factory', {
 *      // prototype methods...
 *      method: function( args ){
 *      }
 * });
 *
 * // define
 * factory( 'name', 'parent-name', function( parent ){
 *
 *      // extend further...
 *      return {
 *          // overrides
 *          init: function( cfg ){
 *              parent.init.call(this, cfg);
 *          }
 *      };
 * });
 *
 * // instantiate
 * var options = { key: 'val' };
 * var instance = factory( 'name', options );
 * ```
 **/
var Decorator = Physics.util.decorator = function Decorator( type, baseProto ){

    var registry = {}
        ,proto = {}
        ;

    // extend that supports getters/setters
    // only extends functions
    var extend = function extend( to, from ){
        var desc, key;
        for ( key in from ){
            desc = Object.getOwnPropertyDescriptor( from, key );
            if ( desc.get || desc.set ){

                Object.defineProperty( to, key, desc );

            } else if ( Physics.util.isFunction( desc.value ) ){

                to[ key ] = desc.value;
            }
        }
        return to;
    };

    // http://ejohn.org/blog/objectgetprototypeof/
    /* jshint -W103 */
    var getProto = Object.getPrototypeOf;
    if ( typeof getProto !== 'function' ) {
        if ( typeof 'test'.__proto__ === 'object' ) {
            getProto = function(object){
                return object.__proto__;
            };
        } else {
            getProto = function(object){
                // May break if the constructor has been tampered with
                return object.constructor.prototype;
            };
        }
    }
    /* jshint +W103 */

    var objectCreate = Object.create;
    if (typeof objectCreate !== 'function') {
        objectCreate = function (o) {
            function F() {}
            F.prototype = o;
            return new F();
        };
    }

    /*
     * mixin( key, val )
     * mixin( obj )
     * - key (String): The method name
     * - val (Function): The function to assign
     * - obj (Object): object with many `key: fn` pairs
     *
     * Apply mixin methods to decorator base.
     */
    var mixin = function mixin( key, val ){

        if ( typeof key === 'object' ){
            proto = extend(proto, key);
            proto.type = type;
            return;
        }

        if ( key !== 'type' && Physics.util.isFunction( val ) ){
            proto[ key ] = val;
        }
    };

    // @TODO: not sure of the best way to make the constructor names
    // transparent and readable in debug consoles...
    mixin( baseProto );

    /**  belongs to: Physics.util.decorator
     * factory( name[, parentName], decorator[, cfg] )
     * factory( name, cfg ) -> Object
     * -  name       (String):  The class name
     * -  parentName (String): The name of parent class to extend
     * -  decorator  (Function): The decorator function that should define and return methods to extend (decorate) the base class
     * -  cfg        (Object): The configuration to pass to the class initializer
     *
     * Factory function for definition and instantiation of subclasses.
     *
     * Use the first signature (once) to define it first.
     * If defining without the "cfg" parameter, void will be returned. Otherwise the class instance will be returned.
     *
     * See [[Physics.util.decorator]] for more information.
     **/
    var factory = function factory( name, parentName, decorator, cfg ){

        var instance
            ,result
            ,parent = proto
            ,tmp
            ;

        // set parent if specified
        if ( typeof parentName !== 'string' ){

            // ... otherwise reassign parameters
            cfg = decorator;
            decorator = parentName;

        } else {

            // extend the specified module
            parent = registry[ parentName ];

            if ( !parent ){

                throw 'Error: "' + parentName + '" ' + type + ' not defined';
            }

            parent = parent.prototype;
        }

        if ( typeof decorator === 'function' ){

            result = registry[ name ];

            if ( result ){

                result.prototype = extend(result.prototype, decorator( getProto(result.prototype) ));

            } else {
                // newly defined
                // store the new class
                result = registry[ name ] = function constructor( opts ){
                    if (this.init){
                        this.init( opts );
                    }
                };

                result.prototype = objectCreate( parent );
                result.prototype = extend(result.prototype, decorator( parent, result.prototype ));
            }

            result.prototype.type = type;
            result.prototype.name = name;

        } else {

            cfg = decorator || {};
            result = registry[ name ];
            if (!result){

                throw 'Error: "' + name + '" ' + type + ' not defined';
            }
        }

        if ( cfg ) {

            // create a new instance from the provided decorator
            return new result( cfg );
        }
    };

    factory.mixin = mixin;

    return factory;
};
