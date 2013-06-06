/**
 * physicsjs v0.5.0 - 2013-06-06
 * A decent javascript physics engine
 *
 * Copyright (c) 2013 Jasper Palfree <jasper@wellcaffeinated.net>
 * Licensed MIT
 */
(function (root, factory) {
    var deps = ['physicsjs'];
    if (typeof exports === 'object') {
        // Node. 
        var mods = deps.map(require);
        module.exports = factory.call(root, mods[ 0 ]);
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(deps, function( p ){ return factory.call(root, p); });
    } else {
        // Browser globals (root is window). Dependency management is up to you.
        root.Physics = factory.call(root, root.Physics);
    }
}(this, function ( Physics ) {
    'use strict';
    Physics.behavior('constant-acceleration', function( parent ){
    
        var defaults = {
    
            acc: { x : 0, y: 0.0004 }
        };
    
        return {
    
            init: function( options ){
    
                parent.init.call(this, options);
    
                this.options = Physics.util.extend(this.options, defaults, options);
                this._acc = Physics.vector();
                this.setAcceleration( this.options.acc );
            },
    
            setAcceleration: function( acc ){
    
                this._acc.clone( acc );
                return this;
            },
    
            behave: function( data ){
    
                var bodies = data.bodies;
    
                for ( var i = 0, l = bodies.length; i < l; ++i ){
                    
                    bodies[ i ].accelerate( this._acc );
                }
            }
        };
    });
    // end module: behaviors/constant-acceleration.js
    return Physics;
})); // UMD 