(function(window){

    /**
     * Query Constructor / Factory
     * @param {Query} base (optional) A query to extend
     * @param {Object} q The query rules
     */
    var Query = function Query( base, q ) {

        // enforce instantiation
        if ( !(this instanceof Query) ){

            return new Query( base, q );
        }

        if ( base instanceof Query ){

            this.extend( base );

        } else {

            q = base;
            base = undefined;
        }

        this.reset();
        this.rules( q );
    };

    Query.prototype = {

        /**
         * Reset the collection
         * @return {self}
         */
        reset: function(){

            var self = this;

            self._collection = [];

            return self;
        },

        /**
         * Get or set the query rules
         * @param  {Object} q (optional) The query rules to set
         * @return {Object|self}   The query rules (if q not specified)
         */
        rules: function( q ){

            var self = this;

            if ( q === undefined ){

                // return a copy of the query rules
                // return rules;
            }

            // set the rules

            return self;
        },

        /**
         * Extend another query
         * @param  {Query} base The query to extend
         * @return {self}
         */
        extend: function( base ){

            var self = this;

            // extend another query

            return self;
        },

        /**
         * Apply the query to a world
         * @param  {[type]} world [description]
         * @return {[type]}       [description]
         */
        applyTo: function( world ){

            var self = this
                ,events = {
                    'add:body': this.checkAndAdd,
                    'remove:body': this.remove
                    // @TODO future enhancement ?
                    // 'add:behavior': this.checkAndAdd,
                    // 'remove:behavior': this.remove
                }
                ,bodies
                ;

            if ( self._world ){

                // do nothing if already applied
                if ( self._world === world ){
                    return self;
                }

                for ( var topic in events ){
                    self._world.disconnect( topic, events[topic] );
                }
            }

            self._world = world;
            self._world.connect(events, self);

            self.reset();

            bodies = self._world.getBodies();

            for ( var i = 0, l = bodies.length; i < l; ++i ){
                
                self.checkAndAdd( bodies[ i ] );
            }

            return self;
        },

        /**
         * Check if an object matches the query rules
         * @param  {Object} thing The object to check
         * @return {Boolean}       The test result
         */
        check: function( thing ){

            var self = this
                ,matches = false
                ;

            // check against rules

            return matches;
        },

        /**
         * Add an object to collection if it matches query rules
         * @param  {Object} data The object to check and add (or pubsub event data)
         * @return {self}
         */
        checkAndAdd: function( data ){

            var self = this
                // expect pubsub event data OR a body
                ,thing = data && data.topic && data.body || data
                ;

            if ( !thing ){
                return self;
            }

            // check for a match and add to collection if matched
            if ( self.check( thing ) ){
                self._collection.push( thing );
            }

            return self;
        },

        /**
         * Remove object from collection
         * @param  {Object} data The object to be removed (or pubsub event data)
         * @return {self}
         */
        remove: function( data ){

            var self = this
                // expect pubsub event data OR a body
                ,thing = data && data.topic && data.body || data
                ;

            if ( !thing ){
                return self;
            }

            // remove thing from collection (if it's inside collection)

            return self;
        },

        /**
         * Get an array of the matched objects
         * @return {Array} Array of matched objects
         */
        getAll: function(){

            // return a copy
            return [].concat( this._collection );
        }
        
    };

    // expose the API
    // Physics.query = Query;

})(this);