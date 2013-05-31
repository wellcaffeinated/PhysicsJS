/**
 * physicsjs v0.5.0 - 2013-05-31
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
    Physics.renderer('dom', function( proto ){
    
        // utility methods
        var thePrefix = {}
            ,tmpdiv = document.createElement("div")
            ,toTitleCase = function toTitleCase(str) {
                return str.replace(/(?:^|\s)\w/g, function(match) {
                    return match.toUpperCase();
                });
            }
            ,pfx = function pfx(prop) {
    
                if (thePrefix[prop]){
                    return thePrefix[prop];
                }
    
                var arrayOfPrefixes = ['Webkit', 'Moz', 'Ms', 'O']
                    ,name
                    ;
    
                for (var i = 0, l = arrayOfPrefixes.length; i < l; ++i) {
    
                    name = arrayOfPrefixes[i] + toTitleCase(prop);
    
                    if (name in tmpdiv.style){
                        return thePrefix[prop] = name;
                    }
                }
    
                if (name in tmpdiv.style){
                    return thePrefix[prop] = prop;
                }
    
                return false;
            }
            ;
    
        var classpfx = 'pjs-'
            ,px = 'px'
            ,cssTransform = pfx('transform')
            ;
    
        var newEl = function( node, content ){
                var el = document.createElement(node || 'div');
                if (content){
                    el.innerHTML = content;
                }
                return el;
            }
            ,drawBody
            ;
    
        if (cssTransform){
            drawBody = function( body, view ){
    
                var pos = body.state.pos;
                view.style[cssTransform] = 'translate('+pos.get(0)+'px,'+pos.get(1)+'px) rotate('+body.state.angular.pos+'rad)';
            };
        } else {
            drawBody = function( body, view ){
    
                var pos = body.state.pos;
                view.style.left = pos.get(0) + px;
                view.style.top = pos.get(1) + px;
            };
        }
    
        return {
    
            init: function( options ){
    
                // call proto init
                proto.init.call(this, options);
    
                var viewport = this.el;
                viewport.style.position = 'relative';
                viewport.style.overflow = 'hidden';
                viewport.style.width = this.options.width + px;
                viewport.style.height = this.options.height + px;
    
                this.els = {};
    
                var stats = newEl();
                stats.className = 'pjs-meta';
                this.els.fps = newEl('span');
                this.els.ipf = newEl('span');
                stats.appendChild(newEl('span', 'fps: '));
                stats.appendChild(this.els.fps);
                stats.appendChild(newEl('br'));
                stats.appendChild(newEl('span', 'ipf: '));
                stats.appendChild(this.els.ipf);
    
                viewport.appendChild(stats);
            },
    
            circleProperties: function( el, geometry ){
    
                var aabb = geometry.aabb();
    
                el.style.width = (aabb.halfWidth * 2) + px;
                el.style.height = (aabb.halfHeight * 2) + px;
                el.style.marginLeft = (-aabb.halfWidth) + px;
                el.style.marginTop = (-aabb.halfHeight) + px;
            },
    
            createView: function( geometry ){
    
                var el = newEl()
                    ,fn = geometry.name + 'Properties'
                    ;
    
                el.className = classpfx + geometry.name;
                el.style.position = 'absolute';            
                el.style.top = '0px';
                el.style.left = '0px';
                
                if (this[ fn ]){
                    this[ fn ](el, geometry);
                }
                
                this.el.appendChild( el );
                return el;
            },
    
            drawMeta: function( stats ){
    
                this.els.fps.innerHTML = stats.fps.toFixed(2);
                this.els.ipf.innerHTML = stats.ipf;
            },
    
            drawBody: drawBody
        };
    });
    // end module: renderers/dom.js
    return Physics;
})); // UMD 