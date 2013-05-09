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
var Decorator = function Decorator( type, proto ){

    var registry = {}
        ,base = function(){}
        ;

    // TODO: not sure of the best way to make the constructor names
    // transparent and readable in debug consoles...
    proto = proto || {};
    proto.type = type;

    // little function to set the world
    proto.setWorld = function( world ){

        if ( this.disconnect ){
            this.disconnect( this._world );
        }

        this._world = world;
        
        if ( this.connect ){
            this.connect( world );
        }
    };
    
    return function factory( name, parentName, decorator, cfg ){

        var instance
            ,result
            ,parent = proto
            ;

        if ( typeof parentName !== 'string' ){

            cfg = decorator;
            decorator = parentName;

        } else {

            parent = registry[ parentName ].prototype;
        }

        if ( typeof decorator === 'function' ){

            // store the new class
            result = registry[ name ] = function constructor( opts ){
                if (this.init){
                    this.init( opts );
                }
            };

            result.prototype = Physics.util.extend({}, parent, decorator( parent ));
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
};