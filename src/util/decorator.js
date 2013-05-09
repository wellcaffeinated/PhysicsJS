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
 * service( 'name', (optional)'parent-name', function decorator( parent ){
 *
 *      // extend further...
 *      return {
 *          // overrides
 *          init: function( cfg ){
 *              parent.init.call(this, cfg);
 *          }
 *      };
 * });
 * // instantiate
 * var instance = service( 'name', options );
 */
var Decorator = Physics.util.decorator = function Decorator( type, proto ){

    var registry = {}
        ;

    var copyFn = function copyFn( a, b ){

        return Physics.util.isFunction( b ) ? b : a;
    };

    // http://ejohn.org/blog/objectgetprototypeof/
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

    var getExtension = function getExtension( constructor ){

        var ret, proto = constructor;

        if ( typeof constructor === 'function' ){

            proto = constructor.prototype;
            constructor = new constructor();
        }

        ret = Physics.util.extend({}, constructor, copyFn);
        ret.__proto__ = proto;
        return ret;
    };

    // TODO: not sure of the best way to make the constructor names
    // transparent and readable in debug consoles...
    proto = Physics.util.extend({}, proto, copyFn);
    proto.type = type;

    // little function to set the world
    proto.setWorld = function( world ){

        if ( this.disconnect && this._world ){
            this.disconnect( this._world );
        }

        this._world = world;

        if ( this.connect && world ){
            this.connect( world );
        }
    };

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
        }

        if ( typeof decorator === 'function' ){

            result = registry[ name ];

            if ( result ){
                // previously defined. just extend
                parent = result.prototype.__parent__;
                tmp = result.prototype.__proto__;
                result.prototype = Physics.util.extend(result.prototype, decorator( parent ), copyFn);
                result.prototype.__proto__ = tmp;

            } else {
                // newly defined
                // store the new class
                result = registry[ name ] = function constructor( opts ){
                    if (this.init){
                        this.init( opts );
                    }
                };

                parent = getExtension( parent );

                result.prototype = Physics.util.extend({}, parent, decorator( parent ), copyFn);
                result.prototype.__proto__ = getProto( parent );
            }

            result.prototype.type = type;
            result.prototype.name = name;
            result.prototype.__parent__ = parent;
            
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

    factory.mixin = function( key, val ){

        if ( key !== 'type' && Physics.util.isFunction( val ) ){
            proto[ key ] = val;
        }
    };

    return factory;
};