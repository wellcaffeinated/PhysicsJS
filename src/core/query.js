(function (window) {

    /**
     * Helpers
     */
    
    /*!
     * Fast indexOf
     * @param  {Array} arr   The array to search
     * @param  {Mixed} value The value to find
     * @return {Number}       The index OR -1
     */
    var indexOf = function indexOf(arr, value) {
        var fr = 0, bk = arr.length;
        while (fr < bk) {
            bk--;
            if (arr[ fr ] === value) {
                return fr;
            }
            if (arr[ bk ] === value) {
                return bk;
            }
            fr++;
        }
        return -1;
    };

    /*!
     * Get test function to test on sub property
     * @param  {Function} fn   The test function
     * @param  {String}   prop The property name to test
     * @return {Function}        The wrapped function
     */
    var wrapRule = function wrapRule( fn, prop ){
        return function( thing ){
            return fn( thing[ prop ] );
        };
    };

    /*!
     * Get an equality test function
     * @param  {Mixed} toMatch The value to match
     * @param  {String} prop    (optional) The property name to test
     * @return {Function}         The test function
     */
    var $eq = function $eq( toMatch, prop ){
        return function( thing ){
            
            thing = prop ? thing[ prop ] : thing;

            var fr = 0
                ,bk
                ;
            
            if ( Physics.util.isArray( thing ) ){

                if ( Physics.util.isArray( toMatch ) ){
                    // match all
                    bk = thing.length;

                    // check lengths
                    if ( bk !== toMatch.length ){
                        return false;
                    }

                    while ( fr < bk ){
                        bk--;
                        if (
                            // check front
                            (indexOf(toMatch, thing[ fr ]) === -1) ||
                            // check back
                            (indexOf(toMatch, thing[ bk ]) === -1)
                        ) {
                            return false;
                        }
                        fr++;
                    }
                    return true;
                } else {
                    // find in array
                    return (indexOf( thing, toMatch ) > -1);
                }
            }

            // exact match
            return (thing === toMatch);
        };
    };

    /*!
     * Get a NOT equality test function
     * @param  {Mixed} toMatch The value to match
     * @param  {String} prop    (optional) The property name to test
     * @return {Function}         The test function
     */
    var $ne = function $ne( toMatch, prop ){
        var fn = $eq( toMatch, prop );
        return function( thing ){
            return !fn( thing );
        };
    };

    /*!
     * Get a test function for matching ANY in array
     * @param  {Mixed} toMatch The value array to match
     * @param  {String} prop    (optional) The property name to test
     * @return {Function}         The test function
     */
    var $in = function $in( toMatch, prop ){
        return function( thing ){

            thing = prop ? thing[ prop ] : thing;
            
            var fr = 0
                ,bk
                ;

            if ( Physics.util.isArray( thing ) ){
                bk = thing.length;

                while( fr < bk ){
                    bk--;
                    if (
                        // check front
                        (indexOf(toMatch, thing[ fr ]) > -1) ||
                        // check back
                        (indexOf(toMatch, thing[ bk ]) > -1)
                    ) {
                        return true;
                    }
                    fr++;
                }
                return false;
            }

            // if thing matches any in array
            return (indexOf(toMatch, thing) > -1);
        };
    };

    /*!
     * Get a test function for matching NOT ANY in array
     * @param  {Mixed} toMatch The value array to match
     * @param  {String} prop    (optional) The property name to test
     * @return {Function}         The test function
     */
    var $nin = function $nin( toMatch, prop ){
        var fn = $in( toMatch, prop );
        return function( thing ){
            return !fn( thing );
        };
    };

    /*!
     * Get an AND test function
     * @param  {Function} first First function node
     * @return {Function}       Test function
     */
    var $and = function $and( first ){
        return first.next ? function( thing ){
            var fn = first;
            while ( fn ){

                if ( !fn( thing ) ){
                    return false;
                }
                fn = fn.next;
            }
            return true;
        } : first;
    };

    /*!
     * Get an OR test function
     * @param  {Function} first First function node
     * @return {function}       Test function
     */
    var $or = function $or( first ){
        return first.next ? function( thing ){
            var fn = first;
            while ( fn ){

                if ( fn( thing ) ){
                    return true;
                }
                fn = fn.next;
            }
            return false;
        } : first;
    };

    // operation hash
    var operations = {
        // $and and $or are separate
        $eq: $eq
        ,$ne: $ne
        ,$in: $in
        ,$nin: $nin
    };

    var build = function build( rules, $op ){

        var op
            ,l
            ,rule
            ,first
            ,list
            ,fn
            ;

        if ( $op ){
            
            // parse operation choice
            if ( $op === '$or' || $op === '$and' ){

                // expect a rules array
                for ( op = 0, l = rules.length; op < l; ++op ){
                    
                    fn = build( rules[ op ] );
                    // if first hasn't been set yet, set it and start the list there
                    // otherwise set the next node of the list
                    list = list ? list.next = fn : first = fn;
                }

                return ($op === '$or') ? $or( first ) : $and( first );
            } else if ( op = operations[ $op ] ){

                return op( rules );

            } else {
                // does not compute...
                throw 'Unknown query operation: ' + $op;
            }
        }

        // loop through rules
        for ( op in rules ){
            rule = rules[ op ];
   
            if ( op[0] === '$' ){
                // it's an operation rule
                fn = build( rule, op );
                
            } else if ( Physics.util.isPlainObject( rule ) ) {
                // it's an object so parse subrules
                fn = wrapRule( build( rule ), op );
            } else {
                // simple equality rule
                fn = $eq( rule, op );
            }

            // if first hasn't been set yet, set it and start the list there
            // otherwise set the next node of the list
            list = list ? list.next = fn : first = fn;
        }

        // return the rules test
        return $and( first );
    };

    /**
     * Query Constructor / Factory
     * @param {Query} base (optional) A query to extend
     * @param {Object} q The query rules
     */
    var Query = function Query(base, q) {

        // enforce instantiation
        if (!(this instanceof Query)) {

            return new Query(base, q);
        }

        if (base instanceof Query) {

            this.extend(base);

        } else {

            q = base;
            base = undefined;
        }

        this.reset();
        this.rules(q);
    };

    Query.prototype = {

        /**
         * Reset the collection
         * @return {self}
         */
        reset: function () {

            var self = this;

            self._ = [];

            return self;
        },

        /**
         * Get or set the query rules
         * @param  {Object} q (optional) The query rules to set
         * @return {Object|self}   The query rules (if q not specified)
         */
        rules: function ( q ) {

            var self = this;

            if (q === undefined) {
                return self._rules;
            }

            self._rules = q;
            self._fn = build( q );

            return self;
        },

        /**
         * Extend another query
         * @param  {Query} base The query to extend
         * @return {self}
         */
        extend: function ( base ) {

            var self = this;

            if ( self._fn ){
                self._fn.next = base._fn;
                self._fn = $and( self._fn );
            } else {
                self._fn = base._fn;
            }

            return self;
        },

        /**
         * Apply the query to a world
         * @param  {Object} world The world to apply the query to
         * @return {self}
         */
        applyTo: function ( world ) {

            var self = this
                ,topic
                , events = {
                    'add:body': this.checkAndAdd,
                    'remove:body': this.remove
                    // @TODO future enhancement ?
                    // 'add:behavior': this.checkAndAdd,
                    // 'remove:behavior': this.remove
                }
                , bodies
                ;

            if ( self._world ) {

                // do nothing if already applied
                if ( self._world === world ) {
                    return self;
                }

                for ( topic in events ) {
                    self._world.disconnect( topic, events[topic] );
                }
            }

            self._world = world;
            self._world.subscribe( events, self );

            self.reset();

            bodies = self._world.getBodies();

            for (var i = 0, l = bodies.length; i < l; ++i) {

                self.checkAndAdd( bodies[i] );
            }

            return self;
        },

        /**
         * Check if an object matches the query rules
         * @param  {Object} thing The object to check
         * @return {Boolean}       The test result
         */
        check: function ( thing ) {

            var self = this;
            return self._fn( thing );
        },

        /**
         * Add an object to collection if it matches query rules
         * @param  {Object} data The object to check and add (or pubsub event data)
         * @return {self}
         */
        checkAndAdd: function ( data ) {

            var self = this
                // expect pubsub event data OR a body
                , thing = data && data.topic && data.body || data
                ;

            if ( !thing ) {
                return self;
            }

            // check for a match and add to collection if matched
            if ( self.check(thing) ) {
                self._.push( thing );
            }

            return self;
        },

        /**
         * Remove object from collection
         * @param  {Object} data The object to be removed (or pubsub event data)
         * @return {self}
         */
        remove: function ( data ) {

            var self = this
                // expect pubsub event data OR a body
                , thing = data && data.topic && data.body || data
                , collection = this._
                , index
                ;

            if ( !thing ) {
                return self;
            }

            index = indexOf( collection, thing );
            if ( index > -1 ) {
                collection.splice( index, 1 );
            }

            return self;
        },

        /**
         * Check if an object exists in the match collection.
         * Does not re-apply match criteria, simply checks the existing collection.
         * @param  {Object} thing The object to check
         * @return {Boolean} The test result
         */
        contains: function ( thing ) {

            return (indexOf(this._, thing) > -1);
        },

        /**
         * Get an array of the matched objects
         * @return {Array} Array of matched objects
         */
        getAll: function () {

            return [].concat( this._ );
        }

    };

    Physics.query = Query;

})(this);