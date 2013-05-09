(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. 
        module.exports = factory.call(root);
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals (root is window)
        root.Physics = factory.call(root);
    }
}(this, function () {

'use strict';

var Physics = function Physics(){

    return Physics.world.apply(Physics, arguments);
};

Physics.util = {};
