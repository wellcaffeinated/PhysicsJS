/**
 * physicsjs v0.5.0 - 2013-05-13
 * A decent javascript physics engine
 *
 * Copyright (c) 2013 Jasper Palfree <jasper@wellcaffeinated.net>
 * Licensed MIT
 */
(function (root, factory) {
    var deps = ['physicsjs', '../geometries/circle'];
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
    /**
     * Circle body definition
     * @module bodies/circle
     * @requires geometries/circle
     */
    Physics.body('circle', function( parent ){
    
        var defaults = {
            
        };
    
        return {
            init: function( options ){
    
                // call parent init method
                parent.init.call(this, options);
    
                options = Physics.util.extend({}, defaults, options);
    
                this.geometry = Physics.geometry('circle', {
                    radius: options.radius
                });
    
                this.recalc();
            },
    
            recalc: function(){
                parent.recalc.call(this);
                // moment of inertia
                this.moi = this.mass * this.geometry.radius * this.geometry.radius / 2;
            }
        };
    });
    
    // end module: bodies/circle.js
    return Physics;
})); // UMD 