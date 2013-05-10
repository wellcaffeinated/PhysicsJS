/**
 * physicsjs v0.5.0 - 2013-05-10
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
    //
    // Sweep and Prune implementation for broad phase collision detection
    //
    Physics.behavior('sweep-prune', function( parent ){
    
        var PUBSUB_CANDIDATES = 'collisions:candidates';
        var uid = 1;
        var getUniqueId = function getUniqueId(){
    
            return uid++;
        };
    
        // add z: 2 to get this to work in 3D
        var dof = { x: 0, y: 1 }; // degrees of freedom
    
        // return hash for a pair of ids
        function pairHash( id1, id2 ){
    
            if ( id1 === id2 ){
    
                return false;
            }
    
            // valid for values < 2^16
            return id1 > id2? 
                (id1 << 16) | (id2 & 0xFFFF) : 
                (id2 << 16) | (id1 & 0xFFFF)
                ;
        }
        
        return {
    
            priority: 10,
    
            // constructor
            init: function( options ){
    
                parent.init.call(this, options);
    
                this.clear();
            },
    
            clear: function(){
    
                this.tracked = [];
                this.pairs = []; // pairs selected as candidate collisions by broad phase
                this.intervalLists = {}; // stores lists of aabb projection intervals to be sorted
                
                // init intervalLists
                for ( var xyz in dof ){
    
                    this.intervalLists[ xyz ] = [];
                }
            },
    
            setWorld: function( world ){
    
                this.clear();
    
                // subscribe to notifications of new bodies added to world
                if (this._world){
    
                    this._world.unsubscribe( 'add:body', this.trackBody );
                }
    
                world.subscribe( 'add:body', this.trackBody, this );
    
                // add current bodies
                var bodies = world.getBodies();
                for ( var i = 0, l = bodies.length; i < l; ++i ){
                    
                    this.trackBody({ body: bodies[ i ] });
                }
    
                parent.setWorld.call( this, world );
            },
    
            broadPhase: function(){
    
                this.updateIntervals();
                this.sortIntervalLists();
                return this.checkOverlaps();
            },
    
            // simple insertion sort for each axis
            sortIntervalLists: function(){
    
                var list
                    ,len
                    ,i
                    ,hole
                    ,bound
                    ,boundVal
                    ,left
                    ,leftVal
                    ,axis
                    ;
    
                // for each axis...
                for ( var xyz in dof ){
    
                    // get the intervals for that axis
                    list = this.intervalLists[ xyz ];
                    i = 0;
                    len = list.length;
                    axis = dof[ xyz ];
    
                    // for each interval bound...
                    while ( (++i) < len ){
    
                        // store bound
                        bound = list[ i ];
                        boundVal = bound.val.get( axis );
                        hole = i;
    
                        left = list[ hole - 1 ];
                        leftVal = left && left.val.get( axis );
    
                        // while others are greater than bound...
                        while ( 
                            hole > 0 && 
                            (
                                leftVal > boundVal ||
                                // if it's an equality, only move it over if 
                                // the hole was created by a minimum
                                // and the previous is a maximum
                                // so that we detect contacts also
                                leftVal === boundVal &&
                                ( left.type && !bound.type )
                            )
                        ) {
    
                            // move others greater than bound to the right
                            list[ hole ] = left;
                            hole--;
                            left = list[ hole - 1 ];
                            leftVal = left && left.val.get( axis );
                        }
    
                        // insert bound in the hole
                        list[ hole ] = bound;
                    }
                }
            },
    
            getPair: function(tr1, tr2, doCreate){
    
                var hash = pairHash( tr1.id, tr2.id );
    
                if ( hash === false ){
                    return null;
                }
    
                var c = this.pairs[ hash ];
    
                if ( !c ){
    
                    if ( !doCreate ){
                        return null;
                    }
    
                    c = this.pairs[ hash ] = {
                        bodyA: tr1.body,
                        bodyB: tr2.body,
                        flag: 0
                    };
                }
    
                return c;
            },
    
            checkOverlaps: function(){
    
                var isX
                    ,hash
                    ,tr1
                    ,tr2
                    ,bound
                    ,list
                    ,len
                    ,i
                    ,j
                    ,c
                    // determine which axis is the last we need to check
                    ,collisionFlag = ( dof.z || dof.y || dof.x )
                    ,encounters = []
                    ,enclen = 0
                    ,candidates = []
                    ;
    
                for ( var xyz in dof ){
    
                    // is the x coord
                    isX = (xyz === 'x');
                    // get the interval list for this axis
                    list = this.intervalLists[ xyz ];
                    i = -1;
                    len = list.length;
    
                    // for each interval bound
                    while ( (++i) < len ){
                        
                        bound = list[ i ];
                        tr1 = bound.tracker;
    
                        if ( bound.type ){
    
                            // is a max
    
                            j = enclen;
    
                            while ( (--j) >= 0 ){
    
                                tr2 = encounters[ j ];
    
                                // if they are the same tracked interval
                                if ( tr2 === tr1 ){
    
                                    // remove the interval from the encounters list
                                    // faster than .splice()
                                    if ( j < enclen - 1 ) {
                                        
                                        encounters[ j ] = encounters.pop();
    
                                    } else {
    
                                        // encountered a max right after a min... no overlap
                                        encounters.pop();
                                    }
    
                                    enclen--;
    
                                } else {
    
                                    // check if we have flagged this pair before
                                    // if it's the x axis, create a pair
                                    c = this.getPair( tr1, tr2, isX );
    
                                    if ( c ){
                                        
                                        // if it's the x axis, set the flag
                                        // to = 1.
                                        // if not, increment the flag by one.
                                        c.flag = isX? 0 : c.flag + 1;
    
                                        // c.flag will equal collisionFlag 
                                        // if we've incremented the flag
                                        // enough that all axes are overlapping
                                        if ( c.flag === collisionFlag ){
    
                                            // overlaps on all axes.
                                            // add it to possible collision
                                            // candidates list for narrow phase
    
                                            candidates.push( c );
                                        }
                                    }
                                }
                            }
    
                        } else {
    
                            // is a min
                            // just add this minimum to the encounters list
                            enclen = encounters.push( tr1 );
                        }
                    }
                }
    
                return candidates;
            },
    
            updateIntervals: function(){
    
                var tr
                    ,intr
                    ,scratch = Physics.scratchpad()
                    ,pos = scratch.vector()
                    ,aabb = scratch.vector()
                    ,list = this.tracked
                    ,i = list.length
                    ;
    
                // for all tracked bodies
                while ( (--i) >= 0 ){
    
                    tr = list[ i ];
                    intr = tr.interval;
                    pos.clone( tr.body.state.pos );
                    aabb.clone( tr.body.aabb() );
    
                    // copy the position (plus or minus) the aabb bounds
                    // into the min/max intervals
                    intr.min.val.clone( pos ).vsub( aabb );
                    intr.max.val.clone( pos ).vadd( aabb );
                }
    
                scratch.done();
            },
    
            // add body to list of those tracked by sweep and prune
            trackBody: function( data ){
    
                var body = data.body
                    ,tracker = {
    
                        id: getUniqueId(),
                        body: body
                    }
                    ,intr = {
    
                        min: {
                            type: false, //min
                            val: Physics.vector(),
                            tracker: tracker
                        },
    
                        max: {
                            type: true, //max
                            val: Physics.vector(),
                            tracker: tracker
                        }
                    }
                    ;
    
                tracker.interval = intr;
                this.tracked.push( tracker );
                
                for ( var xyz in dof ){
    
                    this.intervalLists[ xyz ].push( intr.min, intr.max );
                }
            },
    
            connect: function( world ){
    
                world.subscribe( 'integrate:velocities', this.sweep, this );
            },
    
            disconnect: function( world ){
    
                world.unsubscribe( 'integrate:velocities', this.sweep );
            },
    
            sweep: function( data ){
    
                var self = this
                    ,bodies = data.bodies
                    ,dt = data.dt
                    ,candidates
                    ;
    
                candidates = self.broadPhase();
                
                if ( candidates.length ){
    
                    this._world.publish({
                        topic: PUBSUB_CANDIDATES,
                        candidates: candidates
                    });
                }
            },
    
            behave: function(){}
        };
    });
    // end module: behaviors/sweep-prune.js
    return Physics;
})); // UMD 