/*
 * PhysicsJS physics library
 * https://github.com/wellcaffeinated/physicsjs
 * 
 * Copyright 2013, Jasper Palfree
 * Licensed under the MIT license.
 */
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

    var Physics = {};
    Physics.util = {};
