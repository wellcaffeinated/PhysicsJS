(function (root, factory) {
    if (typeof exports === 'object') {
        // Node.
        module.exports = factory.call(root);
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function(){ return factory.call(root) });
    } else {
        // Browser globals (root is window)
        root.Physics = factory.call(root);
    }
}(typeof window !== 'undefined' ? window : this, function () {

'use strict';

var window = this;
var document = window.document;

/** related to: Physics.world
 * Physics
 *
 * The top-level namespace. All of PhysicsJS is contained in
 * the `Physics` namespace.
 *
 * It may (and should) be invoked as a function to create a world instance. For all intensive purposes, [[Physics]] and [[Physics.world]] are the same thing.
 *
 * See [[new Physics.world]] for config options and function signature.
 *
 * Example:
 *
 * ```javascript
 * Physics( cfg, function( world ) {
 *     // use world
 * }); // -> world
 * ```
 **/
var Physics = function Physics(){

    return Physics.world.apply(Physics, arguments);
};

/**
 * Physics.util
 *
 * Namespace for utility functions.
 **/
Physics.util = {};

/**
 * == Special ==
 *
 * This section contains miscellaneous functionality.
 **/
