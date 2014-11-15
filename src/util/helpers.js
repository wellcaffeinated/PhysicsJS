/**
 * Physics.util.indexOf( arr, value ) -> Number
 * - arr (Array): The array to search
 * - value (Mixed): The value to find
 * + (Number): The index of `value` in the array OR `-1` if not found
 *
 * Fast indexOf implementation.
 **/
Physics.util.indexOf = function indexOf(arr, value) {
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


// http://jsperf.com/array-destroy/87
/**
 * Physics.util.clearArray( arr ) -> Array
 * - arr (Array): The array to clear
 * + (Array): The array passed in
 *
 * Quickly clear an array.
 **/
Physics.util.clearArray = function clearArray(arr){
    var l = arr.length;
    while( l-- ){
        arr.pop();
    }
    return arr;
};

/**
 * Physics.util.throttle( fn, delay ) -> Function
 * - fn (Function): The function to throttle
 * - delay (Number): Time in milliseconds
 *
 * Ensure a function is only called once every specified time span.
 **/
Physics.util.throttle = function throttle( fn, delay, scope ){
    var to
        ,call = false
        ,args
        ,cb = function(){
            clearTimeout( to );
            if ( call ){
                call = false;
                to = setTimeout(cb, delay);
                fn.apply(scope, args);
            } else {
                to = false;
            }
        }
        ;

    scope = scope || null;

    return function(){
        call = true;
        args = arguments;
        if ( !to ){
            cb();
        }
    };
};

/**
 * Physics.util.options( def[, target] ) -> Function
 * - def (Object): Default options to set
 * - target (Object): Where to copy the options to. Defaults to the returned function.
 * + (Function): The options function
 *
 * Options helper to keep track of options. Call it with a config object. Access options directly on the function.
 *
 * Example:
 *
 * ```javascript
 * this.options = Physics.util.options({ foo: 'bar', opt: 'def' });
 * this.options({ opt: 'myVal' });
 *
 * this.options.foo; // === 'bar'
 * this.options.def; // === 'myVal'
 *
 * // can also change defaults later
 * this.options.defaults({ foo: 'baz' });
 *
 * // can add a change callback
 * this.options.onChange(function( opts ){
 *     // some option changed
 *     // opts is the target
 * });
 * ```
 **/
// deep copy callback to extend deeper into options
var deepCopyFn = function( a, b ){

    if ( Physics.util.isPlainObject( b ) ){

        return Physics.util.extend({}, a, b, deepCopyFn );
    }

    return b !== undefined ? b : a;
};
Physics.util.options = function( def, target ){

    var _def = {}
        ,fn
        ,callbacks = []
        ;

    // set options
    fn = function fn( options, deep ){

        Physics.util.extend(target, options, deep ? deepCopyFn : null);
        for ( var i = 0, l = callbacks.length; i < l; ++i ){
            callbacks[ i ]( target );
        }
        return target;
    };

    // add defaults
    fn.defaults = function defaults( def, deep ){
        Physics.util.extend( _def, def, deep ? deepCopyFn : null );
        Physics.util.defaults( target, _def, deep ? deepCopyFn : null );
        return _def;
    };

    fn.onChange = function( cb ){
        callbacks.push( cb );
    };

    target = target || fn;

    fn.defaults( def );

    return fn;
};

/**
 * Physics.util.pairHash( id1, id2 ) -> Number
 * - id1 (Number): The id of the first thing
 * - id2 (Number): The id of the second thing
 * + (Number): A unique numeric hash (valid for values < 2^16)
 *
 * Generate a unique numeric hash from two input IDs.
 *
 * Useful for speedy indexing of pairs.
 **/
Physics.util.pairHash = function( id1, id2 ){
    id1 = id1|0;
    id2 = id2|0;

    if ( (id1|0) === (id2|0) ){

        return -1;
    }

    // valid for values < 2^16
    return ((id1|0) > (id2|0) ?
        (id1 << 16) | (id2 & 0xFFFF) :
        (id2 << 16) | (id1 & 0xFFFF))|0
        ;
};

/**
 * Physics.util.bind( fn, scope[, args... ] ) -> Function
 * - fn (Function): The function to bind scope to
 * - scope (Object): The scope to give to `fn`
 * - args (Mixed): Arguments to send to `fn`
 *
 * Bind a scope to a function.
 *
 * Basically the same functionality as [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
 **/
if ( !Function.prototype.bind ){
    Physics.util.bind = function( fn, scope, args ){
        args = Array.prototype.slice.call( arguments, 2 );
        return function(){
            return fn.apply( scope, args.concat( Array.prototype.slice.call(arguments) ) );
        };
    };
} else {
    Physics.util.bind = function( fn, scope, args ){
        args = Array.prototype.slice.call( arguments, 1 );
        return Function.prototype.bind.apply( fn, args );
    };
}

/**
 * Physics.util.find( collection, fn( value, index, collection ) ) -> Mixed
 * - collection (Array): Collection of values to test
 * - fn (Function): The test function
 * - value (Mixed): The value to test
 * - index (Number): The index of value in collection
 * - collection (Array): The input collection
 *
 * Test an array of values against a test function
 * and return the first value for which the function
 * returns true.
 **/
Physics.util.find = function( collection, fn ){
    var i
        ,l = collection.length
        ,val
        ;

    for ( i = 0; i < l; i++ ){
        val = collection[ i ];
        if ( fn( val, i, collection ) ){
            return val;
        }
    }
};

/**
 * Physics.util.filter( collection, fn( value, index, collection ) ) -> Array
 * - collection (Array): Collection of values to test
 * - fn (Function): The test function
 * - value (Mixed): The value to test
 * - index (Number): The index of value in collection
 * - collection (Array): The input collection
 *
 * Test an array of values against a test function
 * and return another array of values for which
 * the test function returns true.
 **/
Physics.util.filter = function( collection, fn ){
    var i
        ,l = collection.length
        ,val
        ,matches = []
        ;

    for ( i = 0; i < l; i++ ){
        val = collection[ i ];
        if ( fn( val, i, collection ) ){
            matches.push( val );
        }
    }

    return matches;
};

// lodash methods

(function(){
/*
 * @license
 * Modified version of:
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/* Used to determine if values are of the language type Object */
var objectTypes = {
  'boolean': false,
  'function': true,
  'object': true,
  'number': false,
  'string': false,
  'undefined': false
};
var identity = function(a){ return a; };
var arrayClass = '[object Array]';
var objectClass = '[object Object]';
var nativeKeys = Object.keys;
var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;
/* Used as the size when optimizations are enabled for large arrays */
var largeArraySize = 75;
/* Used to pool arrays and objects used internally */
var arrayPool = [],
    objectPool = [];
/* Used as the max size of the `arrayPool` and `objectPool` */
var maxPoolSize = 40;
var keyPrefix = +new Date() + '';

function releaseArray(array) {
  Physics.util.clearArray( array );
  if (arrayPool.length < maxPoolSize) {
    arrayPool.push(array);
  }
}

function releaseObject(object) {
  var cache = object.cache;
  if (cache) {
    releaseObject(cache);
  }
  object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
  if (objectPool.length < maxPoolSize) {
    objectPool.push(object);
  }
}

function getObject() {
  return objectPool.pop() || {
    'array': null,
    'cache': null,
    'criteria': null,
    'false': false,
    'index': 0,
    'null': false,
    'number': null,
    'object': null,
    'push': null,
    'string': null,
    'true': false,
    'undefined': false,
    'value': null
  };
}

function getArray() {
  return arrayPool.pop() || [];
}

function cacheIndexOf(cache, value) {
  var type = typeof value;
  cache = cache.cache;

  if (type === 'boolean' || value == null) {
    return cache[value] ? 0 : -1;
  }
  if (type !== 'number' && type !== 'string') {
    type = 'object';
  }
  var key = type === 'number' ? value : keyPrefix + value;
  cache = (cache = cache[type]) && cache[key];

  return type === 'object' ?
    (cache && Physics.util.indexOf(cache, value) > -1 ? 0 : -1) :
    (cache ? 0 : -1);
}

function cachePush(value) {
  var cache = this.cache,
      type = typeof value;

  if (type === 'boolean' || value == null) {
    cache[value] = true;
  } else {
    if (type !== 'number' && type !== 'string') {
      type = 'object';
    }
    var key = type === 'number' ? value : keyPrefix + value,
        typeCache = cache[type] || (cache[type] = {});

    if (type === 'object') {
      (typeCache[key] || (typeCache[key] = [])).push(value);
    } else {
      typeCache[key] = true;
    }
  }
}

function createCache(array) {
  var index = -1,
      length = array.length,
      first = array[0],
      mid = array[(length / 2) | 0],
      last = array[length - 1];

  if (first && typeof first === 'object' &&
      mid && typeof mid === 'object' && last && typeof last === 'object') {
    return false;
  }
  var cache = getObject();
  cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

  var result = getObject();
  result.array = array;
  result.cache = cache;
  result.push = cachePush;

  while (++index < length) {
    result.push(array[index]);
  }
  return result;
}

var shimKeys = function(object) {
  var index, iterable = object, result = [];
  if (!iterable){ return result; }
  if (!(objectTypes[typeof object])){ return result; }
    for (index in iterable) {
      if (hasOwnProperty.call(iterable, index)) {
        result.push(index);
      }
    }
  return result;
};

var keys = !nativeKeys ? shimKeys : function(object) {
  if (!Physics.util.isObject(object)) {
    return [];
  }
  return nativeKeys(object);
};

var idCounter = 0;
/**
 * Physics.util.uniqueId( [prefix] ) -> String
 * - prefix (String): Prefix to the id
 *
 * Generate a unique id, optionally prefixed.
 **/
Physics.util.uniqueId = function uniqueId(prefix) {
    var id = ++idCounter;
    return '' + (prefix || '') + id;
};

/*
 * The base implementation of `_.random` without argument juggling or support
 * for returning floating-point numbers.
 *
 * @private
 * @param {number} min The minimum possible value.
 * @param {number} max The maximum possible value.
 * @returns {number} Returns a random number.
 */
function baseRandom(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

/*
 * Creates an array of shuffled values, using a version of the Fisher-Yates
 * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
 *
 * @static
 * @memberOf _
 * @category Collections
 * @param {Array|Object|string} collection The collection to shuffle.
 * @returns {Array} Returns a new shuffled collection.
 * @example
 *
 * _.shuffle([1, 2, 3, 4, 5, 6]);
 * // => [4, 1, 6, 3, 5, 2]
 */
Physics.util.shuffle = function(collection) {
    var index = -1
        ,length = collection ? collection.length : 0
        ,result = Array(typeof length === 'number' ? length : 0)
        ,i
        ,l
        ,value
        ,rand
        ;

    for ( i = 0, l = collection.length; i < l; i++ ){
        value = collection[ i ];
        rand = baseRandom(0, ++index);
        result[index] = result[rand];
        result[rand] = value;
    }
    return result;
};

/**
 * Physics.util.isObject( val ) -> Boolean
 * - val (Mixed): The value to test
 *
 * Test if a value is an object.
 **/
Physics.util.isObject = function isObject(value) {
    // check if the value is the ECMAScript language type of Object
    // http://es5.github.io/#x8
    // and avoid a V8 bug
    // http://code.google.com/p/v8/issues/detail?id=2291
    return !!(value && objectTypes[typeof value]);
};

function isFunction(value) {
    return typeof value === 'function';
}

/**
 * Physics.util.isFunction( val ) -> Boolean
 * - val (Mixed): The value to test
 *
 * Test if a value is a function.
 **/
Physics.util.isFunction = isFunction;

/**
 * Physics.util.isArray( val ) -> Boolean
 * - val (Mixed): The value to test
 *
 * Test if a value is an array.
 **/
Physics.util.isArray = Array.isArray || function(value) {
  return value && typeof value === 'object' && typeof value.length === 'number' &&
    toString.call(value) === arrayClass || false;
};

var reNative = RegExp('^' +
  String(toString)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/toString| for [^\]]+/g, '.*?') + '$'
);
function isNative(value) {
  return typeof value === 'function' && reNative.test(value);
}

function shimIsPlainObject(value) {
  var ctor,
      result;

  // avoid non Object objects, `arguments` objects, and DOM elements
  if (!(value && toString.call(value) === objectClass) ||
      (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor))) {
    return false;
  }
  // In most environments an object's own properties are iterated before
  // its inherited properties. If the last iterated property is an object's
  // own property then there are no inherited enumerable properties.
  for (var key in value){
    result = key;
  }
  return typeof result === 'undefined' || hasOwnProperty.call(value, result);
}

/**
 * Physics.util.isPlainObject( val ) -> Boolean
 * - val (Mixed): The value to test
 *
 * Test if a value is a plain javascript object.
 **/
Physics.util.isPlainObject = !Object.getPrototypeOf ? shimIsPlainObject : function(value) {
  if (!(value && toString.call(value) === objectClass)) {
    return false;
  }
  var valueOf = value.valueOf,
      objProto = isNative(valueOf) && (objProto = Object.getPrototypeOf(valueOf)) && Object.getPrototypeOf(objProto);

  return objProto ?
    (value === objProto || Object.getPrototypeOf(value) === objProto) :
    shimIsPlainObject(value);
};

function baseUniq(array, isSorted, callback) {
  var index = -1,
      indexOf = Physics.util.indexOf,
      length = array ? array.length : 0,
      result = [];

  var isLarge = !isSorted && length >= largeArraySize && indexOf === Physics.util.indexOf,
      seen = (callback || isLarge) ? getArray() : result;

  if (isLarge) {
    var cache = createCache(seen);
    indexOf = cacheIndexOf;
    seen = cache;
  }
  while (++index < length) {
    var value = array[index],
        computed = callback ? callback(value, index, array) : value;

    if (isSorted ?
          !index || seen[seen.length - 1] !== computed :
          indexOf(seen, computed) < 0
        ) {
      if (callback || isLarge) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  if (isLarge) {
    releaseArray(seen.array);
    releaseObject(seen);
  } else if (callback) {
    releaseArray(seen);
  }
  return result;
}

/**
 * Physics.util.uniq( array, [isSorted, callback] ) -> Array
 * - array (Array): The array
 * - isSorted (Boolean): Flag to indicate the array is sorted
 * - callback (Function): Mapping function
 *
 * Create an array without duplicates.
 **/
Physics.util.uniq = function uniq(array, isSorted, callback) {
  // juggle arguments
  if (typeof isSorted !== 'boolean' && isSorted != null) {
    callback = isSorted;
    isSorted = false;
  }
  return baseUniq(array, isSorted, callback);
};

var assign = function(object, source, guard) {
  var index, iterable = object, result = iterable;
  if (!iterable) { return result; }
  var args = arguments,
      argsIndex = 0,
      callback,
      argsLength = typeof guard === 'number' ? 2 : args.length;
  if (argsLength > 2 && typeof args[argsLength - 1] === 'function') {
    callback = args[--argsLength];
  }
  while (++argsIndex < argsLength) {
    iterable = args[argsIndex];
    if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
        }
    }
  }
  return result;
};

/**
 * Physics.util.extend( object, source...[, callback] ) -> Object
 * - object (Object): The destination object
 * - source (Object): The source objects
 * - callback (Function): The function to customize assigning values
 *
 * Implementation of [lodash.extend](http://lodash.com/docs#assign)
 **/
Physics.util.extend = assign;

/**
 * Physics.util.defaults( object, source...[, callback] ) -> Object
 * - object (Object): The destination object
 * - source (Object): The source objects
 * - callback (Function): The function to customize assigning values
 *
 * Implementation of [lodash.defaults](http://lodash.com/docs#defaults).
 **/
Physics.util.defaults = function(object, source, guard) {
  var index, iterable = object, result = iterable;
  if (!iterable){ return result; }
  var args = arguments,
      argsIndex = 0,
      argsLength = typeof guard === 'number' ? 2 : args.length;
  while (++argsIndex < argsLength) {
    iterable = args[argsIndex];
    if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (typeof result[index] === 'undefined') {
              result[index] = iterable[index];
          }
        }
    }
  }
  return result;
};

/**
 * Physics.util.sortedIndex( array, value[, callback] ) -> Number
 * - array (Array): The array to inspect
 * - value (Mixed): The value to evaluate
 * - callback (Function): Function called per iteration
 *
 * Implementation of [lodash.sortedIndex](http://lodash.com/docs#sortedIndex).
 **/
Physics.util.sortedIndex = function sortedIndex(array, value, callback) {
  var low = 0,
      high = array ? array.length : low;

  // explicitly reference `identity` for better inlining in Firefox
  callback = callback || identity;
  value = callback(value);

  /* jshint -W030 */
  while (low < high) {
    var mid = (low + high) >>> 1;
    (callback(array[mid]) < value) ?
      low = mid + 1 :
      high = mid;
  }
  /* jshint +W030 */
  return low;
};

})();
