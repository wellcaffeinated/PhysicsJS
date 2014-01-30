/*
WIP
NOT NEEDED. Likely delete
 */
(function(){

    var indexOf = Physics.util.indexOf;

    /**
     * Group Constructor / Factory
     * @param {Array} items (optional) The items to add to the group
     */
    var Group = function Group( items ) {

        // enforce instantiation
        if (!(this instanceof Group)) {

            return new Group( items );
        }

        this.items = [];
        this.add( items );
    };

    Group.prototype = {

        /**
         * Remove all items
         * @return {self}
         */
        clear: function () {

            var self = this;

            self.items.length = 0;

            return self;
        },

        /**
         * Clone another group, or return a clone of this group
         * @param  {Group} other (optional) other group to clone
         * @return {self|Group}       If `other` is specified it returns self. Otherwise it returns a new group.
         */
        clone: function( other ){

            if ( other ){
                return this.clear().add( other );
            } else {
                return new Group( this.items );
            }
        },

        /**
         * Add an object (or objects) to the group
         * @param {Object} things The object (or array of objects) to add
         * @param {boolean} nocheck (optional) Set to true to disable duplicate checks
         * @return {self}
         */
        add: function ( things, nocheck ) {

            var self = this
                ,th
                ,items
                ;

            if ( !things ) {
                return self;
            }

            // convert to array if possible
            items = Group.asArray( things );

            if ( items ){
                for ( var i = 0, l = items.length; i < l; ++i ){
                        
                    th = items[ i ];

                    // ensure we don't already have the item
                    if ( nocheck || !self.has( th ) ){
                        self.items.push( th );
                    }
                }
            } else {
                if ( nocheck || !self.has( things ) ){
                    self.items.push( things );
                }
            }

            return self;
        },

        /**
         * Remove object from collection
         * @param  {Object|Array} things The object (or objects) to be removed
         * @return {self}
         */
        remove: function ( things ) {

            var self = this
                ,index
                ,th
                ,items
                ;

            if ( !things ) {
                return self;
            }

            // convert to array if possible
            items = Group.asArray( things );

            if ( items ){
                for ( var i = 0, l = things.length; i < l; ++i ){
                        
                    th = things[ i ];

                    index = indexOf( self.items, th );
                    if ( index > -1 ) {
                        self.items.splice( index, 1 );
                    }
                }
            } else {
                index = indexOf( self.items, things );
                if ( index > -1 ) {
                    self.items.splice( index, 1 );
                }
            }

            return self;
        },

        /**
         * Check if an object is part of the group.
         * @param  {Object} thing The object to check
         * @return {Boolean} The test result
         */
        has: function ( thing ) {

            return (indexOf(this.items, thing) > -1);
        },

        /**
         * Add items from other group/array/world that match query criteria.
         * (Note: Keeps any previously added items)
         * @param  {Array|Group|World} things Things to select from
         * @param {Object|Function} rules The query rules or custom function
         * @return {self}
         */
        select: function( things, rules ){

            var self = this
                ,q = typeof rules === 'function' ? rules : Physics.query( rules )
                ,items
                ,item
                ;

            if ( !things ){
                return self;
            }

            // determine what we need to search
            items = things._bodies ? things._bodies.items : Group.asArray( things );

            // search and add
            for ( var i = 0, l = items.length; i < l; ++i ){
                
                item = items[ i ];
                if ( q( item ) ){
                    self.add( item );
                }
            }

            return self;
        },

        /**
         * Get an array containing objects in group that match a query function.
         * @param {Object|Function} rules The query rules or custom function
         * @return {Array}       Array of matched objects
         */
        filter: function( rules ){

            var self = this
                ,q = typeof rules === 'function' ? rules : Physics.query( rules )
                ,matched = []
                ,item
                ;

            // search and add
            for ( var i = 0, l = self.items.length; i < l; ++i ){
                
                item = self.items[ i ];
                if ( q( item ) ){
                    matched.push( item );
                }
            }

            return matched;
        }

    };

    Group.asArray = function asArray( thing ){
        return Physics.util.isArray( thing ) ? 
            thing : // it's an array
            thing.items || false // it's a Group
            ;
    };

    Physics.group = Group;
})();