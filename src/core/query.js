(function (window) {

    /*
     * Group helpers
     */
    var fnTrue = function(){ return !0; }; // return true
    
    var indexOf = Physics.util.indexOf;

    /** hide
     * wrapRule( fn( propVal ), prop ) -> Function
     * - fn (Function): The test function
     * - prop (String): The property name to test
     * - propVal (Mixed): The property value
     * 
     * Get test function to test on sub property.
     **/
    var wrapRule = function wrapRule( fn, prop ){
        return function( thing ){
            return fn( thing[ prop ] );
        };
    };

    /** hide
     * $eq( toMatch[, prop] ) -> Function
     * - toMatch (Mixed): The value to match
     * - prop (String): The property name to test
     * 
     * Get an equality test function.
     **/
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

    /** hide
     * $ne( toMatch[, prop] ) -> Function
     * - toMatch (Mixed): The value to match
     * - prop (String): The property name to test
     * 
     * Get a NOT equality test function.
     **/
    var $ne = function $ne( toMatch, prop ){
        var fn = $eq( toMatch, prop );
        return function( thing ){
            return !fn( thing );
        };
    };

    /** hide
     * $in( toMatch[, prop] ) -> Function
     * - toMatch (Array): The array to match
     * - prop (String): The property name to test
     * 
     * Get a test function for matching ANY in array
     **/
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

    /** hide
     * $nin( toMatch[, prop] ) -> Function
     * - toMatch (Array): The array to match
     * - prop (String): The property name to test
     * 
     * Get a test function for matching NOT ANY in array
     **/
    var $nin = function $nin( toMatch, prop ){
        var fn = $in( toMatch, prop );
        return function( thing ){
            return !fn( thing );
        };
    };

    /** hide
     * $at( point ) -> Function
     * - point (Vectorish): The point to check
     * 
     * Get a test function to match any body who's aabb intersects point
     **/
    var $at = function $at( point ){
        point = new Physics.vector( point );
        return function( body ){
            var aabb = body.aabb();
            return Physics.aabb.contains( aabb, point );
        };
    };

    /** hide
     * $and( first ) -> Function
     * - first (Function): First function node. `first.next` should have the next function, and so on.
     * 
     * Get an AND test function.
     **/
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

    /** hide
     * $or( first ) -> Function
     * - first (Function): First function node. `first.next` should have the next function, and so on.
     * 
     * Get an OR test function.
     **/
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
        ,$at: $at
    };

    /** related to: Physics.world#find
     * Physics.query( rules ) -> Function
     * - rules (Object): The mongodb-like search rules. (See description).
     * + (Function): The test function
     * 
     * Creates a function that can be used to perform tests on objects.
     *
     * The test function will return a [[Boolean]]; `true` if the object matches the tests.
     *
     * Query rules are mongodb-like. You can specify a hash of values to match like this:
     *
     * ```javascript
     * {
     *     foo: 'bar',
     *     baz: 2,
     *     some: {
     *         nested: 'value'
     *     }
     * }
     * ```
     *
     * And they will all need to match (it's an AND rule).
     *
     * You can also use operators for more versatility. The operators you can use include:
     *
     * - $eq: Test if some property is equal to a value (this is done by default, and is thus redundant)
     * - $ne: Test if some property is _NOT_ equal to a value
     * - $in: Test if some value (or array of values) is one of the specified array of values
     * - $nin: Test if some value (or array of values) is _NOT_ one of the specified array of values
     * - $at: Test if a body's [[Physics.aabb]] includes specified point. It's a primative hit-test.
     * 
     * Example:
     *
     * ```javascript
     * var wheelsArray = [];
     * 
     * var queryFn = Physics.query({
     *     name: 'circle', // only circles
     *     $nin: wheelsArray, // not in the wheelsArray
     *     labels: { $in: [ 'player', 'monster' ] } // that have player OR monster labels
     * });
     *
     * var obj = {
     *     name: 'circle',
     *     labels: [ 'round' ]
     * };
     *
     * queryFn( obj ); // -> false
     * // give it a player tag
     * obj.labels.push('player');
     * queryFn( obj ); // -> true
     * // put it inside the wheelsArray
     * wheelsArray.push( obj );
     * queryFn( obj ); // -> false
     * ```
     **/
    var Query = function Query( rules, /* internal use */ $op ){

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
                    
                    fn = Query( rules[ op ] );
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
                fn = Query( rule, op );
                
            } else if ( Physics.util.isPlainObject( rule ) ) {
                // it's an object so parse subrules
                fn = wrapRule( Query( rule ), op );
            } else {
                // simple equality rule
                fn = $eq( rule, op );
            }

            // if first hasn't been set yet, set it and start the list there
            // otherwise set the next node of the list
            list = list ? list.next = fn : first = fn;
        }

        // return the rules test
        return $and( first || fnTrue );
    };

    Physics.query = Query;

})(this);
