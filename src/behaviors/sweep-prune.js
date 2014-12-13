/**
* class SweepPruneBehavior < Behavior
*
* `Physics.behavior('sweep-prune')`.
*
* Sweep and Prune implementation for broad phase collision detection.
*
* This massively improves the speed of collision detection. It's set up to always be used with [[BodyCollisionDetection]], and [[BodyImpulseResponse]].
*
* Additional options include:
* - channel: The channel to publish collision candidates to. (default: `collisions:candidates`)
**/
Physics.behavior('sweep-prune', function( parent ){

    var uid = 1;

    // Get a unique numeric id for internal use
    var getUniqueId = function getUniqueId(){

        return uid++;
    };

    // change to "3" to get it to work in 3D
    var maxDof = 2;

    var pairHash = Physics.util.pairHash;

    return {

        // extended
        init: function( options ){

            parent.init.call( this );
            this.options.defaults({
                channel: 'collisions:candidates' //default channel
            });
            this.options( options );

            this.clear();
        },

        /**
        * SweepPruneBehavior#clear()
        *
        * Refresh tracking data
        **/
        clear: function(){

            this.candidates = [];
            this.tracked = [];
            this.pairs = []; // pairs selected as candidate collisions by broad phase
            this.intervalLists = []; // stores lists of aabb projection intervals to be sorted

            // init intervalLists
            for ( var xyz = 0; xyz < maxDof; ++xyz ){

                this.intervalLists[ xyz ] = [];
            }
        },

        // extended
        connect: function( world ){

            world.on( 'add:body', this.trackBody, this );
            world.on( 'remove:body', this.untrackBody, this );
            world.on( 'integrate:positions', this.broadphase, this, 1 );

            // add current bodies
            var bodies = world.getBodies();
            for ( var i = 0, l = bodies.length; i < l; ++i ){

                this.trackBody({ body: bodies[ i ] });
            }
        },

        // extended
        disconnect: function( world ){

            world.off( 'add:body', this.trackBody, this );
            world.off( 'remove:body', this.untrackBody, this );
            world.off( 'integrate:positions', this.broadphase, this );
            this.clear();
        },

        /** internal
        * SweepPruneBehavior#sortIntervalList( list, axis )
        *
        * Simple insertion sort for an axis list
        **/
        sortIntervalList: function( list, axis ){

            var len = list.length
                ,i
                ,hole
                ,bound
                ,boundVal
                ,left
                ,leftVal
                ;

            // for each interval bound...
            for ( i = 1; i < len; i++ ){

                // store bound
                bound = list[ i ];
                boundVal = bound.val.get( axis );
                hole = i;

                left = list[ hole - 1 ];
                leftVal = left && left.val.get( axis );

                // while others are greater than bound...
                while ( hole > 0 && leftVal > boundVal ) {

                    if ( (!bound.isMax && left.isMax) && Physics.aabb.overlap( bound.tracker.aabb, left.tracker.aabb ) ){
                        this.addCandidate( this.getPair(bound.tracker, left.tracker) );
                    }

                    if ( bound.isMax && !left.isMax ){
                        this.removeCandidate( this.getPair(bound.tracker, left.tracker), (bound.tracker.removed || left.tracker.removed) );
                    }

                    // move others greater than bound to the right
                    list[ hole ] = left;
                    hole--;
                    left = list[ hole - 1 ];
                    leftVal = left && left.val.get( axis );
                }

                // insert bound in the hole
                list[ hole ] = bound;
            }
        },

        /** internal
        * SweepPruneBehavior#addCandidate( pair )
        * - pair (Object): The pair object
        *
        * Add a pair to collision candidates
        **/
        addCandidate: function( pair ){

            if ( !pair || pair.index > -1 ){
                // already added
                return;
            }

            pair.index = this.candidates.length;
            this.candidates.push( pair );
        },

        /** internal
        * SweepPruneBehavior#removeCandidate( pair[, removePair] )
        * - pair (Object): The pair object
        * - removePair (Boolean): If true will also remove pair from hash table
        *
        * Remove a pair from collision candidates
        **/
        removeCandidate: function( pair, removePair ){

            var other;

            if ( pair && pair.index > -1 ){

                other = this.candidates.pop();
                if ( other !== pair ){
                    other.index = pair.index;
                    this.candidates[ other.index ] = other;
                }

                pair.index = -1;
            }

            if ( pair && removePair ){
                // remove the pair from the hash too
                this.pairs[ pair.hash ] = null;
            }
        },

        /** internal
        * SweepPruneBehavior#getPair( tr1, tr2, doCreate ) -> Object
        * - tr1 (Object): First tracker
        * - tr2 (Object): Second tracker
        * + (Object): Pair object or null if not found
        *
        * Get a pair object for the tracker objects
        **/
        getPair: function(tr1, tr2){

            var hash = pairHash( tr1.id, tr2.id );

            if ( hash === false ){
                return null;
            }

            var c = this.pairs[ hash ];

            if ( !c ){

                c = this.pairs[ hash ] = {
                    index: -1
                    ,hash: hash
                    ,bodyA: tr1.body
                    ,bodyB: tr2.body
                };
            }

            return c;
        },

        /** internal
        * SweepPruneBehavior#updateIntervals()
        *
        * Update position intervals on each axis
        **/
        updateIntervals: function(){

            var tr
                ,intr
                ,aabb
                ,list = this.tracked
                ,i = list.length
                ;

            // for all tracked bodies
            while ( (--i) >= 0 ){

                tr = list[ i ];
                intr = tr.interval;
                aabb = tr.body.aabb();
                tr.aabb = aabb;

                // copy the position (plus or minus) the aabb half-dimensions
                // into the min/max intervals
                intr.min.val.clone( aabb ).sub( aabb.hw, aabb.hh );
                intr.max.val.clone( aabb ).add( aabb.hw, aabb.hh );
            }
        },

        /** internal
        * SweepPruneBehavior#trackBody( data )
        * - data (Object): Event data
        *
        * Event callback to add body to list of those tracked by sweep and prune
        **/
        trackBody: function( data ){

            var body = data.body
                ,tracker = {
                    id: body.uid,
                    body: body
                }
                ;

            tracker.interval = {

                min: {
                    isMax: false, //min
                    val: new Physics.vector(),
                    tracker: tracker
                },

                max: {
                    isMax: true, //max
                    val: new Physics.vector(),
                    tracker: tracker
                }
            };

            this.tracked.push( tracker );

            for ( var xyz = 0; xyz < maxDof; xyz++ ){

                this.intervalLists[ xyz ].push( tracker.interval.min, tracker.interval.max );
            }
        },

        /** internal
        * SweepPruneBehavior#untrackBody( data )
        * - data (Object): Event data
        *
        * Event callback to remove body from list of those tracked
        **/
        untrackBody: function( data ){

            var body = data.body
                ,trackedList = this.tracked
                ,tracker
                ,toRemove = this.toRemove || ( this.toRemove = [] )
                ;

            for ( var i = 0, l = trackedList.length; i < l; i++ ){

                tracker = trackedList[ i ];

                if ( tracker.body === body ){

                    // remove the tracker at this index
                    trackedList.splice(i, 1);
                    // mark for removal
                    toRemove.push( tracker );
                    // move far away so pairs are removed automatically
                    tracker.interval.min.val.set( Infinity, Infinity );
                    tracker.interval.max.val.set( Infinity, Infinity );

                    tracker.removed = true;

                    break;
                }
            }
        },

        /** internal
        * SweepPruneBehavior#cleanup( toRemove )
        * - data (Array): Trackers to remove
        *
        * Clean up trackers
        **/
        cleanup: function( toRemove ){

            var tracker
                ,list
                ,count
                ,minmax
                ;

            for ( var i = 0, l = toRemove.length; i < l; i++ ){

                tracker = toRemove[ i ];

                for ( var xyz = 0; xyz < maxDof; xyz++ ){

                    count = 0;
                    list = this.intervalLists[ xyz ];

                    for ( var j = 0, m = list.length; j < m; j++ ){

                        minmax = list[ j ];

                        // remove both the min and the max
                        if ( minmax === tracker.interval.min || minmax === tracker.interval.max ){

                            // remove interval from list
                            list.splice(j, 1);
                            j--;
                            l--;

                            if (count > 0){
                                break;
                            }

                            count++;
                        }
                    }
                }
            }
        },

        /** internal
        * SweepPruneBehavior#broadPhase( data )
        * - data (Object): Event data
        *
        * Event callback to sweep and publish event if any candidate collisions are found
        **/
        broadphase: function( data ){

            var self = this
                ,toRemove
                ;

            toRemove = this.toRemove;
            this.toRemove = null;

            this.updateIntervals();
            this.sortIntervalList( this.intervalLists[0], 0 );
            this.sortIntervalList( this.intervalLists[1], 1 );
            // this.sortIntervalList( this.intervalLists[2], 2 );

            this._world.emit('sweep-prune:intervals', this.intervalLists);

            if ( this.candidates.length ){

                this._world.emit( this.options.channel, {
                    candidates: this.candidates
                });
            }

            if ( toRemove ){
                this.cleanup( toRemove );
            }
        }
    };
});
