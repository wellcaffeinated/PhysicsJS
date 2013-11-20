/**
 * PhysicsJS v0.5.1 - 2013-09-15
 * A modular, extendable, and easy-to-use physics engine for javascript
 * http://wellcaffeinated.net/PhysicsJS
 *
 * Copyright (c) 2013 Jasper Palfree <jasper@wellcaffeinated.net>
 * Licensed MIT
 */

// ---
// inside: src/intro.js

(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. 
        module.exports = factory.call(root);
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function(){ return factory.call(root) });
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


// ---
// inside: lib/lodash.js

/**
 * @license
 * Lo-Dash 1.3.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash --silent --output /private/var/folders/bj/m9vc0qfj1_31x_scf7r6nq6r0000gn/T/lodash11386-39849-531ft0 exports="none" iife="(function(window){%output%;lodash.extend(Physics.util, lodash);}(this));" include="isObject, isFunction, isArray, isPlainObject, uniqueId, each, random, extend, clone, throttle, bind, sortedIndex, shuffle"`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.4.4 <http://underscorejs.org/>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
 * Available under MIT license <http://lodash.com/license>
 */
(function(window){

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Used to pool arrays and objects used internally */
  var arrayPool = [],
      objectPool = [];

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used internally to indicate various things */
  var indicatorObject = {};

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 75;

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /** Used to match HTML entities */
  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-7.8.6
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to detect functions containing a `this` reference */
  var reThis = (reThis = /\bthis\b/) && reThis.test(function() { return this; }) && reThis;

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to match HTML characters */
  var reUnescapedHtml = /[&<>"']/g;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to fix the JScript [[DontEnum]] bug */
  var shadowedProps = [
    'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
    'toLocaleString', 'toString', 'valueOf'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      errorClass = '[object Error]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Detect free variable `global`, from Node.js or Browserified code, and use it as `window` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    window = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets an object from the object pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Object} The object from the pool.
   */
  function getObject() {
    return objectPool.pop() || {
      'args': '',
      'array': null,
      'bottom': '',
      'cache': null,
      'false': false,
      'firstArg': '',
      'init': '',
      'leading': false,
      'loop': '',
      'maxWait': 0,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'shadowedProps': null,
      'string': null,
      'top': '',
      'trailing': false,
      'true': false,
      'undefined': false,
      'useHas': false,
      'useKeys': false
    };
  }

  /**
   * Checks if `value` is a DOM node in IE < 9.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the `value` is a DOM node, else `false`.
   */
  function isNode(value) {
    // IE < 9 presents DOM nodes as `Object` objects except they have `toString`
    // methods that are `typeof` "string" and still can coerce nodes to strings
    return typeof value.toString != 'function' && typeof (value + '') == 'string';
  }

  /**
   * A no-operation function.
   *
   * @private
   */
  function noop() {
    // no operation performed
  }

  /**
   * Releases the given `array` back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  /**
   * Releases the given `object` back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache =object.object = object.number = object.string =null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used, instead of `Array#slice`, to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|String} collection The collection to slice.
   * @param {Number} start The start index.
   * @param {Number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Used for native method references */
  var errorProto = Error.prototype,
      objectProto = Object.prototype,
      stringProto = String.prototype;

  /** Used to restore the original `_` reference in `noConflict` */
  var oldDash = window._;

  /** Used to detect if a method is native */
  var reNative = RegExp('^' +
    String(objectProto.valueOf)
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/valueOf|for [^\]]+/g, '.+?') + '$'
  );

  /** Native method shortcuts */
  var ceil = Math.ceil,
      clearTimeout = window.clearTimeout,
      concat = arrayRef.concat,
      floor = Math.floor,
      fnToString = Function.prototype.toString,
      getPrototypeOf = reNative.test(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
      hasOwnProperty = objectProto.hasOwnProperty,
      push = arrayRef.push,
      propertyIsEnumerable = objectProto.propertyIsEnumerable,
      setTimeout = window.setTimeout,
      toString = objectProto.toString;

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeBind = reNative.test(nativeBind = toString.bind) && nativeBind,
      nativeCreate = reNative.test(nativeCreate =  Object.create) && nativeCreate,
      nativeIsArray = reNative.test(nativeIsArray = Array.isArray) && nativeIsArray,
      nativeIsFinite = window.isFinite,
      nativeIsNaN = window.isNaN,
      nativeKeys = reNative.test(nativeKeys = Object.keys) && nativeKeys,
      nativeMax = Math.max,
      nativeMin = Math.min,
      nativeRandom = Math.random,
      nativeSlice = arrayRef.slice;

  /** Detect various environments */
  var isIeOpera = reNative.test(window.attachEvent),
      isV8 = nativeBind && !/\n|true/.test(nativeBind + isIeOpera);

  /** Used to lookup a built-in constructor by [[Class]] */
  var ctorByClass = {};
  ctorByClass[arrayClass] = Array;
  ctorByClass[boolClass] = Boolean;
  ctorByClass[dateClass] = Date;
  ctorByClass[funcClass] = Function;
  ctorByClass[objectClass] = Object;
  ctorByClass[numberClass] = Number;
  ctorByClass[regexpClass] = RegExp;
  ctorByClass[stringClass] = String;

  /** Used to avoid iterating non-enumerable properties in IE < 9 */
  var nonEnumProps = {};
  nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = { 'constructor': true, 'toLocaleString': true, 'toString': true, 'valueOf': true };
  nonEnumProps[boolClass] = nonEnumProps[stringClass] = { 'constructor': true, 'toString': true, 'valueOf': true };
  nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = { 'constructor': true, 'toString': true };
  nonEnumProps[objectClass] = { 'constructor': true };

  (function() {
    var length = shadowedProps.length;
    while (length--) {
      var prop = shadowedProps[length];
      for (var className in nonEnumProps) {
        if (hasOwnProperty.call(nonEnumProps, className) && !hasOwnProperty.call(nonEnumProps[className], prop)) {
          nonEnumProps[className][prop] = false;
        }
      }
    }
  }());

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a `lodash` object, which wraps the given `value`, to enable method
   * chaining.
   *
   * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
   * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
   * and `unshift`
   *
   * Chaining is supported in custom builds as long as the `value` method is
   * implicitly or explicitly included in the build.
   *
   * The chainable wrapper functions are:
   * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
   * `compose`, `concat`, `countBy`, `createCallback`, `debounce`, `defaults`,
   * `defer`, `delay`, `difference`, `filter`, `flatten`, `forEach`, `forIn`,
   * `forOwn`, `functions`, `groupBy`, `initial`, `intersection`, `invert`,
   * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
   * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `push`, `range`,
   * `reject`, `rest`, `reverse`, `shuffle`, `slice`, `sort`, `sortBy`, `splice`,
   * `tap`, `throttle`, `times`, `toArray`, `transform`, `union`, `uniq`, `unshift`,
   * `unzip`, `values`, `where`, `without`, `wrap`, and `zip`
   *
   * The non-chainable wrapper functions are:
   * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `has`,
   * `identity`, `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`,
   * `isElement`, `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`,
   * `isNull`, `isNumber`, `isObject`, `isPlainObject`, `isRegExp`, `isString`,
   * `isUndefined`, `join`, `lastIndexOf`, `mixin`, `noConflict`, `parseInt`,
   * `pop`, `random`, `reduce`, `reduceRight`, `result`, `shift`, `size`, `some`,
   * `sortedIndex`, `runInContext`, `template`, `unescape`, `uniqueId`, and `value`
   *
   * The wrapper functions `first` and `last` return wrapped values when `n` is
   * passed, otherwise they return unwrapped values.
   *
   * @name _
   * @constructor
   * @alias chain
   * @category Chaining
   * @param {Mixed} value The value to wrap in a `lodash` instance.
   * @returns {Object} Returns a `lodash` instance.
   * @example
   *
   * var wrapped = _([1, 2, 3]);
   *
   * // returns an unwrapped value
   * wrapped.reduce(function(sum, num) {
   *   return sum + num;
   * });
   * // => 6
   *
   * // returns a wrapped value
   * var squares = wrapped.map(function(num) {
   *   return num * num;
   * });
   *
   * _.isArray(squares);
   * // => false
   *
   * _.isArray(squares.value());
   * // => true
   */
  function lodash() {
    // no operation performed
  }

  /**
   * An object used to flag environments features.
   *
   * @static
   * @memberOf _
   * @type Object
   */
  var support = lodash.support = {};

  (function() {
    var ctor = function() { this.x = 1; },
        props = [];

    ctor.prototype = { 'valueOf': 1, 'y': 1 };
    for (var prop in new ctor) { props.push(prop); }
    for (prop in arguments) { }

    /**
     * Detect if `arguments` objects are `Object` objects (all but Narwhal and Opera < 10.5).
     *
     * @memberOf _.support
     * @type Boolean
     */
    support.argsObject = arguments.constructor == Object && !(arguments instanceof Array);

    /**
     * Detect if an `arguments` object's [[Class]] is resolvable (all but Firefox < 4, IE < 9).
     *
     * @memberOf _.support
     * @type Boolean
     */
    support.argsClass = isArguments(arguments);

    /**
     * Detect if `name` or `message` properties of `Error.prototype` are
     * enumerable by default. (IE < 9, Safari < 5.1)
     *
     * @memberOf _.support
     * @type Boolean
     */
    support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');

    /**
     * Detect if `prototype` properties are enumerable by default.
     *
     * Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
     * (if the prototype or a property on the prototype has been set)
     * incorrectly sets a function's `prototype` property [[Enumerable]]
     * value to `true`.
     *
     * @memberOf _.support
     * @type Boolean
     */
    support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');

    /**
     * Detect if `Function#bind` exists and is inferred to be fast (all but V8).
     *
     * @memberOf _.support
     * @type Boolean
     */
    support.fastBind = nativeBind && !isV8;

    /**
     * Detect if own properties are iterated after inherited properties (all but IE < 9).
     *
     * @memberOf _.support
     * @type Boolean
     */
    support.ownLast = props[0] != 'x';

    /**
     * Detect if `arguments` object indexes are non-enumerable
     * (Firefox < 4, IE < 9, PhantomJS, Safari < 5.1).
     *
     * @memberOf _.support
     * @type Boolean
     */
    support.nonEnumArgs = prop != 0;

    /**
     * Detect if properties shadowing those on `Object.prototype` are non-enumerable.
     *
     * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
     * made non-enumerable as well (a.k.a the JScript [[DontEnum]] bug).
     *
     * @memberOf _.support
     * @type Boolean
     */
    support.nonEnumShadows = !/valueOf/.test(props);

    /**
     * Detect lack of support for accessing string characters by index.
     *
     * IE < 8 can't access characters by index and IE 8 can only access
     * characters by index on string literals.
     *
     * @memberOf _.support
     * @type Boolean
     */
    support.unindexedChars = ('x'[0] + Object('x')[0]) != 'xx';

    /**
     * Detect if a DOM node's [[Class]] is resolvable (all but IE < 9)
     * and that the JS engine errors when attempting to coerce an object to
     * a string without a `toString` function.
     *
     * @memberOf _.support
     * @type Boolean
     */
    try {
      support.nodeClass = !(toString.call(document) == objectClass && !({ 'toString': 0 } + ''));
    } catch(e) {
      support.nodeClass = true;
    }
  }(1));

  /*--------------------------------------------------------------------------*/

  /**
   * The template used to create iterator functions.
   *
   * @private
   * @param {Object} data The data object used to populate the text.
   * @returns {String} Returns the interpolated text.
   */
  var iteratorTemplate = function(obj) {

    var __p = 'var index, iterable = ' +
    (obj.firstArg) +
    ', result = ' +
    (obj.init) +
    ';\nif (!iterable) return result;\n' +
    (obj.top) +
    ';';
     if (obj.array) {
    __p += '\nvar length = iterable.length; index = -1;\nif (' +
    (obj.array) +
    ') {  ';
     if (support.unindexedChars) {
    __p += '\n  if (isString(iterable)) {\n    iterable = iterable.split(\'\')\n  }  ';
     }
    __p += '\n  while (++index < length) {\n    ' +
    (obj.loop) +
    ';\n  }\n}\nelse {  ';
     } else if (support.nonEnumArgs) {
    __p += '\n  var length = iterable.length; index = -1;\n  if (length && isArguments(iterable)) {\n    while (++index < length) {\n      index += \'\';\n      ' +
    (obj.loop) +
    ';\n    }\n  } else {  ';
     }

     if (support.enumPrototypes) {
    __p += '\n  var skipProto = typeof iterable == \'function\';\n  ';
     }

     if (support.enumErrorProps) {
    __p += '\n  var skipErrorProps = iterable === errorProto || iterable instanceof Error;\n  ';
     }

        var conditions = [];    if (support.enumPrototypes) { conditions.push('!(skipProto && index == "prototype")'); }    if (support.enumErrorProps)  { conditions.push('!(skipErrorProps && (index == "message" || index == "name"))'); }

     if (obj.useHas && obj.useKeys) {
    __p += '\n  var ownIndex = -1,\n      ownProps = objectTypes[typeof iterable] && keys(iterable),\n      length = ownProps ? ownProps.length : 0;\n\n  while (++ownIndex < length) {\n    index = ownProps[ownIndex];\n';
        if (conditions.length) {
    __p += '    if (' +
    (conditions.join(' && ')) +
    ') {\n  ';
     }
    __p += 
    (obj.loop) +
    ';    ';
     if (conditions.length) {
    __p += '\n    }';
     }
    __p += '\n  }  ';
     } else {
    __p += '\n  for (index in iterable) {\n';
        if (obj.useHas) { conditions.push("hasOwnProperty.call(iterable, index)"); }    if (conditions.length) {
    __p += '    if (' +
    (conditions.join(' && ')) +
    ') {\n  ';
     }
    __p += 
    (obj.loop) +
    ';    ';
     if (conditions.length) {
    __p += '\n    }';
     }
    __p += '\n  }    ';
     if (support.nonEnumShadows) {
    __p += '\n\n  if (iterable !== objectProto) {\n    var ctor = iterable.constructor,\n        isProto = iterable === (ctor && ctor.prototype),\n        className = iterable === stringProto ? stringClass : iterable === errorProto ? errorClass : toString.call(iterable),\n        nonEnum = nonEnumProps[className];\n      ';
     for (k = 0; k < 7; k++) {
    __p += '\n    index = \'' +
    (obj.shadowedProps[k]) +
    '\';\n    if ((!(isProto && nonEnum[index]) && hasOwnProperty.call(iterable, index))';
            if (!obj.useHas) {
    __p += ' || (!nonEnum[index] && iterable[index] !== objectProto[index])';
     }
    __p += ') {\n      ' +
    (obj.loop) +
    ';\n    }      ';
     }
    __p += '\n  }    ';
     }

     }

     if (obj.array || support.nonEnumArgs) {
    __p += '\n}';
     }
    __p += 
    (obj.bottom) +
    ';\nreturn result';

    return __p
  };

  /** Reusable iterator options for `assign` and `defaults` */
  var defaultsIteratorOptions = {
    'args': 'object, source, guard',
    'top':
      'var args = arguments,\n' +
      '    argsIndex = 0,\n' +
      "    argsLength = typeof guard == 'number' ? 2 : args.length;\n" +
      'while (++argsIndex < argsLength) {\n' +
      '  iterable = args[argsIndex];\n' +
      '  if (iterable && objectTypes[typeof iterable]) {',
    'loop': "if (typeof result[index] == 'undefined') result[index] = iterable[index]",
    'bottom': '  }\n}'
  };

  /** Reusable iterator options shared by `each`, `forIn`, and `forOwn` */
  var eachIteratorOptions = {
    'args': 'collection, callback, thisArg',
    'top': "callback = callback && typeof thisArg == 'undefined' ? callback : lodash.createCallback(callback, thisArg)",
    'array': "typeof length == 'number'",
    'loop': 'if (callback(iterable[index], index, collection) === false) return result'
  };

  /** Reusable iterator options for `forIn` and `forOwn` */
  var forOwnIteratorOptions = {
    'top': 'if (!objectTypes[typeof iterable]) return result;\n' + eachIteratorOptions.top,
    'array': false
  };

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a function that, when called, invokes `func` with the `this` binding
   * of `thisArg` and prepends any `partialArgs` to the arguments passed to the
   * bound function.
   *
   * @private
   * @param {Function|String} func The function to bind or the method name.
   * @param {Mixed} [thisArg] The `this` binding of `func`.
   * @param {Array} partialArgs An array of arguments to be partially applied.
   * @param {Object} [idicator] Used to indicate binding by key or partially
   *  applying arguments from the right.
   * @returns {Function} Returns the new bound function.
   */
  function createBound(func, thisArg, partialArgs, indicator) {
    var isFunc = isFunction(func),
        isPartial = !partialArgs,
        key = thisArg;

    // juggle arguments
    if (isPartial) {
      var rightIndicator = indicator;
      partialArgs = thisArg;
    }
    else if (!isFunc) {
      if (!indicator) {
        throw new TypeError;
      }
      thisArg = func;
    }

    function bound() {
      // `Function#bind` spec
      // http://es5.github.com/#x15.3.4.5
      var args = arguments,
          thisBinding = isPartial ? this : thisArg;

      if (!isFunc) {
        func = thisArg[key];
      }
      if (partialArgs.length) {
        args = args.length
          ? (args = nativeSlice.call(args), rightIndicator ? args.concat(partialArgs) : partialArgs.concat(args))
          : partialArgs;
      }
      if (this instanceof bound) {
        // ensure `new bound` is an instance of `func`
        thisBinding = createObject(func.prototype);

        // mimic the constructor's `return` behavior
        // http://es5.github.com/#x13.2.2
        var result = func.apply(thisBinding, args);
        return isObject(result) ? result : thisBinding;
      }
      return func.apply(thisBinding, args);
    }
    return bound;
  }

  /**
   * Creates compiled iteration functions.
   *
   * @private
   * @param {Object} [options1, options2, ...] The compile options object(s).
   *  array - A string of code to determine if the iterable is an array or array-like.
   *  useHas - A boolean to specify using `hasOwnProperty` checks in the object loop.
   *  useKeys - A boolean to specify using `_.keys` for own property iteration.
   *  args - A string of comma separated arguments the iteration function will accept.
   *  top - A string of code to execute before the iteration branches.
   *  loop - A string of code to execute in the object loop.
   *  bottom - A string of code to execute after the iteration branches.
   * @returns {Function} Returns the compiled function.
   */
  function createIterator() {
    var data = getObject();

    // data properties
    data.shadowedProps = shadowedProps;
    // iterator options
    data.array = data.bottom = data.loop = data.top = '';
    data.init = 'iterable';
    data.useHas = true;
    data.useKeys = !!keys;

    // merge options into a template data object
    for (var object, index = 0; object = arguments[index]; index++) {
      for (var key in object) {
        data[key] = object[key];
      }
    }
    var args = data.args;
    data.firstArg = /^[^,]+/.exec(args)[0];

    // create the function factory
    var factory = Function(
        'errorClass, errorProto, hasOwnProperty, isArguments, isArray, ' +
        'isString, keys, lodash, objectProto, objectTypes, nonEnumProps, ' +
        'stringClass, stringProto, toString',
      'return function(' + args + ') {\n' + iteratorTemplate(data) + '\n}'
    );

    releaseObject(data);

    // return the compiled function
    return factory(
      errorClass, errorProto, hasOwnProperty, isArguments, isArray,
      isString, keys, lodash, objectProto, objectTypes, nonEnumProps,
      stringClass, stringProto, toString
    );
  }

  /**
   * Creates a new object with the specified `prototype`.
   *
   * @private
   * @param {Object} prototype The prototype object.
   * @returns {Object} Returns the new object.
   */
  function createObject(prototype) {
    return isObject(prototype) ? nativeCreate(prototype) : {};
  }
  // fallback for browsers without `Object.create`
  if  (!nativeCreate) {
    var createObject = function(prototype) {
      if (isObject(prototype)) {
        noop.prototype = prototype;
        var result = new noop;
        noop.prototype = null;
      }
      return result || {};
    };
  }

  /**
   * A fallback implementation of `isPlainObject` which checks if a given `value`
   * is an object created by the `Object` constructor, assuming objects created
   * by the `Object` constructor have no inherited enumerable properties and that
   * there are no `Object.prototype` extensions.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true`, if `value` is a plain object, else `false`.
   */
  function shimIsPlainObject(value) {
    var ctor,
        result;

    // avoid non Object objects, `arguments` objects, and DOM elements
    if (!(value && toString.call(value) == objectClass) ||
        (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor)) ||
        (!support.argsClass && isArguments(value)) ||
        (!support.nodeClass && isNode(value))) {
      return false;
    }
    // IE < 9 iterates inherited properties before own properties. If the first
    // iterated property is an object's own property then there are no inherited
    // enumerable properties.
    if (support.ownLast) {
      forIn(value, function(value, key, object) {
        result = hasOwnProperty.call(object, key);
        return false;
      });
      return result !== false;
    }
    // In most environments an object's own properties are iterated before
    // its inherited properties. If the last iterated property is an object's
    // own property then there are no inherited enumerable properties.
    forIn(value, function(value, key) {
      result = key;
    });
    return result === undefined || hasOwnProperty.call(value, result);
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Checks if `value` is an `arguments` object.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true`, if the `value` is an `arguments` object, else `false`.
   * @example
   *
   * (function() { return _.isArguments(arguments); })(1, 2, 3);
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  function isArguments(value) {
    return toString.call(value) == argsClass;
  }
  // fallback for browsers that can't detect `arguments` objects by [[Class]]
  if (!support.argsClass) {
    isArguments = function(value) {
      return value ? hasOwnProperty.call(value, 'callee') : false;
    };
  }

  /**
   * Checks if `value` is an array.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true`, if the `value` is an array, else `false`.
   * @example
   *
   * (function() { return _.isArray(arguments); })();
   * // => false
   *
   * _.isArray([1, 2, 3]);
   * // => true
   */
  var isArray = nativeIsArray || function(value) {
    return value ? (typeof value == 'object' && toString.call(value) == arrayClass) : false;
  };

  /**
   * A fallback implementation of `Object.keys` which produces an array of the
   * given object's own enumerable property names.
   *
   * @private
   * @type Function
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns a new array of property names.
   */
  var shimKeys = createIterator({
    'args': 'object',
    'init': '[]',
    'top': 'if (!(objectTypes[typeof object])) return result',
    'loop': 'result.push(index)'
  });

  /**
   * Creates an array composed of the own enumerable property names of `object`.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns a new array of property names.
   * @example
   *
   * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
   * // => ['one', 'two', 'three'] (order is not guaranteed)
   */
  var keys = !nativeKeys ? shimKeys : function(object) {
    if (!isObject(object)) {
      return [];
    }
    if ((support.enumPrototypes && typeof object == 'function') ||
        (support.nonEnumArgs && object.length && isArguments(object))) {
      return shimKeys(object);
    }
    return nativeKeys(object);
  };

  /**
   * A function compiled to iterate `arguments` objects, arrays, objects, and
   * strings consistenly across environments, executing the `callback` for each
   * element in the `collection`. The `callback` is bound to `thisArg` and invoked
   * with three arguments; (value, index|key, collection). Callbacks may exit
   * iteration early by explicitly returning `false`.
   *
   * @private
   * @type Function
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Array|Object|String} Returns `collection`.
   */
  var basicEach = createIterator(eachIteratorOptions);

  /*--------------------------------------------------------------------------*/

  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object. Subsequent sources will overwrite property assignments of previous
   * sources. If a `callback` function is passed, it will be executed to produce
   * the assigned values. The `callback` is bound to `thisArg` and invoked with
   * two arguments; (objectValue, sourceValue).
   *
   * @static
   * @memberOf _
   * @type Function
   * @alias extend
   * @category Objects
   * @param {Object} object The destination object.
   * @param {Object} [source1, source2, ...] The source objects.
   * @param {Function} [callback] The function to customize assigning values.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns the destination object.
   * @example
   *
   * _.assign({ 'name': 'moe' }, { 'age': 40 });
   * // => { 'name': 'moe', 'age': 40 }
   *
   * var defaults = _.partialRight(_.assign, function(a, b) {
   *   return typeof a == 'undefined' ? b : a;
   * });
   *
   * var food = { 'name': 'apple' };
   * defaults(food, { 'name': 'banana', 'type': 'fruit' });
   * // => { 'name': 'apple', 'type': 'fruit' }
   */
  var assign = createIterator(defaultsIteratorOptions, {
    'top':
      defaultsIteratorOptions.top.replace(';',
        ';\n' +
        "if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {\n" +
        '  var callback = lodash.createCallback(args[--argsLength - 1], args[argsLength--], 2);\n' +
        "} else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {\n" +
        '  callback = args[--argsLength];\n' +
        '}'
      ),
    'loop': 'result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]'
  });

  /**
   * Creates a clone of `value`. If `deep` is `true`, nested objects will also
   * be cloned, otherwise they will be assigned by reference. If a `callback`
   * function is passed, it will be executed to produce the cloned values. If
   * `callback` returns `undefined`, cloning will be handled by the method instead.
   * The `callback` is bound to `thisArg` and invoked with one argument; (value).
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to clone.
   * @param {Boolean} [deep=false] A flag to indicate a deep clone.
   * @param {Function} [callback] The function to customize cloning values.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @param- {Array} [stackA=[]] Tracks traversed source objects.
   * @param- {Array} [stackB=[]] Associates clones with source counterparts.
   * @returns {Mixed} Returns the cloned `value`.
   * @example
   *
   * var stooges = [
   *   { 'name': 'moe', 'age': 40 },
   *   { 'name': 'larry', 'age': 50 }
   * ];
   *
   * var shallow = _.clone(stooges);
   * shallow[0] === stooges[0];
   * // => true
   *
   * var deep = _.clone(stooges, true);
   * deep[0] === stooges[0];
   * // => false
   *
   * _.mixin({
   *   'clone': _.partialRight(_.clone, function(value) {
   *     return _.isElement(value) ? value.cloneNode(false) : undefined;
   *   })
   * });
   *
   * var clone = _.clone(document.body);
   * clone.childNodes.length;
   * // => 0
   */
  function clone(value, deep, callback, thisArg, stackA, stackB) {
    var result = value;

    // allows working with "Collections" methods without using their `callback`
    // argument, `index|key`, for this method's `callback`
    if (typeof deep != 'boolean' && deep != null) {
      thisArg = callback;
      callback = deep;
      deep = false;
    }
    if (typeof callback == 'function') {
      callback = (typeof thisArg == 'undefined')
        ? callback
        : lodash.createCallback(callback, thisArg, 1);

      result = callback(result);
      if (typeof result != 'undefined') {
        return result;
      }
      result = value;
    }
    // inspect [[Class]]
    var isObj = isObject(result);
    if (isObj) {
      var className = toString.call(result);
      if (!cloneableClasses[className] || (!support.nodeClass && isNode(result))) {
        return result;
      }
      var isArr = isArray(result);
    }
    // shallow clone
    if (!isObj || !deep) {
      return isObj
        ? (isArr ? slice(result) : assign({}, result))
        : result;
    }
    var ctor = ctorByClass[className];
    switch (className) {
      case boolClass:
      case dateClass:
        return new ctor(+result);

      case numberClass:
      case stringClass:
        return new ctor(result);

      case regexpClass:
        return ctor(result.source, reFlags.exec(result));
    }
    // check for circular references and return corresponding clone
    var initedStack = !stackA;
    stackA || (stackA = getArray());
    stackB || (stackB = getArray());

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == value) {
        return stackB[length];
      }
    }
    // init cloned object
    result = isArr ? ctor(result.length) : {};

    // add array properties assigned by `RegExp#exec`
    if (isArr) {
      if (hasOwnProperty.call(value, 'index')) {
        result.index = value.index;
      }
      if (hasOwnProperty.call(value, 'input')) {
        result.input = value.input;
      }
    }
    // add the source value to the stack of traversed objects
    // and associate it with its clone
    stackA.push(value);
    stackB.push(result);

    // recursively populate clone (susceptible to call stack limits)
    (isArr ? basicEach : forOwn)(value, function(objValue, key) {
      result[key] = clone(objValue, deep, callback, undefined, stackA, stackB);
    });

    if (initedStack) {
      releaseArray(stackA);
      releaseArray(stackB);
    }
    return result;
  }

  /**
   * Iterates over `object`'s own and inherited enumerable properties, executing
   * the `callback` for each property. The `callback` is bound to `thisArg` and
   * invoked with three arguments; (value, key, object). Callbacks may exit iteration
   * early by explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * function Dog(name) {
   *   this.name = name;
   * }
   *
   * Dog.prototype.bark = function() {
   *   alert('Woof, woof!');
   * };
   *
   * _.forIn(new Dog('Dagny'), function(value, key) {
   *   alert(key);
   * });
   * // => alerts 'name' and 'bark' (order is not guaranteed)
   */
  var forIn = createIterator(eachIteratorOptions, forOwnIteratorOptions, {
    'useHas': false
  });

  /**
   * Iterates over an object's own enumerable properties, executing the `callback`
   * for each property. The `callback` is bound to `thisArg` and invoked with three
   * arguments; (value, key, object). Callbacks may exit iteration early by explicitly
   * returning `false`.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
   *   alert(key);
   * });
   * // => alerts '0', '1', and 'length' (order is not guaranteed)
   */
  var forOwn = createIterator(eachIteratorOptions, forOwnIteratorOptions);

  /**
   * Performs a deep comparison between two values to determine if they are
   * equivalent to each other. If `callback` is passed, it will be executed to
   * compare values. If `callback` returns `undefined`, comparisons will be handled
   * by the method instead. The `callback` is bound to `thisArg` and invoked with
   * two arguments; (a, b).
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} a The value to compare.
   * @param {Mixed} b The other value to compare.
   * @param {Function} [callback] The function to customize comparing values.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @param- {Array} [stackA=[]] Tracks traversed `a` objects.
   * @param- {Array} [stackB=[]] Tracks traversed `b` objects.
   * @returns {Boolean} Returns `true`, if the values are equivalent, else `false`.
   * @example
   *
   * var moe = { 'name': 'moe', 'age': 40 };
   * var copy = { 'name': 'moe', 'age': 40 };
   *
   * moe == copy;
   * // => false
   *
   * _.isEqual(moe, copy);
   * // => true
   *
   * var words = ['hello', 'goodbye'];
   * var otherWords = ['hi', 'goodbye'];
   *
   * _.isEqual(words, otherWords, function(a, b) {
   *   var reGreet = /^(?:hello|hi)$/i,
   *       aGreet = _.isString(a) && reGreet.test(a),
   *       bGreet = _.isString(b) && reGreet.test(b);
   *
   *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
   * });
   * // => true
   */
  function isEqual(a, b, callback, thisArg, stackA, stackB) {
    // used to indicate that when comparing objects, `a` has at least the properties of `b`
    var whereIndicator = callback === indicatorObject;
    if (typeof callback == 'function' && !whereIndicator) {
      callback = lodash.createCallback(callback, thisArg, 2);
      var result = callback(a, b);
      if (typeof result != 'undefined') {
        return !!result;
      }
    }
    // exit early for identical values
    if (a === b) {
      // treat `+0` vs. `-0` as not equal
      return a !== 0 || (1 / a == 1 / b);
    }
    var type = typeof a,
        otherType = typeof b;

    // exit early for unlike primitive values
    if (a === a &&
        (!a || (type != 'function' && type != 'object')) &&
        (!b || (otherType != 'function' && otherType != 'object'))) {
      return false;
    }
    // exit early for `null` and `undefined`, avoiding ES3's Function#call behavior
    // http://es5.github.com/#x15.3.4.4
    if (a == null || b == null) {
      return a === b;
    }
    // compare [[Class]] names
    var className = toString.call(a),
        otherClass = toString.call(b);

    if (className == argsClass) {
      className = objectClass;
    }
    if (otherClass == argsClass) {
      otherClass = objectClass;
    }
    if (className != otherClass) {
      return false;
    }
    switch (className) {
      case boolClass:
      case dateClass:
        // coerce dates and booleans to numbers, dates to milliseconds and booleans
        // to `1` or `0`, treating invalid dates coerced to `NaN` as not equal
        return +a == +b;

      case numberClass:
        // treat `NaN` vs. `NaN` as equal
        return (a != +a)
          ? b != +b
          // but treat `+0` vs. `-0` as not equal
          : (a == 0 ? (1 / a == 1 / b) : a == +b);

      case regexpClass:
      case stringClass:
        // coerce regexes to strings (http://es5.github.com/#x15.10.6.4)
        // treat string primitives and their corresponding object instances as equal
        return a == String(b);
    }
    var isArr = className == arrayClass;
    if (!isArr) {
      // unwrap any `lodash` wrapped values
      if (hasOwnProperty.call(a, '__wrapped__ ') || hasOwnProperty.call(b, '__wrapped__')) {
        return isEqual(a.__wrapped__ || a, b.__wrapped__ || b, callback, thisArg, stackA, stackB);
      }
      // exit for functions and DOM nodes
      if (className != objectClass || (!support.nodeClass && (isNode(a) || isNode(b)))) {
        return false;
      }
      // in older versions of Opera, `arguments` objects have `Array` constructors
      var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,
          ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;

      // non `Object` object instances with different constructors are not equal
      if (ctorA != ctorB && !(
            isFunction(ctorA) && ctorA instanceof ctorA &&
            isFunction(ctorB) && ctorB instanceof ctorB
          )) {
        return false;
      }
    }
    // assume cyclic structures are equal
    // the algorithm for detecting cyclic structures is adapted from ES 5.1
    // section 15.12.3, abstract operation `JO` (http://es5.github.com/#x15.12.3)
    var initedStack = !stackA;
    stackA || (stackA = getArray());
    stackB || (stackB = getArray());

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == a) {
        return stackB[length] == b;
      }
    }
    var size = 0;
    result = true;

    // add `a` and `b` to the stack of traversed objects
    stackA.push(a);
    stackB.push(b);

    // recursively compare objects and arrays (susceptible to call stack limits)
    if (isArr) {
      length = a.length;
      size = b.length;

      // compare lengths to determine if a deep comparison is necessary
      result = size == a.length;
      if (!result && !whereIndicator) {
        return result;
      }
      // deep compare the contents, ignoring non-numeric properties
      while (size--) {
        var index = length,
            value = b[size];

        if (whereIndicator) {
          while (index--) {
            if ((result = isEqual(a[index], value, callback, thisArg, stackA, stackB))) {
              break;
            }
          }
        } else if (!(result = isEqual(a[size], value, callback, thisArg, stackA, stackB))) {
          break;
        }
      }
      return result;
    }
    // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
    // which, in this case, is more costly
    forIn(b, function(value, key, b) {
      if (hasOwnProperty.call(b, key)) {
        // count the number of properties.
        size++;
        // deep compare each property value.
        return (result = hasOwnProperty.call(a, key) && isEqual(a[key], value, callback, thisArg, stackA, stackB));
      }
    });

    if (result && !whereIndicator) {
      // ensure both objects have the same number of properties
      forIn(a, function(value, key, a) {
        if (hasOwnProperty.call(a, key)) {
          // `size` will be `-1` if `a` has more properties than `b`
          return (result = --size > -1);
        }
      });
    }
    if (initedStack) {
      releaseArray(stackA);
      releaseArray(stackB);
    }
    return result;
  }

  /**
   * Checks if `value` is a function.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true`, if the `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   */
  function isFunction(value) {
    return typeof value == 'function';
  }
  // fallback for older versions of Chrome and Safari
  if (isFunction(/x/)) {
    isFunction = function(value) {
      return typeof value == 'function' && toString.call(value) == funcClass;
    };
  }

  /**
   * Checks if `value` is the language type of Object.
   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true`, if the `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(1);
   * // => false
   */
  function isObject(value) {
    // check if the value is the ECMAScript language type of Object
    // http://es5.github.com/#x8
    // and avoid a V8 bug
    // http://code.google.com/p/v8/issues/detail?id=2291
    return !!(value && objectTypes[typeof value]);
  }

  /**
   * Checks if a given `value` is an object created by the `Object` constructor.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true`, if `value` is a plain object, else `false`.
   * @example
   *
   * function Stooge(name, age) {
   *   this.name = name;
   *   this.age = age;
   * }
   *
   * _.isPlainObject(new Stooge('moe', 40));
   * // => false
   *
   * _.isPlainObject([1, 2, 3]);
   * // => false
   *
   * _.isPlainObject({ 'name': 'moe', 'age': 40 });
   * // => true
   */
  var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
    if (!(value && toString.call(value) == objectClass) || (!support.argsClass && isArguments(value))) {
      return false;
    }
    var valueOf = value.valueOf,
        objProto = typeof valueOf == 'function' && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

    return objProto
      ? (value == objProto || getPrototypeOf(value) == objProto)
      : shimIsPlainObject(value);
  };

  /**
   * Checks if `value` is a string.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true`, if the `value` is a string, else `false`.
   * @example
   *
   * _.isString('moe');
   * // => true
   */
  function isString(value) {
    return typeof value == 'string' || toString.call(value) == stringClass;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Iterates over a `collection`, executing the `callback` for each element in
   * the `collection`. The `callback` is bound to `thisArg` and invoked with three
   * arguments; (value, index|key, collection). Callbacks may exit iteration early
   * by explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @alias each
   * @category Collections
   * @param {Array|Object|String} collection The collection to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Array|Object|String} Returns `collection`.
   * @example
   *
   * _([1, 2, 3]).forEach(alert).join(',');
   * // => alerts each number and returns '1,2,3'
   *
   * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, alert);
   * // => alerts each number value (order is not guaranteed)
   */
  function forEach(collection, callback, thisArg) {
    if (callback && typeof thisArg == 'undefined' && isArray(collection)) {
      var index = -1,
          length = collection.length;

      while (++index < length) {
        if (callback(collection[index], index, collection) === false) {
          break;
        }
      }
    } else {
      basicEach(collection, callback, thisArg);
    }
    return collection;
  }

  /**
   * Creates an array of shuffled `array` values, using a version of the
   * Fisher-Yates shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|String} collection The collection to shuffle.
   * @returns {Array} Returns a new shuffled collection.
   * @example
   *
   * _.shuffle([1, 2, 3, 4, 5, 6]);
   * // => [4, 1, 6, 3, 5, 2]
   */
  function shuffle(collection) {
    var index = -1,
        length = collection ? collection.length : 0,
        result = Array(typeof length == 'number' ? length : 0);

    forEach(collection, function(value) {
      var rand = floor(nativeRandom() * (++index + 1));
      result[index] = result[rand];
      result[rand] = value;
    });
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Uses a binary search to determine the smallest index at which the `value`
   * should be inserted into `array` in order to maintain the sort order of the
   * sorted `array`. If `callback` is passed, it will be executed for `value` and
   * each element in `array` to compute their sort ranking. The `callback` is
   * bound to `thisArg` and invoked with one argument; (value).
   *
   * If a property name is passed for `callback`, the created "_.pluck" style
   * callback will return the property value of the given element.
   *
   * If an object is passed for `callback`, the created "_.where" style callback
   * will return `true` for elements that have the properties of the given object,
   * else `false`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to inspect.
   * @param {Mixed} value The value to evaluate.
   * @param {Function|Object|String} [callback=identity] The function called per
   *  iteration. If a property name or object is passed, it will be used to create
   *  a "_.pluck" or "_.where" style callback, respectively.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Number} Returns the index at which the value should be inserted
   *  into `array`.
   * @example
   *
   * _.sortedIndex([20, 30, 50], 40);
   * // => 2
   *
   * // using "_.pluck" callback shorthand
   * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
   * // => 2
   *
   * var dict = {
   *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
   * };
   *
   * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
   *   return dict.wordToNumber[word];
   * });
   * // => 2
   *
   * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
   *   return this.wordToNumber[word];
   * }, dict);
   * // => 2
   */
  function sortedIndex(array, value, callback, thisArg) {
    var low = 0,
        high = array ? array.length : low;

    // explicitly reference `identity` for better inlining in Firefox
    callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
    value = callback(value);

    while (low < high) {
      var mid = (low + high) >>> 1;
      (callback(array[mid]) < value)
        ? low = mid + 1
        : high = mid;
    }
    return low;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a function that, when called, invokes `func` with the `this`
   * binding of `thisArg` and prepends any additional `bind` arguments to those
   * passed to the bound function.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to bind.
   * @param {Mixed} [thisArg] The `this` binding of `func`.
   * @param {Mixed} [arg1, arg2, ...] Arguments to be partially applied.
   * @returns {Function} Returns the new bound function.
   * @example
   *
   * var func = function(greeting) {
   *   return greeting + ' ' + this.name;
   * };
   *
   * func = _.bind(func, { 'name': 'moe' }, 'hi');
   * func();
   * // => 'hi moe'
   */
  function bind(func, thisArg) {
    // use `Function#bind` if it exists and is fast
    // (in V8 `Function#bind` is slower except when partially applied)
    return support.fastBind || (nativeBind && arguments.length > 2)
      ? nativeBind.call.apply(nativeBind, arguments)
      : createBound(func, thisArg, nativeSlice.call(arguments, 2));
  }

  /**
   * Produces a callback bound to an optional `thisArg`. If `func` is a property
   * name, the created callback will return the property value for a given element.
   * If `func` is an object, the created callback will return `true` for elements
   * that contain the equivalent object properties, otherwise it will return `false`.
   *
   * Note: All Lo-Dash methods, that accept a `callback` argument, use `_.createCallback`.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Mixed} [func=identity] The value to convert to a callback.
   * @param {Mixed} [thisArg] The `this` binding of the created callback.
   * @param {Number} [argCount=3] The number of arguments the callback accepts.
   * @returns {Function} Returns a callback function.
   * @example
   *
   * var stooges = [
   *   { 'name': 'moe', 'age': 40 },
   *   { 'name': 'larry', 'age': 50 }
   * ];
   *
   * // wrap to create custom callback shorthands
   * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
   *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
   *   return !match ? func(callback, thisArg) : function(object) {
   *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
   *   };
   * });
   *
   * _.filter(stooges, 'age__gt45');
   * // => [{ 'name': 'larry', 'age': 50 }]
   *
   * // create mixins with support for "_.pluck" and "_.where" callback shorthands
   * _.mixin({
   *   'toLookup': function(collection, callback, thisArg) {
   *     callback = _.createCallback(callback, thisArg);
   *     return _.reduce(collection, function(result, value, index, collection) {
   *       return (result[callback(value, index, collection)] = value, result);
   *     }, {});
   *   }
   * });
   *
   * _.toLookup(stooges, 'name');
   * // => { 'moe': { 'name': 'moe', 'age': 40 }, 'larry': { 'name': 'larry', 'age': 50 } }
   */
  function createCallback(func, thisArg, argCount) {
    if (func == null) {
      return identity;
    }
    var type = typeof func;
    if (type != 'function') {
      if (type != 'object') {
        return function(object) {
          return object[func];
        };
      }
      var props = keys(func);
      return function(object) {
        var length = props.length,
            result = false;
        while (length--) {
          if (!(result = isEqual(object[props[length]], func[props[length]], indicatorObject))) {
            break;
          }
        }
        return result;
      };
    }
    if (typeof thisArg == 'undefined' || (reThis && !reThis.test(fnToString.call(func)))) {
      return func;
    }
    if (argCount === 1) {
      return function(value) {
        return func.call(thisArg, value);
      };
    }
    if (argCount === 2) {
      return function(a, b) {
        return func.call(thisArg, a, b);
      };
    }
    if (argCount === 4) {
      return function(accumulator, value, index, collection) {
        return func.call(thisArg, accumulator, value, index, collection);
      };
    }
    return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
  }

  /**
   * Creates a function that will delay the execution of `func` until after
   * `wait` milliseconds have elapsed since the last time it was invoked. Pass
   * an `options` object to indicate that `func` should be invoked on the leading
   * and/or trailing edge of the `wait` timeout. Subsequent calls to the debounced
   * function will return the result of the last `func` call.
   *
   * Note: If `leading` and `trailing` options are `true`, `func` will be called
   * on the trailing edge of the timeout only if the the debounced function is
   * invoked more than once during the `wait` timeout.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to debounce.
   * @param {Number} wait The number of milliseconds to delay.
   * @param {Object} options The options object.
   *  [leading=false] A boolean to specify execution on the leading edge of the timeout.
   *  [maxWait] The maximum time `func` is allowed to be delayed before it's called.
   *  [trailing=true] A boolean to specify execution on the trailing edge of the timeout.
   * @returns {Function} Returns the new debounced function.
   * @example
   *
   * var lazyLayout = _.debounce(calculateLayout, 300);
   * jQuery(window).on('resize', lazyLayout);
   *
   * jQuery('#postbox').on('click', _.debounce(sendMail, 200, {
   *   'leading': true,
   *   'trailing': false
   * });
   */
  function debounce(func, wait, options) {
    var args,
        result,
        thisArg,
        callCount = 0,
        lastCalled = 0,
        maxWait = false,
        maxTimeoutId = null,
        timeoutId = null,
        trailing = true;

    function clear() {
      clearTimeout(maxTimeoutId);
      clearTimeout(timeoutId);
      callCount = 0;
      maxTimeoutId = timeoutId = null;
    }

    function delayed() {
      var isCalled = trailing && (!leading || callCount > 1);
      clear();
      if (isCalled) {
        if (maxWait !== false) {
          lastCalled = new Date;
        }
        result = func.apply(thisArg, args);
      }
    }

    function maxDelayed() {
      clear();
      if (trailing || (maxWait !== wait)) {
        lastCalled = new Date;
        result = func.apply(thisArg, args);
      }
    }

    wait = nativeMax(0, wait || 0);
    if (options === true) {
      var leading = true;
      trailing = false;
    } else if (isObject(options)) {
      leading = options.leading;
      maxWait = 'maxWait' in options && nativeMax(wait, options.maxWait || 0);
      trailing = 'trailing' in options ? options.trailing : trailing;
    }
    return function() {
      args = arguments;
      thisArg = this;
      callCount++;

      // avoid issues with Titanium and `undefined` timeout ids
      // https://github.com/appcelerator/titanium_mobile/blob/3_1_0_GA/android/titanium/src/java/ti/modules/titanium/TitaniumModule.java#L185-L192
      clearTimeout(timeoutId);

      if (maxWait === false) {
        if (leading && callCount < 2) {
          result = func.apply(thisArg, args);
        }
      } else {
        var now = new Date;
        if (!maxTimeoutId && !leading) {
          lastCalled = now;
        }
        var remaining = maxWait - (now - lastCalled);
        if (remaining <= 0) {
          clearTimeout(maxTimeoutId);
          maxTimeoutId = null;
          lastCalled = now;
          result = func.apply(thisArg, args);
        }
        else if (!maxTimeoutId) {
          maxTimeoutId = setTimeout(maxDelayed, remaining);
        }
      }
      if (wait !== maxWait) {
        timeoutId = setTimeout(delayed, wait);
      }
      return result;
    };
  }

  /**
   * Creates a function that, when executed, will only call the `func` function
   * at most once per every `wait` milliseconds. Pass an `options` object to
   * indicate that `func` should be invoked on the leading and/or trailing edge
   * of the `wait` timeout. Subsequent calls to the throttled function will
   * return the result of the last `func` call.
   *
   * Note: If `leading` and `trailing` options are `true`, `func` will be called
   * on the trailing edge of the timeout only if the the throttled function is
   * invoked more than once during the `wait` timeout.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to throttle.
   * @param {Number} wait The number of milliseconds to throttle executions to.
   * @param {Object} options The options object.
   *  [leading=true] A boolean to specify execution on the leading edge of the timeout.
   *  [trailing=true] A boolean to specify execution on the trailing edge of the timeout.
   * @returns {Function} Returns the new throttled function.
   * @example
   *
   * var throttled = _.throttle(updatePosition, 100);
   * jQuery(window).on('scroll', throttled);
   *
   * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
   *   'trailing': false
   * }));
   */
  function throttle(func, wait, options) {
    var leading = true,
        trailing = true;

    if (options === false) {
      leading = false;
    } else if (isObject(options)) {
      leading = 'leading' in options ? options.leading : leading;
      trailing = 'trailing' in options ? options.trailing : trailing;
    }
    options = getObject();
    options.leading = leading;
    options.maxWait = wait;
    options.trailing = trailing;

    var result = debounce(func, wait, options);
    releaseObject(options);
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * This method returns the first argument passed to it.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Mixed} value Any value.
   * @returns {Mixed} Returns `value`.
   * @example
   *
   * var moe = { 'name': 'moe' };
   * moe === _.identity(moe);
   * // => true
   */
  function identity(value) {
    return value;
  }

  /**
   * Produces a random number between `min` and `max` (inclusive). If only one
   * argument is passed, a number between `0` and the given number will be returned.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Number} [min=0] The minimum possible value.
   * @param {Number} [max=1] The maximum possible value.
   * @returns {Number} Returns a random number.
   * @example
   *
   * _.random(0, 5);
   * // => a number between 0 and 5
   *
   * _.random(5);
   * // => also a number between 0 and 5
   */
  function random(min, max) {
    if (min == null && max == null) {
      max = 1;
    }
    min = +min || 0;
    if (max == null) {
      max = min;
      min = 0;
    } else {
      max = +max || 0;
    }
    var rand = nativeRandom();
    return (min % 1 || max % 1)
      ? min + nativeMin(rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1))), max)
      : min + floor(rand * (max - min + 1));
  }

  /**
   * Generates a unique ID. If `prefix` is passed, the ID will be appended to it.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {String} [prefix] The value to prefix the ID with.
   * @returns {String} Returns the unique ID.
   * @example
   *
   * _.uniqueId('contact_');
   * // => 'contact_104'
   *
   * _.uniqueId();
   * // => '105'
   */
  function uniqueId(prefix) {
    var id = ++idCounter;
    return String(prefix == null ? '' : prefix) + id;
  }

  /*--------------------------------------------------------------------------*/

  lodash.assign = assign;
  lodash.bind = bind;
  lodash.createCallback = createCallback;
  lodash.debounce = debounce;
  lodash.forEach = forEach;
  lodash.forIn = forIn;
  lodash.forOwn = forOwn;
  lodash.keys = keys;
  lodash.shuffle = shuffle;
  lodash.throttle = throttle;

  lodash.each = forEach;
  lodash.extend = assign;

  /*--------------------------------------------------------------------------*/

  // add functions that return unwrapped values when chaining
  lodash.clone = clone;
  lodash.identity = identity;
  lodash.isArguments = isArguments;
  lodash.isArray = isArray;
  lodash.isEqual = isEqual;
  lodash.isFunction = isFunction;
  lodash.isObject = isObject;
  lodash.isPlainObject = isPlainObject;
  lodash.isString = isString;
  lodash.random = random;
  lodash.sortedIndex = sortedIndex;
  lodash.uniqueId = uniqueId;

  /*--------------------------------------------------------------------------*/

  /**
   * The semantic version number.
   *
   * @static
   * @memberOf _
   * @type String
   */
  lodash.VERSION = '1.3.1';

  /*--------------------------------------------------------------------------*/

;lodash.extend(Physics.util, lodash);}(this));

// ---
// inside: src/util/decorator.js

/**
 * Facilitates creation of decorator service functions
 *
 * @example
 * 
 * var service = Decorator('service', {
 *      // prototype methods...
 *      method: function( args ){
 *      }
 * });
 *
 * // define
 * service( 'name', (optional)'parent-name', function decorator( parent ){
 *
 *      // extend further...
 *      return {
 *          // overrides
 *          init: function( cfg ){
 *              parent.init.call(this, cfg);
 *          }
 *      };
 * });
 * 
 * // instantiate
 * var options = { key: 'val' };
 * var instance = service( 'name', options );
 */
var Decorator = Physics.util.decorator = function Decorator( type, baseProto ){

    var registry = {}
        ,proto = {}
        ;

    // extend callback that only extends functions
    var copyFn = function copyFn( a, b ){

        return Physics.util.isFunction( b ) ? b : a;
    };

    // http://ejohn.org/blog/objectgetprototypeof/
    /* jshint -W103 */
    var getProto = Object.getPrototypeOf;
    if ( typeof getProto !== 'function' ) {
        if ( typeof 'test'.__proto__ === 'object' ) {
            getProto = function(object){
                return object.__proto__;
            };
        } else {
            getProto = function(object){
                // May break if the constructor has been tampered with
                return object.constructor.prototype;
            };
        }
    }
    /* jshint +W103 */

    var objectCreate = Object.create;
    if (typeof objectCreate !== 'function') {
        objectCreate = function (o) {
            function F() {}
            F.prototype = o;
            return new F();
        };
    }

    /**
     * Apply mixin methods to decorator base
     * @param  {String|Object} key The method name. OR object with many key: fn pairs.
     * @param  {Function} val The function to assign
     * @return {void}
     */
    var mixin = function mixin( key, val ){

        if ( typeof key === 'object' ){
            proto = Physics.util.extend(proto, key, copyFn);
            proto.type = type;
            return;
        }

        if ( key !== 'type' && Physics.util.isFunction( val ) ){
            proto[ key ] = val;
        }
    };

    // @TODO: not sure of the best way to make the constructor names
    // transparent and readable in debug consoles...
    mixin( baseProto );

    /**
     * Factory function for definition and instantiation of subclasses.
     * If class with "name" is not defined, the "decorator" parameter is required to define it first.
     * @param  {String} name       The class name
     * @param  {String} parentName (optional) The name of parent class to extend
     * @param  {Function} decorator (optional) The decorator function that should define and return methods to extend (decorate) the base class
     * @param  {Object} cfg        (optional) The configuration to pass to the class initializer
     * @return {void|Object}       If defining without the "cfg" parameter, void will be returned. Otherwise the class instance will be returned
     */
    var factory = function factory( name, parentName, decorator, cfg ){

        var instance
            ,result
            ,parent = proto
            ,tmp
            ;

        // set parent if specified
        if ( typeof parentName !== 'string' ){

            // ... otherwise reassign parameters
            cfg = decorator;
            decorator = parentName;

        } else {

            // extend the specified module
            parent = registry[ parentName ];

            if ( !parent ){

                throw 'Error: "' + parentName + '" ' + type + ' not defined';
            }

            parent = parent.prototype;
        }

        if ( typeof decorator === 'function' ){

            result = registry[ name ];

            if ( result ){

                result.prototype = Physics.util.extend(result.prototype, decorator( getProto(result.prototype) ), copyFn);
                
            } else {
                // newly defined
                // store the new class
                result = registry[ name ] = function constructor( opts ){
                    if (this.init){
                        this.init( opts );
                    }
                };

                result.prototype = objectCreate( parent );
                result.prototype = Physics.util.extend(result.prototype, decorator( parent ), copyFn);
            }

            result.prototype.type = type;
            result.prototype.name = name;
            
        } else {

            cfg = decorator || {};
            result = registry[ name ];
            if (!result){

                throw 'Error: "' + name + '" ' + type + ' not defined';
            }
        }

        if ( cfg ) {

            // create a new instance from the provided decorator
            return new result( cfg );
        }
    };

    factory.mixin = mixin;

    return factory;
};

// ---
// inside: src/util/noconflict.js

(function( window ){

    var _Physics = window.Physics;

    /**
     * Restore the original reference to the global window.Physics variable.
     * Does nothing if PhysicsJS doesn't have a reference in global scope
     * @return {Physics} The PhysicsJS reference
     */
    Physics.noConflict = function(){

        if ( window.Physics === Physics ) {
            window.Physics = _Physics;
        }
        
        return Physics;
    };

})( this );

// ---
// inside: src/util/pubsub.js

(function(){

    /**
     * PubSub implementation (fast)
     */
    var PubSub = function PubSub( defaultScope ){

        if (!(this instanceof PubSub)){
            return new PubSub( defaultScope );
        }

        this._topics = {};
        this.defaultScope = defaultScope || this;
    };

    PubSub.prototype = {

        /**
         * Subscribe a callback (or callbacks) to a topic (topics).
         * 
         * @param  {String|Object}   topic The topic name, or a config with key/value pairs of { topic: callbackFn, ... }
         * @param  {Function} fn The callback function (if not using Object as previous argument)
         * @param  {Object}   scope (optional) The scope to bind callback to
         * @param  {Number}   priority (optional) The priority of the callback (higher = earlier)
         * @return {this}
         */
        subscribe: function( topic, fn, scope, priority ){

            var listeners = this._topics[ topic ] || (this._topics[ topic ] = [])
                ,orig = fn
                ,idx
                ;

            // check if we're subscribing to multiple topics
            // with an object
            if ( Physics.util.isObject( topic ) ){

                for ( var t in topic ){
                    
                    this.subscribe( t, topic[ t ], fn, scope );
                }

                return this;
            }

            if ( Physics.util.isObject( scope ) ){
                
                fn = Physics.util.bind( fn, scope );
                fn._bindfn_ = orig;

            } else if (!priority) {

                priority = scope;
            }

            fn._priority_ = priority;

            idx = Physics.util.sortedIndex( listeners, fn, '_priority_' );

            listeners.splice( idx, 0, fn );
            return this;
        },

        /**
         * Unsubscribe function from topic
         * @param  {String}   topic Topic name
         * @param  {Function} fn The original callback function
         * @return {this}
         */
        unsubscribe: function( topic, fn ){

            var listeners = this._topics[ topic ]
                ,listn
                ;

            if (!listeners){
                return this;
            }

            for ( var i = 0, l = listeners.length; i < l; i++ ){
                
                listn = listeners[ i ];

                if ( listn._bindfn_ === fn || listn === fn ){
                    listeners.splice(i, 1);
                    break;
                }
            }

            return this;
        },

        /**
         * Publish data to a topic
         * @param  {Object|String} data
         * @param  {Object} scope The scope to be included in the data argument passed to callbacks
         * @return {this}
         */
        publish: function( data, scope ){

            if (typeof data !== 'object'){
                data = { topic: data };
            }

            var topic = data.topic
                ,listeners = this._topics[ topic ]
                ,l = listeners && listeners.length
                ;

            if ( !topic ){
                throw 'Error: No topic specified in call to world.publish()';
            }

            if ( !l ){
                return this;
            }
            
            data.scope = data.scope || this.defaultScope;

            while ( l-- ){
                
                data.handler = listeners[ l ];
                data.handler( data );
            }

            return this;
        }
    };
    
    Physics.util.pubsub = PubSub;
})();

// ---
// inside: src/util/request-anim-frame.js

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Moller
// fixes from Paul Irish and Tino Zijdel
 
(function(window) {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame){
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
 
    if (!window.cancelAnimationFrame){
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}(this));

// ---
// inside: src/util/scratchpad.js

/**
 * scratchpad
 * thread-safe management of temporary (voletile)
 * objects for use in calculations
 */
(function(){

    // constants
    var SCRATCH_MAX_SCRATCHES = 100; // maximum number of scratches
    var SCRATCH_MAX_INDEX = 10; // maximum number of any type of temp objects
    var SCRATCH_USAGE_ERROR = 'Error: Scratchpad used after .done() called. (Could it be unintentionally scoped?)';
    var SCRATCH_INDEX_OUT_OF_BOUNDS = 'Error: Scratchpad usage space out of bounds. (Did you forget to call .done()?)';
    var SCRATCH_MAX_REACHED = 'Error: Too many scratchpads created. (Did you forget to call .done()?)';

    // cache previously created scratches
    var scratches = [];
    var numScratches = 0;

    var ScratchCls = function ScratchCls(){

        // private variables
        this.objIndex = 0;
        this.arrayIndex = 0;
        this.vectorIndex = 0;
        this.aabbIndex = 0;
        this.transformIndex = 0;
        this.objectStack = [];
        this.arrayStack = [];
        this.vectorStack = [];
        this.aabbStack = [];
        this.transformStack = [];

        if (++numScratches >= SCRATCH_MAX_SCRATCHES){
            throw SCRATCH_MAX_REACHED;
        }
    };

    ScratchCls.prototype = {

        /**
         * Declare that your work is finished. Release temp objects for use elsewhere. Must be called when immediate work is done.
         */
        done: function(){

            this._active = false;
            this.objIndex = this.arrayIndex = this.vectorIndex = this.aabbIndex = this.transformIndex = 0;
            // add it back to the scratch stack for future use
            scratches.push(this);
        },

        /**
         * Get a temporary object (dirty)
         * @return {Object} The temporary (dirty) object
         */
        object: function(){

            var stack = this.objectStack;

            if (!this._active){
                throw SCRATCH_USAGE_ERROR;
            }

            if (this.objIndex >= SCRATCH_MAX_INDEX){
                throw SCRATCH_INDEX_OUT_OF_BOUNDS;
            }

            return stack[ this.objIndex++ ] || stack[ stack.push({}) - 1 ];
        },

        /**
         * Get a temporary array.
         * @return {Array} Temporary (dirty) array
         */
        array: function(){

            var stack = this.arrayStack;

            if (!this._active){
                throw SCRATCH_USAGE_ERROR;
            }

            if (this.arrIndex >= SCRATCH_MAX_INDEX){
                throw SCRATCH_INDEX_OUT_OF_BOUNDS;
            }

            return stack[ this.arrIndex++ ] || stack[ stack.push([]) - 1 ];
        },

        /**
         * Get a temporary Vector
         * @return {Vector} The temporary (dirty) vector.
         */
        vector: function(){

            var stack = this.vectorStack;

            if (!this._active){
                throw SCRATCH_USAGE_ERROR;
            }

            if (this.vectorIndex >= SCRATCH_MAX_INDEX){
                throw SCRATCH_INDEX_OUT_OF_BOUNDS;
            }

            return stack[ this.vectorIndex++ ] || stack[ stack.push(Physics.vector()) - 1 ];
        },

        /**
         * Get a temporary AABB
         * @return {AABB} The temporary (dirty) AABB
         */
        aabb: function(){

            var stack = this.aabbStack;

            if (!this._active){
                throw SCRATCH_USAGE_ERROR;
            }

            if (this.aabbIndex >= SCRATCH_MAX_INDEX){
                throw SCRATCH_INDEX_OUT_OF_BOUNDS;
            }

            return stack[ this.aabbIndex++ ] || stack[ stack.push(Physics.aabb()) - 1 ];
        },

        /**
         * Get a temporary Transform
         * @return {Transform} The temporary (dirty) transform
         */
        transform: function(){

            var stack = this.transformStack;

            if (!this._active){
                throw SCRATCH_USAGE_ERROR;
            }

            if (this.transformIndex >= SCRATCH_MAX_INDEX){
                throw SCRATCH_INDEX_OUT_OF_BOUNDS;
            }

            return stack[ this.transformIndex++ ] || stack[ stack.push(Physics.transform()) - 1 ];
        }
    };
    
    /**
     * Get a new scratchpad to work from. Call .done() when finished.
     * @return {ScratchCls} The scratchpad
     */
    Physics.scratchpad = function(){

        var scratch = scratches.pop() || new ScratchCls();
        scratch._active = true;
        return scratch;
    };

})();

// ---
// inside: src/util/ticker.js

/**
 * The Ticker singleton for easily binding callbacks to requestAnimationFrame
 */
(function(window){
        
    var lastTime = 0
        ,active = false
        ,listeners = []
        ;

    /**
     * Publish a tick to subscribed callbacks
     * @private
     * @param  {Number} time The current time
     * @return {void}
     */
    function step( time ){

        var fns = listeners;

        if (!active){
            return;
        }

        window.requestAnimationFrame( step );
        
        for ( var i = 0, l = fns.length; i < l; ++i ){
            
            fns[ i ]( time, time - lastTime );
        }

        lastTime = time;
    }

    /**
     * Start the ticker
     * @return {this}
     */
    function start(){
        
        lastTime = (new Date()).getTime();
        active = true;
        step();

        return this;
    }

    /**
     * Stop the ticker
     * @return {this}
     */
    function stop(){

        active = false;
        return this;
    }

    /**
     * Subscribe a callback to the ticker
     * @param  {Function} listener The callback function
     * @return {this}
     */
    function subscribe( listener ){

        // if function and not already in listeners...
        if ( typeof listener === 'function' ){

            for ( var i = 0, l = listeners.length; i < l; ++i ){
                
                if (listener === listeners[ i ]){
                    return this;
                }
            }

            // add it
            listeners.push( listener );
        }
        
        return this;
    }

    /**
     * Unsubscribe a callback from the ticker
     * @param  {Function} listener Original callback added
     * @return {this}
     */
    function unsubscribe( listener ){

        var fns = listeners;

        for ( var i = 0, l = fns.length; i < l; ++i ){
            
            if ( fns[ i ] === listener ){

                // remove it
                fns.splice( i, 1 );
                return this;
            }
        }

        return this;
    }

    /**
     * Determine if ticker is currently running
     * @return {Boolean} True if running
     */
    function isActive(){

        return !!active;
    }

    // API
    Physics.util.ticker = {
        start: start,
        stop: stop,
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        isActive: isActive
    };

}(this));

// ---
// inside: src/math/aabb.js

(function(){

    /**
     * Axis Aligned Bounding Box implementation
     * @param {Object|Number} minX Either an object with the aabb values, or the minimum x value
     * @param {Number} minY Minimum y value
     * @param {Number} maxX Maximum x value
     * @param {Number} maxY Maximum y value
     */
    var AABB = function AABB( minX, minY, maxX, maxY ){

        // enforce instantiation
        if ( !(this instanceof AABB) ){

            return new AABB( minX, minY, maxX, maxY );
        }

        this._pos = Physics.vector();
        
        this.set( minX, minY, maxX, maxY );
    };

    /**
     * Set the aabb values
     * @param {Object|Number} minX Either an object with the aabb values, or the minimum x value
     * @param {Number} minY Minimum y value
     * @param {Number} maxX Maximum x value
     * @param {Number} maxY Maximum y value
     * @return {this}
     */
    AABB.prototype.set = function set( minX, minY, maxX, maxY ){

        if ( Physics.util.isObject(minX) ){

            this._pos.clone( minX.pos );
            this._hw = minX.halfWidth;
            this._hh = minX.halfHeight;
            
            return this;
        }

        this._pos.set( 0.5 * (maxX + minX), 0.5 * (maxY + minY) );
        this._hw = 0.5 * (maxX - minX);
        this._hh = 0.5 * (maxY - minY);
        return this;
    };

    /**
     * Get the aabb values as a plain object
     * @return {Object} The aabb values
     */
    AABB.prototype.get = function get(){

        var hw = this.halfWidth()
            ,hh = this.halfHeight()
            ;

        return {
            pos: this._pos.values(),
            halfWidth: hw,
            halfHeight: hh,
            // useful for vector operations
            x: hw,
            y: hh
        };
    };

    /**
     * Get the half-width measurement of the aabb
     * @return {Number} The half-width
     */
    AABB.prototype.halfWidth = function halfWidth(){

        return this._hw;
    };

    /**
     * Get the half-height measurement of the aabb
     * @return {Number} The half-height
     */
    AABB.prototype.halfHeight = function halfHeight(){

        return this._hh;
    };

    /**
     * Check if point is inside bounds
     * @param  {Vectorish} pt The point to check
     * @return {Boolean}    True if point is inside aabb
     */
    AABB.prototype.contains = function contains( pt ){

        var x = pt.x !== undefined ? pt.x : pt.get(0)
            ,y = pt.y !== undefined ? pt.y : pt.get(1)
            ;

        return  (x > (this._pos.get(0) - this._hw)) && 
                (x < (this._pos.get(0) + this._hw)) &&
                (y > (this._pos.get(1) - this._hh)) &&
                (y < (this._pos.get(1) + this._hh));
    };

    /**
     * Apply a transformation to the aabb
     * @param  {Transform} trans The transformation
     * @return {this}
     */
    AABB.prototype.transform = function transform( trans ){

        var hw = this._hw
            ,hh = this._hh
            ,scratch = Physics.scratchpad()
            ,bottomRight = scratch.vector().set( hw, hh )
            ,topRight = scratch.vector().set( hw, -hh )
            ;

        // translate the center
        this._pos.translate( trans );

        // rotate the corners
        bottomRight.rotate( trans );
        topRight.rotate( trans );

        // we need to keep the box oriented with the axis, but expand it to
        // accomodate the rotation
        this._hw = Math.max( Math.abs(bottomRight.get(0)), Math.abs(topRight.get(0)) );
        this._hh = Math.max( Math.abs(bottomRight.get(1)), Math.abs(topRight.get(1)) );

        scratch.done();
        return this;
    };

    // Static methods
    /**
     * Check if a point is inside an aabb
     * @param  {AABB|Object} aabb The aabb instance or aabb values
     * @param  {Vectorish} pt   The point to check
     * @return {Boolean}      True if point is inside aabb
     */
    AABB.contains = function( aabb, pt ){

        var x = pt.x !== undefined ? pt.x : pt.get(0)
            ,y = pt.y !== undefined ? pt.y : pt.get(1)
            ;

        aabb = aabb.get ? aabb.get() : aabb;

        return  (x > (aabb.pos.x - aabb.halfWidth)) && 
                (x < (aabb.pos.x + aabb.halfWidth)) &&
                (y > (aabb.pos.y - aabb.halfHeight)) &&
                (y < (aabb.pos.y + aabb.halfHeight));
    };

    Physics.aabb = AABB;
}());

// ---
// inside: src/math/gjk.js

/**
 * Gilbert–Johnson–Keerthi object collison algorithm
 * For general information about GJK see: 
 *  - http://www.codezealot.org/archives/88
 *  - http://mollyrocket.com/849
 */
(function(){

    // the algorithm doesn't always converge for curved shapes.
    // need these constants to dictate how accurate we want to be.
    var gjkAccuracy = 0.0001;
    var gjkMaxIterations = 100;

    // get the next search direction from two simplex points
    var getNextSearchDir = function getNextSearchDir( ptA, ptB, dir ){

        var ABdotB = ptB.normSq() - ptB.dot( ptA )
            ,ABdotA = ptB.dot( ptA ) - ptA.normSq()
            ;

        // if the origin is farther than either of these points
        // get the direction from one of those points to the origin
        if ( ABdotB < 0 ){

            return dir.clone( ptB ).negate();

        } else if ( ABdotA > 0 ){

            return dir.clone( ptA ).negate();

        // otherwise, use the perpendicular direction from the simplex
        } else {

            // dir = AB = B - A
            dir.clone( ptB ).vsub( ptA );
            // if (left handed coordinate system) 
            // A cross AB < 0 then get perpendicular counter clockwise 
            return dir.perp( (ptA.cross( dir ) < 0) );
        }
    };

    /**
     * Figure out the closest points on the original objects
     * from the last two entries of the simplex
     * @param  {Array} simplex
     * @return {Object}
     */
    var getClosestPoints = function getClosestPoints( simplex ){

        // see http://www.codezealot.org/archives/153
        // for algorithm details

        // we know that the position of the last point 
        // is very close to the previous. (by nature of the distance test)
        // this won't give great results for the closest
        // points algorithm, so let's use the previous two
        var len = simplex.length
            ,last = simplex[ len - 2 ]
            ,prev = simplex[ len - 3 ]
            ,scratch = Physics.scratchpad()
            ,A = scratch.vector().clone( last.pt )
            // L = B - A
            ,L = scratch.vector().clone( prev.pt ).vsub( A )
            ,lambdaB
            ,lambdaA
            ;

        if ( L.equals(Physics.vector.zero) ){

            // oh.. it's a zero vector. So A and B are both the closest.
            // just use one of them
            scratch.done();
            return {

                a: last.a,
                b: last.b
            };
        }

        lambdaB = - L.dot( A ) / L.normSq();
        lambdaA = 1 - lambdaB;

        if ( lambdaA <= 0 ){
            // woops.. that means the closest simplex point
            // isn't on the line it's point B itself
            scratch.done();
            return {
                a: prev.a,
                b: prev.b
            };
        } else if ( lambdaB <= 0 ){
            // vice versa
            scratch.done();
            return {
                a: last.a,
                b: last.b
            };
        }

        // guess we'd better do the math now...
        var ret = {
            // a closest = lambdaA * Aa + lambdaB * Ba
            a: A.clone( last.a ).mult( lambdaA ).vadd( L.clone( prev.a ).mult( lambdaB ) ).values(),
            // b closest = lambdaA * Ab + lambdaB * Bb
            b: A.clone( last.b ).mult( lambdaA ).vadd( L.clone( prev.b ).mult( lambdaB ) ).values()
        };

        scratch.done();
        return ret;
    };

    /**
     * Implementation agnostic GJK function.
     * @param  {Function} support The support function. Must return an object containing 
     *                            the witness points (.a, .b) and the support point (.pt).
     *                            Recommended to use simple objects. Eg: return { a: {x: 1, y:2}, b: {x: 3, y: 4}, pt: {x: 2, y: 2} }
     *                            Signature: function(<Physics.vector> axis).
     *                            axis: The axis to use
     * @param {Physics.vector} seed The starting direction for the simplex
     * @return {Object} The algorithm information containing properties: .overlap (bool), and .simplex (Array)
     */
    var gjk = function gjk( support, seed, checkOverlapOnly, debugFn ){

        var overlap = false
            ,noOverlap = false // if we're sure we're not overlapping
            ,distance = false
            ,simplex = []
            ,simplexLen = 1
            // setup a scratchpad of temporary cheap objects
            ,scratch = Physics.scratchpad()
            // use seed as starting direction or use x axis
            ,dir = scratch.vector().clone(seed || Physics.vector.axis[ 0 ])
            ,last = scratch.vector()
            ,lastlast = scratch.vector()
            // some temp vectors
            ,v1 = scratch.vector()
            ,v2 = scratch.vector()
            ,ab
            ,ac
            ,sign
            ,tmp
            ,iterations = 0
            ;

        // get the first Minkowski Difference point
        tmp = support( dir );
        simplexLen = simplex.push( tmp );
        last.clone( tmp.pt );
        // negate d for the next point
        dir.negate();

        // start looping
        while ( ++iterations ) {

            // swap last and lastlast, to save on memory/speed
            last.swap(lastlast);
            // push a new point to the simplex because we haven't terminated yet
            tmp = support( dir );
            simplexLen = simplex.push( tmp );
            last.clone( tmp.pt );

            if ( debugFn ){
                debugFn( simplex );
            }

            if ( last.equals(Physics.vector.zero) ){
                // we happened to pick the origin as a support point... lucky.
                overlap = true;
                break;
            }
            
            // check if the last point we added actually passed the origin
            if ( !noOverlap && last.dot( dir ) <= 0.0 ) {
                // if the point added last was not past the origin in the direction of d
                // then the Minkowski difference cannot possibly contain the origin since
                // the last point added is on the edge of the Minkowski Difference

                // if we just need the overlap...
                if ( checkOverlapOnly ){
                    break;
                }

                noOverlap = true;
            }

            // if it's a line...
            if ( simplexLen === 2 ){

                // otherwise we need to determine if the origin is in
                // the current simplex and act accordingly

                dir = getNextSearchDir( last, lastlast, dir );
                // continue...

            // if it's a triangle... and we're looking for the distance
            } else if ( noOverlap ){

                // if we know there isn't any overlap and
                // we're just trying to find the distance...
                // make sure we're getting closer to the origin
                dir.normalize();
                tmp = lastlast.dot( dir );
                if ( Math.abs(tmp - last.dot( dir )) < gjkAccuracy ){

                    distance = -tmp;
                    break;
                }

                // if we are still getting closer then only keep
                // the points in the simplex that are closest to
                // the origin (we already know that last is closer
                // than the previous two)
                // the norm is the same as distance(origin, a)
                // use norm squared to avoid the sqrt operations
                if (lastlast.normSq() < v1.clone(simplex[ 0 ].pt).normSq()) {
                    
                    simplex.shift();

                } else {
                    
                    simplex.splice(1, 1);
                }

                dir = getNextSearchDir( v1.clone(simplex[ 1 ].pt), v2.clone(simplex[ 0 ].pt), dir );
                // continue...

            // if it's a triangle
            } else {

                // we need to trim the useless point...

                ab = ab || scratch.vector();
                ac = ac || scratch.vector();

                // get the edges AB and AC
                ab.clone( lastlast ).vsub( last );
                ac.clone( simplex[ 0 ].pt ).vsub( last );

                // here normally people think about this as getting outward facing
                // normals and checking dot products. Since we're in 2D
                // we can be clever...
                sign = ab.cross( ac ) > 0;
                
                if ( sign ^ (last.cross( ab ) > 0) ){

                    // ok... so there's an XOR here... don't freak out
                    // remember last = A = -AO
                    // if AB cross AC and AO cross AB have the same sign
                    // then the origin is along the outward facing normal of AB
                    // so if AB cross AC and A cross AB have _different_ (XOR) signs
                    // then this is also the case... so we proceed...

                    // point C is dead to us now...
                    simplex.shift();

                    // if we haven't deduced that we've enclosed the origin
                    // then we know which way to look...
                    // morph the ab vector into its outward facing normal
                    ab.perp( sign );
                    
                    // swap
                    dir.swap( ab );
                    
                    // continue...

                    // if we get to this if, then it means we can continue to look along
                    // the other outward normal direction (ACperp)
                    // if we don't see the origin... then we must have it enclosed
                } else if ( sign ^ (ac.cross( last ) > 0) ){
                    // then the origin is along the outward facing normal 
                    // of AC; (ACperp)

                    // point B is dead to us now...
                    simplex.splice(1, 1);

                    ac.perp( !sign );
                    
                    // swap
                    dir.swap( ab );
                    
                    // continue...

                } else {

                    // we have enclosed the origin!
                    overlap = true;
                    // fewf... take a break
                    break;
                }
            }

            // woah nelly... that's a lot of iterations.
            // Stop it!
            if (iterations > gjkMaxIterations){
                scratch.done();
                return {
                    simplex: simplex,
                    iterations: iterations,
                    distance: 0,
                    maxIterationsReached: true
                };
            }
        }

        // free workspace
        scratch.done();

        tmp = {
            overlap: overlap,
            simplex: simplex,
            iterations: iterations
        };

        if ( distance !== false ){

            tmp.distance = distance;
            tmp.closest = getClosestPoints( simplex );
        }

        return tmp;
    };

    Physics.gjk = gjk;

})();

// ---
// inside: src/math/transform.js

(function(){
    
    /**
     * Vector Transformations class for rotating and translating vectors
     * @class Transform
     */

    /**
     * Transform Constructor / Factory
     * @param {Physics.vector|Physics.transform} vect (optional) vector to use for translation or a transform to copy
     * @param {Number} angle (optional) Angle (radians) to use for rotation
     * @param {Vectorish} origin (optional) Origin of the rotation
     */
    var Transform = function Transform( vect, angle, origin ) {

        if (!(this instanceof Transform)){
            return new Transform( vect, angle );
        }

        this.v = Physics.vector();
        this.o = Physics.vector( origin ); // origin of rotation
        
        if ( vect instanceof Transform ){

            this.clone( vect );
        }

        if (vect){
            this.setTranslation( vect );
        }

        this.setRotation( angle || 0 );
    };

    /**
     * Set the translation portion of the transform
     * @param {Physics.vector} vect
     */
    Transform.prototype.setTranslation = function( vect ){

        this.v.clone( vect );
        return this;
    };

    /**
     * Set the rotation portion of the transform
     * @param {Number} angle
     * @param {Vectorish} origin (optional) Origin of the rotation
     */
    Transform.prototype.setRotation = function( angle, origin ){

        this.cosA = Math.cos( angle );
        this.sinA = Math.sin( angle );

        if ( origin ){
            this.o.clone( origin );
        }

        return this;
    };

    /**
     * Clone another transform. Or clone self into new transform.
     * @param  {Physics.transform} t (optional) the transform to clone
     * @return {Physics.transform|this}
     */
    Transform.prototype.clone = function( t ){

        if ( t ){

            this.setTranslation( t.v );
            this.cosA = t.cosA;
            this.sinA = t.sinA;
            this.o.clone( t.o );

            return this;
        }

        return new Transform( this );
    };

    Physics.transform = Transform;

})();

// ---
// inside: src/math/vector.js

(function(window){

    // http://jsperf.com/vector-storage-test/2

    // cached math functions
    // TODO: might be faster not to do this???
    var sqrt = Math.sqrt
        ,min = Math.min
        ,max = Math.max
        ,acos = Math.acos
        ,atan2 = Math.atan2
        ,TWOPI = Math.PI * 2
        ,typedArrays = !!window.Float64Array
        ;

    /**
     * Vector Constructor / Factory
     * @param {Number|Physics.vector} x (optional) Either the x coord. Or a vector to copy.
     * @param {Number} y (optional) The y coord.
     */
    var Vector = function Vector(x, y) {

        // enforce instantiation
        if ( !(this instanceof Vector) ){

            return new Vector( x, y );
        }

        // arrays to store values
        // x = _[0]
        // y = _[1]
        // norm = _[3]
        // normsq = _[4]
        

        if (typedArrays){
            this._ = new Float64Array(5);
        } else {
            this._ = [];
        }

        if (x && (x.x !== undefined || x._ && x._.length)){

            this.clone( x );

        } else {

            this.recalc = true; //whether or not recalculate norms
            this.set( x || 0.0, y || 0.0 );
        }
    };

    /**
     * Methods
     */

    /**
     * Sets the components of this Vector.
     */
    Vector.prototype.set = function(x, y) {

        this.recalc = true;

        this._[0] = x || 0.0;
        this._[1] = y || 0.0;
        return this;
    };

    /**
     * Get component
     * @param  {Integer} n The nth component. x is 1, y is 2, ...
     * @return {Integer} component value
     */
    Vector.prototype.get = function( n ){

        return this._[ n ];
    };

    /**
     * Add Vector to this
     */
    Vector.prototype.vadd = function(v) {

        this.recalc = true;

        this._[0] += v._[0];
        this._[1] += v._[1];
        return this;
    };

    /**
     * Subtract Vector from this
     */
    Vector.prototype.vsub = function(v) {

        this.recalc = true;

        this._[0] -= v._[0];
        this._[1] -= v._[1];
        return this;
    };

    /**
     * Add scalars to Vector's components
     */
    Vector.prototype.add = function(x, y){
        
        this.recalc = true;

        this._[0] += x;
        this._[1] += y === undefined? x : y;
        return this;
    };

    /**
     * Subtract scalars to Vector's components
     */
    Vector.prototype.sub = function(x, y){
        
        this.recalc = true;

        this._[0] -= x;
        this._[1] -= y === undefined? x : y;
        return this;
    };

    /* 
     * Multiply by a scalar
     */
    Vector.prototype.mult = function(m) {
        
        if ( !this.recalc ){

            this._[4] *= m * m;
            this._[3] *= m;
        }

        this._[0] *= m;
        this._[1] *= m;
        return this;
    };

    /* 
     * Get the dot product
     */
    Vector.prototype.dot = function(v) {

        return (this._[0] * v._[0]) + (this._[1] * v._[1]);
    };

    /** 
     * Get the cross product (in a left handed coordinate system)
     */
    Vector.prototype.cross = function(v) {

        return ( - this._[0] * v._[1]) + (this._[1] * v._[0]);
    };

    /**
     * Scalar projection of this along v
     */
    Vector.prototype.proj = function(v){

        return this.dot( v ) / v.norm();
    };


    /**
     * Vector project this along v
     */
    Vector.prototype.vproj = function(v){

        var m = this.dot( v ) / v.normSq();
        return this.clone( v ).mult( m );
    };

    /**
     * Angle between this and vector. Or this and x axis.
     * @param  {Vector} v (optional) other vector
     * @return {Number} Angle in radians
     */
    Vector.prototype.angle = function(v){

        var ang;

        if ( this.equals( Vector.zero ) ){
            
            if ( v ){
                return v.angle();
            } else {
                return NaN;
            }

        } else {

            if ( v && !v.equals( Vector.zero ) ){
                ang = atan2( this._[1] * v._[0] - this._[0] * v._[1], this._[0] * v._[0] + this._[1] * v._[1]);
            } else {
                ang = atan2( this._[ 1 ], this._[ 0 ] );    
            }
        }
        
        while (ang > Math.PI){
            ang -= TWOPI;
        }

        while (ang < -Math.PI){
            ang += TWOPI;
        }

        return ang;
    };

    /**
     * Angle created between three points; left -> this -> right.
     * @param  {Vector} v (optional) other vector
     * @return {Number} Angle in radians
     */
    Vector.prototype.angle2 = function( left, right ){

        var x1 = left._[0] - this._[0]
            ,y1 = left._[1] - this._[1]
            ,x2 = right._[0] - this._[0]
            ,y2 = right._[1] - this._[1]
            ,ang = atan2( y1 * x2 - x1 * y2, x1 * x2 + y1 * y2)
            ;

        while (ang > Math.PI){
            ang -= TWOPI;
        }

        while (ang < -Math.PI){
            ang += TWOPI;
        }

        return ang;
    };

    /**
     * Get the norm (length)
     */
    Vector.prototype.norm = function() {

        if (this.recalc){
            this.recalc = false;
            this._[4] = (this._[0] * this._[0] + this._[1] * this._[1]);
            this._[3] = sqrt( this._[4] );
        }
        
        return this._[3];
    };

    /**
     * Get the norm squared
     */
    Vector.prototype.normSq = function() {

        if (this.recalc){
            this.recalc = false;
            this._[4] = (this._[0] * this._[0] + this._[1] * this._[1]);
            this._[3] = sqrt( this._[4] );
        }

        return this._[4];
    };

    /** 
     * Get distance to other Vector
     */
    Vector.prototype.dist = function(v) {
      
        var dx, dy;
        return sqrt(
            (dx = (v._[0] - this._[0])) * dx + 
            (dy = (v._[1] - this._[1])) * dy
        );
    };

    /**
     * Get distance squared to other Vector
     */
    Vector.prototype.distSq = function(v) {

        var dx, dy;
        return (
            (dx = (v._[0] - this._[0])) * dx + 
            (dy = (v._[1] - this._[1])) * dy
        );
    };

    /**
     * Change vector into a vector perpendicular
     * @param {Boolean} neg Set to true if want to go in the negative direction
     * @return {this}
     */
    Vector.prototype.perp = function( neg ) {

        var tmp = this._[0]
            ;

        if ( neg ){

            // x <-> y
            // negate x
            this._[0] = -this._[1];
            this._[1] = tmp;
            
        } else {

            // x <-> y
            // negate y
            this._[0] = this._[1];
            this._[1] = -tmp;
        }

        return this;
    };

    /**
     * Normalises this Vector, making it a unit Vector
     */
    Vector.prototype.normalize = function() {

        var m = this.norm();

        // means it's a zero Vector
        if ( m === 0 ){
            return this;
        }

        this._[0] /= m;
        this._[1] /= m;

        this._[3] = 1.0;
        this._[4] = 1.0;

        return this;
    };

    /**
     * Apply a transform to this vector
     * @param  {Physics.transform} t The transform
     */
    Vector.prototype.transform = function( t ){

        return this.set(
            (this._[ 0 ] - t.o._[ 0 ]) * t.cosA - (this._[ 1 ] - t.o._[ 1 ]) * t.sinA + t.v._[ 0 ] + t.o._[ 0 ], 
            (this._[ 0 ] - t.o._[ 0 ]) * t.sinA + (this._[ 1 ] - t.o._[ 1 ]) * t.cosA + t.v._[ 1 ] + t.o._[ 1 ]
        );
    };

    /**
     * Apply an inverse transform to this vector
     * @param  {Physics.transform} t The transform
     */
    Vector.prototype.transformInv = function( t ){

        return this.set(
            (this._[ 0 ] - t.o._[ 0 ]) * t.cosA + (this._[ 1 ] - t.o._[ 1 ]) * t.sinA - t.v._[ 0 ] + t.o._[ 0 ], 
            -(this._[ 0 ] - t.o._[ 0 ]) * t.sinA + (this._[ 1 ] - t.o._[ 1 ]) * t.cosA - t.v._[ 1 ] + t.o._[ 1 ]
        );
    };

    /**
     * Apply the rotation portion of transform to this vector
     * @param  {Physics.transform} t The transform
     */
    Vector.prototype.rotate = function( t ){

        return this.set(
            (this._[ 0 ] - t.o._[ 0 ]) * t.cosA - (this._[ 1 ] - t.o._[ 1 ]) * t.sinA + t.o._[ 0 ], 
            (this._[ 0 ] - t.o._[ 0 ]) * t.sinA + (this._[ 1 ] - t.o._[ 1 ]) * t.cosA + t.o._[ 1 ]
        );
    };

    /**
     * Apply an inverse rotation portion of transform to this vector
     * @param  {Physics.transform} t The transform
     */
    Vector.prototype.rotateInv = function( t ){

        return this.set(
            (this._[ 0 ] - t.o._[ 0 ]) * t.cosA + (this._[ 1 ] - t.o._[ 1 ]) * t.sinA + t.o._[ 0 ], 
            -(this._[ 0 ] - t.o._[ 0 ]) * t.sinA + (this._[ 1 ] - t.o._[ 1 ]) * t.cosA + t.o._[ 1 ]
        );
    };

    /**
     * Apply the translation portion of transform to this vector
     * @param  {Physics.transform} t The transform
     */
    Vector.prototype.translate = function( t ){

        return this.vadd( t.v );
    };

    /**
     * Apply an inverse translation portion of transform to this vector
     * @param  {Physics.transform} t The transform
     */
    Vector.prototype.translateInv = function( t ){

        return this.vsub( t.v );
    };


    /**
     * Returns clone of current Vector
     * Or clones provided Vector to this one
     */
    Vector.prototype.clone = function(v) {
        
        // http://jsperf.com/vector-storage-test

        if (v){

            if (!v._){

                return this.set( v.x, v.y );
            }
            
            this.recalc = v.recalc;

            if (!v.recalc){
                this._[3] = v._[3];
                this._[4] = v._[4];
            }

            this._[0] = v._[0];
            this._[1] = v._[1];

            return this;
        }

        return new Vector( this );
    };

    /**
     * Swap values with other vector
     * @param  {Vector} v
     * @return {this}
     */
    Vector.prototype.swap = function(v){

        var _ = this._;
        this._ = v._;
        v._ = _;

        _ = this.recalc;
        this.recalc = v.recalc;
        v.recalc = _;
        return this;
    };

    /**
     * Create a litteral object
     */
    Vector.prototype.values = function(){

        return {
            x: this._[0],
            y: this._[1]
        };
    };


    /**
     * Zero the Vector
     */
    Vector.prototype.zero = function() {

        this._[3] = 0.0;
        this._[4] = 0.0;

        this._[0] = 0.0;
        this._[1] = 0.0;
        return this;
    };

    /**
     * Make this a Vector in the opposite direction
     */
    Vector.prototype.negate = function( component ){

        if (component !== undefined){

            this._[ component ] = -this._[ component ];
            return this;
        }

        this._[0] = -this._[0];
        this._[1] = -this._[1];
        return this;
    };

    /**
     * Constrain Vector components to minima and maxima
     */
    Vector.prototype.clamp = function(minV, maxV){

        minV = minV.values ? minV.values() : minV;
        maxV = maxV.values ? maxV.values() : maxV;

        this._[0] = min(max(this._[0], minV.x), maxV.x);
        this._[1] = min(max(this._[1], minV.y), maxV.y);
        this.recalc = true;
        return this;
    };

    /**
     * Render string
     */
    Vector.prototype.toString = function(){

        return '('+this._[0] + ', ' + this._[1]+')';
    };


    /**
     * Determine if equal
     * @param  {Vector} v
     * @return {boolean}
     */
    Vector.prototype.equals = function(v){

        return this._[0] === v._[0] &&
            this._[1] === v._[1] &&
            this._[2] === v._[2];
    };


    /**
     * Static functions
     */

    /** 
     * Return sum of two Vectors
     */
    Vector.vadd = function(v1, v2) {

        return new Vector( v1._[0] + v2._[0], v1._[1] + v2._[1] );
    };

    /** 
     * Subtract v2 from v1
     */
    Vector.vsub = function(v1, v2) {

        return new Vector( v1._[0] - v2._[0], v1._[1] - v2._[1] );
    };

    /**
     * Multiply v1 by a scalar m
     */
    Vector.mult = function(m, v1){

        return new Vector( v1._[0]*m, v1._[1]*m );
    };

    /** 
     * Project v1 onto v2
     */
    Vector.vproj = function(v1, v2) {

        return Vector.mult( v1.dot(v2) / v2.normSq(), v2 );
    };

    /**
     * Axis vectors for general reference
     * @type {Array}
     */
    Vector.axis = [
        new Vector(1.0, 0.0),
        new Vector(0.0, 1.0)
    ];

    /**
     * Zero vector for reference
     */
    Vector.zero = new Vector(0, 0);

    // assign
    Physics.vector = Vector;

}(this)); // end Vector class


// ---
// inside: src/core/behavior.js

(function(){

    // Service
    Physics.behavior = Physics.behaviour = Decorator('behavior', {

        /**
         * Priority for behavior pubsub event
         * @type {Number}
         */
        priority: 0,

        /**
         * Initialization
         * @param  {Object} options Config options passed by initializer
         * @return {void}
         */
        init: function(){
            
            this.options = {};
        },

        /**
         * Connect to world. Automatically called when added to world by the setWorld method
         * @param  {Object} world The world to connect to
         * @return {void}
         */
        connect: function( world ){

            if (this.behave){
                world.subscribe('integrate:positions', this.behave, this, this.priority);
            }
        },

        /**
         * Disconnect from world
         * @param  {Object} world The world to disconnect from
         * @return {void}
         */
        disconnect: function( world ){

            if (this.behave){
                world.unsubscribe('integrate:positions', this.behave);
            }
        },

        /**
         * Default method run on every world integration
         * @abstract
         * @param  {Object} data Object containing event data, including: data.bodies = Array of world bodies to act on, data.dt = the timestep size
         * @return {void}
         */
        behave: null
    });

}());

// ---
// inside: src/core/body.js

(function(){

    var defaults = {

        // is the body fixed and imovable?
        fixed: false,
        // body mass
        mass: 1.0,
        // body restitution. How "bouncy" is it?
        restitution: 1.0,
        // what is its coefficient of friction with another surface with COF = 1?
        cof: 0.8,
        // what is the view object (mixed) that should be used when rendering?
        view: null
    };

    Physics.body = Decorator('body', {

        /**
         * Initialization
         * @param  {Object} options Config options passed by initializer
         * @return {void}
         */
        init: function( options ){

            var vector = Physics.vector;

            this.options = Physics.util.extend({}, defaults, options);

            // properties
            this.fixed = this.options.fixed;
            this.hidden = this.options.hidden;
            this.mass = this.options.mass;
            this.restitution = this.options.restitution;
            this.cof = this.options.cof;

            // placeholder for renderers
            this.view = this.options.view;

            // physical properties
            this.state = {
                pos: vector( options.x, options.y ),
                vel: vector( options.vx, options.vy ),
                acc: vector(),
                angular: {
                    pos: options.angle || 0.0,
                    vel: options.angularVelocity || 0.0,
                    acc: 0.0
                },
                old: {
                    pos: vector(),
                    vel: vector(),
                    acc: vector(),
                    angular: {
                        pos: 0.0,
                        vel: 0.0,
                        acc: 0.0
                    }
                }
            };

            if (this.mass === 0){
                throw "Error: Bodies must have non-zero mass";
            }

            // shape
            this.geometry = Physics.geometry('point');
        },

        /**
         * Accelerate the body by adding supplied vector to its current acceleration
         * @param  {Vector} acc The acceleration vector
         * @return {this}
         */
        accelerate: function( acc ){

            this.state.acc.vadd( acc );
            return this;
        },

        /**
         * Apply a force at center of mass, or at point "p" relative to the center of mass
         * @param  {Vector} force The force vector
         * @param  {Vector} p     (optional) The point vector from the COM at which to apply the force
         * @return {this}
         */
        applyForce: function( force, p ){

            var scratch = Physics.scratchpad()
                ,r = scratch.vector()
                ,state
                ;
                
            // if no point at which to apply the force... apply at center of mass
            if ( !p ){
                
                this.accelerate( r.clone( force ).mult( 1/this.mass ) );

            } else if ( this.moi ) {

                // apply torques
                state = this.state;
                r.clone( p );
                // r cross F
                this.state.angular.acc -= r.cross( force ) / this.moi;
                // projection of force towards center of mass
                this.applyForce( force );

            }

            scratch.done();

            return this;
        },

        /**
         * Get the Axis aligned bounding box for the body in its current position and rotation
         * @return {Object} The aabb values
         */
        aabb: function(){

            var scratch = Physics.scratchpad()
                ,trans = scratch.transform()
                ,angle = this.state.angular.pos
                ,aabb = scratch.aabb().set( this.geometry.aabb( angle ) )
                ;

            trans.setRotation( 0 ).setTranslation(this.state.pos);
            aabb.transform( trans );

            aabb = aabb.get();
            scratch.done();
            return aabb;
        },

        /**
         * Recalculate properties. Call when body physical properties are changed.
         * @abstract
         * @return {this}
         */
        recalc: function(){
            // override to recalculate properties
        }
    });

}());

// ---
// inside: src/core/geometry.js

(function(){

    Physics.geometry = Decorator('geometry', {

        /**
         * Initialization
         * @param  {Object} options Config options passed by initializer
         * @return {void}
         */
        init: function( options ){

            this._aabb = new Physics.aabb();
        },
        
        /**
         * Get axis-aligned bounding box for this object (rotated by angle if specified).
         * @param  {Number} angle (optional) The angle to rotate the geometry.
         * @return {Object}       Bounding box values
         */
        aabb: function( angle ){

            return this._aabb.get();
        },

        /**
         * Get farthest point on the hull of this geometry
         * along the direction vector "dir"
         * returns local coordinates
         * replaces result if provided
         * @param {Vector} dir Direction to look
         * @param {Vector} result (optional) A vector to write result to
         * @return {Vector} The farthest hull point in local coordinates
         */
        getFarthestHullPoint: function( dir, result ){

            result = result || Physics.vector();

            // not implemented.
            return result.set( 0, 0 );
        },

        /**
         * Get farthest point on the core of this geometry
         * along the direction vector "dir"
         * returns local coordinates
         * replaces result if provided
         * @param {Vector} dir Direction to look
         * @param {Vector} result (optional) A vector to write result to
         * @return {Vector} The farthest core point in local coordinates
         */
        getFarthestCorePoint: function( dir, result, margin ){

            result = result || Physics.vector();

            // not implemented.
            return result.set( 0, 0 );
        }
    });

}());

// ---
// inside: src/core/geometry-helpers.js

/**
 * Geometry helper functions
 */

/**
 * Determine if polygon hull is convex
 * @param  {Array}  hull Array of vertices (Vectorish)
 * @return {Boolean}
 */
Physics.geometry.isPolygonConvex = function( hull ){

    var scratch = Physics.scratchpad()
        ,prev = scratch.vector()
        ,next = scratch.vector()
        ,tmp = scratch.vector()
        ,ret = true
        ,sign = false
        ,l = hull.length
        ;

    if ( l < 3 ){
        // it must be a point or a line...
        // which are convex
        scratch.done();
        return ret;
    }

    prev.clone( hull[ 0 ] ).vsub( tmp.clone( hull[ l - 1 ] ) );

    // loop over the edges of the hull and construct vectors of the current
    // edge and retain the last edge
    // add two to the length to do a full cycle
    for ( var i = 1; i <= l; ++i ){
        
        next.clone( hull[ i % l ] ).vsub( tmp.clone( hull[ (i - 1) % l ] ) );

        if ( sign === false ){

            // first check the sign of the first cross product
            sign = prev.cross( next );

        } else if ( (sign > 0) ^ (prev.cross( next ) > 0) ){
        
            // if the cross products are different signs it's not convex
            ret = false;
            break;
        }

        // remember the last edge
        next.swap( prev );
    }

    scratch.done();
    return ret;
};

/**
 * Gets the moment of inertia of a convex polygon
 * @see: http://en.wikipedia.org/wiki/List_of_moments_of_inertia
 * assumptions: 
 *  * mass is unitary
 *  * axis of rotation is the origin
 * @param  {Array} hull Array of vertices (vectorish)
 * @return {Number} The polygon MOI
 */
Physics.geometry.getPolygonMOI = function( hull ){

    var scratch = Physics.scratchpad()
        ,prev = scratch.vector()
        ,next = scratch.vector()
        ,num = 0
        ,denom = 0
        ,tmp
        ,l = hull.length
        ;

    if ( l < 2 ){
        // it must be a point
        // moi = 0
        scratch.done();
        return 0;
    }

    if ( l === 2 ){
        // it's a line
        // get length squared
        tmp = next.clone( hull[ 1 ] ).distSq( prev.clone( hull[ 0 ] ) );
        scratch.done();
        return tmp / 12;
    }

    prev.clone( hull[ 0 ] );

    for ( var i = 1; i < l; ++i ){
        
        next.clone( hull[ i ] );

        tmp = Math.abs( next.cross( prev ) );
        num += tmp * ( next.normSq() + next.dot( prev ) + prev.normSq() );
        denom += tmp;

        prev.swap( next );
    }

    scratch.done();
    return num / ( 6 * denom );
};

/**
 * Check if point is inside polygon hull
 * @param  {Vectorish}  pt
 * @param  {Array}  hull Array of vertices (Vectorish)
 * @return {Boolean}
 */
Physics.geometry.isPointInPolygon = function( pt, hull ){

    var scratch = Physics.scratchpad()
        ,point = scratch.vector().clone( pt )
        ,prev = scratch.vector()
        ,next = scratch.vector()
        ,ang = 0
        ,l = hull.length
        ;

    if ( l < 2 ){
        // it's a point...
        ang = point.equals( prev.clone( hull[ 0 ] ));
        scratch.done();
        return ang;
    }

    if ( l === 2 ){
        // it's a line
        ang = point.angle( prev.clone( hull[ 0 ] ));
        ang += point.angle( prev.clone( hull[ 1 ] ));
        scratch.done();
        return ( Math.abs(ang) === Math.PI );
    }

    prev.clone( hull[ 0 ] ).vsub( point );

    // calculate the sum of angles between vector pairs
    // from point to vertices
    for ( var i = 1; i <= l; ++i ){
        
        next.clone( hull[ i % l ] ).vsub( point );
        ang += next.angle( prev );
        prev.swap( next );
    }

    scratch.done();
    return ( Math.abs(ang) > 0 );
};

/**
 * Get the signed area of the polygon
 * @param  {Array} hull Array of vertices
 * @return {Number} Area (positive for clockwise ordering)
 */
Physics.geometry.getPolygonArea = function getPolygonArea( hull ){

    var scratch = Physics.scratchpad()
        ,prev = scratch.vector()
        ,next = scratch.vector()
        ,ret = 0
        ,l = hull.length
        ;

    if ( l < 3 ){
        // it must be a point or a line
        // area = 0
        scratch.done();
        return 0;
    }

    prev.clone( hull[ l - 1 ] );

    for ( var i = 0; i < l; ++i ){
        
        next.clone( hull[ i ] );

        ret += prev.cross( next );

        prev.swap( next );
    }

    scratch.done();
    return ret / 2;
};

/**
 * Get the coordinates of the centroid
 * @param  {Array} hull Polygon hull definition
 * @return {Vector} centroid
 */
Physics.geometry.getPolygonCentroid = function getPolygonCentroid( hull ){

    var scratch = Physics.scratchpad()
        ,prev = scratch.vector()
        ,next = scratch.vector()
        ,ret = Physics.vector()
        ,tmp
        ,l = hull.length
        ;

    if ( l < 2 ){
        // it must be a point
        scratch.done();
        return Physics.vector( hull[0] );
    }

    if ( l === 2 ){
        // it's a line
        // get the midpoint
        scratch.done();
        return Physics.vector((hull[ 1 ].x + hull[ 0 ].x)/2, (hull[ 1 ].y + hull[ 0 ].y)/2 );
    }

    prev.clone( hull[ l - 1 ] );

    for ( var i = 0; i < l; ++i ){
        
        next.clone( hull[ i ] );

        tmp = prev.cross( next );
        prev.vadd( next ).mult( tmp );
        ret.vadd( prev );

        prev.swap( next );
    }

    tmp = 1 / (6 * Physics.geometry.getPolygonArea( hull ));

    scratch.done();
    return ret.mult( tmp );
};

/**
 * Get the closest point on a discrete line to specified point.
 * @param  {Vectorish} pt The point
 * @param  {Vectorish} linePt1 The first endpoint of the line
 * @param  {Vectorish} linePt2 The second endpoint of the line
 * @return {Vector} The closest point
 */
Physics.geometry.nearestPointOnLine = function nearestPointOnLine( pt, linePt1, linePt2 ){

    var scratch = Physics.scratchpad()
        ,p = scratch.vector().clone( pt )
        ,A = scratch.vector().clone( linePt1 ).vsub( p )
        ,L = scratch.vector().clone( linePt2 ).vsub( p ).vsub( A )
        ,lambdaB
        ,lambdaA
        ;

    if ( L.equals(Physics.vector.zero) ){
        // oh.. it's a zero vector. So A and B are both the closest.
        // just use one of them
        scratch.done();
        return Physics.vector( linePt1 );
    }

    lambdaB = - L.dot( A ) / L.normSq();
    lambdaA = 1 - lambdaB;

    if ( lambdaA <= 0 ){
        // woops.. that means the closest simplex point
        // isn't on the line it's point B itself
        scratch.done();
        return Physics.vector( linePt2 );
    } else if ( lambdaB <= 0 ){
        // vice versa
        scratch.done();
        return Physics.vector( linePt1 );
    }

    // guess we'd better do the math now...
    p = Physics.vector( linePt2 ).mult( lambdaB ).vadd( A.clone( linePt1 ).mult( lambdaA ) );
    scratch.done();
    return p;
};



// ---
// inside: src/core/integrator.js

/**
 * Base integrator definition
 */
(function(){

    var defaults = {

        // drag applied during integration
        // 0 means vacuum
        // 0.9 means molasses
        drag: 0
    };

    Physics.integrator = Decorator('integrator', {

        /**
         * Initialization
         * @param  {Object} options Config options passed by initializer
         * @return {void}
         */
        init: function( options ){
            
            this.options = Physics.util.extend({}, defaults, options);
        },

        /**
         * Integrate bodies by timestep
         * @param  {Array} bodies List of bodies to integrate
         * @param  {Number} dt     Timestep size
         * @return {this}
         */
        integrate: function( bodies, dt ){

            var world = this._world;

            this.integrateVelocities( bodies, dt );
            
            if ( world ){
                world.publish({
                    topic: 'integrate:velocities',
                    bodies: bodies,
                    dt: dt
                });
            }

            this.integratePositions( bodies, dt );
            
            if ( world ){
                world.publish({
                    topic: 'integrate:positions',
                    bodies: bodies,
                    dt: dt
                });
            }

            return this;
        },

        /**
         * Just integrate the velocities
         * @abstract
         * @param  {Array} bodies List of bodies to integrate
         * @param  {Number} dt     Timestep size
         */
        integrateVelocities: function( bodies, dt ){

            throw 'The integrator.integrateVelocities() method must be overriden';
        },

        /**
         * Just integrate the positions
         * @abstract
         * @param  {Array} bodies List of bodies to integrate
         * @param  {Number} dt     Timestep size
         */
        integratePositions: function( bodies, dt ){

            throw 'The integrator.integratePositions() method must be overriden';
        }
    });

}());

// ---
// inside: src/core/renderer.js

/**
 * Base renderer class definition
 */
(function(){

    var defaults = {
        // draw meta data (fps, steps, etc)
        meta: false,
        // refresh rate of meta info
        metaRefresh: 200,

        // width of viewport
        width: 600,
        // height of viewport
        height: 600
    };

    // Service
    Physics.renderer = Decorator('renderer', {

        /**
         * Initialization
         * @param  {Object} options Options passed to the initializer
         * @return {void}
         */
        init: function( options ){

            var el = typeof options.el === 'string' ? document.getElementById(options.el) : options.el
                ;

            this.options = Physics.util.extend({}, defaults, options);

            this.el = el ? el : document.body;

            this.drawMeta = Physics.util.throttle( Physics.util.bind(this.drawMeta, this), this.options.metaRefresh );
        },

        /**
         * Render the world bodies and meta. Called by world.render()
         * @param  {Array} bodies Array of bodies in the world (reference!)
         * @param  {Object} meta  meta object
         * @return {this}
         */
        render: function( bodies, meta ){

            var body
                ,view
                ,pos
                ;

            if (this.beforeRender){

                this.beforeRender();
            }

            this._world.publish({
                topic: 'beforeRender',
                renderer: this,
                bodies: bodies,
                stats: meta
            });

            if (this.options.meta){
                this.drawMeta( meta );
            }

            for ( var i = 0, l = bodies.length; i < l; ++i ){
                
                body = bodies[ i ];
                view = body.view || ( body.view = this.createView(body.geometry) );

                if ( !body.hidden ){
                    this.drawBody( body, view );
                }
            }

            return this;
        },

        /**
         * Create a view for the specified geometry
         * @abstract
         * @param  {Object} geometry The geometry
         * @return {Mixed} Whatever the renderer needs to render the body.
         */
        createView: function( geometry ){

            // example:
            // var el = document.createElement('div');
            // el.style.height = geometry.height + 'px';
            // el.style.width = geometry.width + 'px';
            // return el;
            throw 'You must overried the renderer.createView() method.';
        },

        /**
         * Draw the meta data.
         * @abstract
         * @param  {Object} meta The meta data
         */
        drawMeta: function( meta ){
            
            // example:
            // this.els.fps.innerHTML = meta.fps.toFixed(2);
            // this.els.steps.innerHTML = meta.steps;
            throw 'You must overried the renderer.drawMeta() method.';
        },

        /**
         * Draw specified body using specified view
         * @abstract
         * @param  {Object} body The body
         * @param  {Object} view The view
         */
        drawBody: function( body, view ){

            // example (pseudocode):
            // view.angle = body.state.angle
            // view.position = body.state.position
            throw 'You must overried the renderer.drawBody() method.';
        }

        
    });

}());

// ---
// inside: src/core/world.js

/**
 * The world class
 */
(function(){

    // bodies, behaviors, integrators, and renderers all need the setWorld method
    var setWorld = function( world ){

        if ( this.disconnect && this._world ){
            this.disconnect( this._world );
        }

        this._world = world;

        if ( this.connect && world ){
            this.connect( world );
        }
    };

    Physics.util.each('body,behavior,integrator,renderer'.split(','), function( key, val ){

        // add a setWorld method to all of these types
        Physics[ key ].mixin('setWorld', setWorld);
    });

    var defaults = {

        // default timestep
        timestep: 1000.0 / 160,
        // maximum number of iterations per step
        maxIPF: 16,
        webworker: false, // NOT YET IMPLEMENTED

        // default integrator
        integrator: 'verlet'
    };

    // begin world definitions
    /**
     * World Constructor
     * @param {Object}   cfg (optional) Configuration options
     * @param {Function} fn  (optional) Callback function called with "this" world
     */
    var World = function World( cfg, fn ){

        // allow creation of world without "new"
        if (!(this instanceof World)){
            return new World( cfg, fn );
        }
        
        this.init( cfg, fn );
    };

    World.prototype = {

        /**
         * Initialization
         * @param {Object}   cfg (optional) Configuration options
         * @param {Function} fn  (optional) Callback function called with "this" world
         * @return {void}
         */
        init: function( cfg, fn ){

            if ( Physics.util.isFunction( cfg ) ){
                fn = cfg;
                cfg = {};
            }

            this._stats = {
               // statistics (fps, etc)
               fps: 0,
               ipf: 0 
            }; 
            this._bodies = [];
            this._behaviors = [];
            this._integrator = null;
            this._renderer = null;
            this._paused = false;
            this._opts = {};
            this._pubsub = Physics.util.pubsub( this );

            // set options
            this.options( cfg || {} );

            // apply the callback function
            if ( Physics.util.isFunction( fn ) ){

                fn.call(this, this, Physics);
            }
        },

        /**
         * Get or set options
         * @param  {Object} cfg Config options to set
         * @return {Object|this}     Options or this
         */
        options: function( cfg ){

            if (cfg){

                // extend the defaults
                Physics.util.extend(this._opts, defaults, cfg);
                // set timestep
                this.timeStep(this._opts.timestep);
                // add integrator
                this.add(Physics.integrator(this._opts.integrator));

                return this;
            }

            return Physics.util.clone(this._opts);
        },

        /**
         * Subscribe to events
         * @param  {String}   topic    The event type
         * @param  {Function} fn       Callback function accepting data parameter
         * @param  {Object}   scope    (optional) The "this" context for the callback
         * @param  {Number}   priority (optional) Priority of the callback (higher numbers executed earlier)
         * @return {this}
         */
        subscribe: function( topic, fn, scope, priority ){

            this._pubsub.subscribe( topic, fn, scope, priority );
            return this;
        },

        /**
         * Unsubscribe from events
         * @param  {String}   topic    The event type
         * @param  {Function} fn       Original callback function
         * @return {this}
         */
        unsubscribe: function( topic, fn ){

            this._pubsub.unsubscribe( topic, fn );
            return this;
        },

        /**
         * Publish an event
         * @param  {Object} data  The data associated with the event
         * @param  {Object} scope (optional) The data.scope parameter
         * @return {this}
         */
        publish: function( data, scope ){

            this._pubsub.publish( data, scope );
            return this;
        },

        /**
         * Multipurpose add method. Add one or many bodies, behaviors, integrators, renderers...
         * @param {Object|Array} arg The thing to add, or array of things to add
         * @return {this}
         */
        add: function( arg ){

            var i = 0
                ,len = arg && arg.length || 0
                ,thing = len ? arg[ 0 ] : arg
                ,notify
                ;

            if ( !thing ){
                return this;
            }

            // we'll either cycle through an array
            // or just run this on the arg itself
            do {
                switch (thing.type){

                    case 'behavior':
                        this.addBehavior(thing);
                    break; // end behavior

                    case 'integrator':
                        this.integrator(thing);
                    break; // end integrator

                    case 'renderer':
                        this.renderer(thing);
                    break; // end renderer

                    case 'body':
                        this.addBody(thing);
                    break; // end body
                    
                    default:
                        throw 'Error: failed to add item of type '+ thing.type +' to world';
                    // end default
                }

                // notify
                notify = {
                    topic: 'add:' + thing.type
                };

                notify[ thing.type ] = thing;

                this.publish( notify );

            } while ( ++i < len && (thing = arg[ i ]) );

            return this;
        },

        /**
         * Get or Set the integrator
         * @param {Object} integrator Integrator instance to use
         * @return {this|Object} This or Integrator
         */
        integrator: function( integrator ){

            if (!integrator){
                return this._integrator;
            }

            if ( this._integrator ){

                this._integrator.setWorld( null );
            }

            this._integrator = integrator;
            this._integrator.setWorld( this );

            return this;
        },

        /**
         * Get or Set renderer
         * @param  {Object} renderer The renderer to set
         * @return {this|Object}          This or Renderer
         */
        renderer: function( renderer ){

            if (!renderer){
                return this._renderer;
            }

            if ( this._renderer ){

                this._renderer.setWorld( null );
            }

            this._renderer = renderer;
            this._renderer.setWorld( this );
            return this;
        },

        /**
         * Get or Set timestep
         * @param  {Number} dt The timestep size
         * @return {this|Number}    This or the timestep
         */
        timeStep: function( dt ){

            if ( dt ){

                this._dt = dt;
                // calculate the maximum jump in time over which to do iterations
                this._maxJump = dt * this._opts.maxIPF;

                return this;
            }

            return this._dt;
        },

        /**
         * Add behavior to the world
         * @param {Object} behavior The behavior to add
         * @return {this} 
         */
        addBehavior: function( behavior ){

            behavior.setWorld( this );
            this._behaviors.push( behavior );
            return this;
        },

        /**
         * Remove behavior from the world
         * @param {Object} behavior The behavior to remove
         * @return {this} 
         */
        removeBehavior: function( behavior ){

            var behaviors = this._behaviors
                ,notify
                ;

            if (behavior){
                
                for ( var i = 0, l = behaviors.length; i < l; ++i ){
                    
                    if (behavior === behaviors[ i ]){
                        
                        behaviors.splice( i, 1 );
                        break;
                    }
                }

                // notify
                notify = {
                    topic: 'remove:behavior'
                };

                notify.behavior = behavior;

                this.publish( notify );
            }

            return this;
        },

        /**
         * Add body to the world
         * @param {Object} body The body to add
         * @return {this} 
         */
        addBody: function( body ){

            body.setWorld( this );
            this._bodies.push( body );
            return this;
        },

        /**
         * Get copied list of bodies in the world
         * @return {Array} Array of bodies
         */
        getBodies: function(){

            // return the copied array
            return [].concat(this._bodies);
        },

        /**
         * Remove body from the world
         * @param {Object} body The body to remove
         * @return {this} 
         */
        removeBody: function( body ){

            var bodies = this._bodies
                ,notify
                ;

            if (body){
                
                for ( var i = 0, l = bodies.length; i < l; ++i ){
                    
                    if (body === bodies[ i ]){
                        
                        bodies.splice( i, 1 );
                        break;
                    }
                }

                // notify
                notify = {
                    topic: 'remove:body'
                };

                notify.body = body;

                this.publish( notify );
            }

            return this;
        },

        /**
         * Find first matching body based on query parameters
         * @param  {Object} query The query
         * @return {Object|false}       Body or false if no match
         */
        findOne: function( query ){

            // @TODO: refactor to use a new Query object helper
            // @TODO: make $and the default. not $or.
            var list = {
                    check: function( arg ){
                        var fn = this;
                        while ( fn = fn.next ){

                            if ( fn( arg ) ){
                                return true;
                            }
                        }
                        return false;
                    }
                }
                ,test = list
                ,bodies = this._bodies
                ;

            // init tests
            if ( query.$within ){
                //aabb
            }
            if ( query.$at ){

                test.next = function( body ){

                    var aabb = body.aabb();
                    return Physics.aabb.contains( aabb, query.$at );
                };
            }

            // do search
            for ( var i = 0, l = bodies.length; i < l; ++i ){
                
                if (list.check( bodies[ i ] )){
                    return bodies[ i ];
                }
            }

            return false;
        },

        /**
         * Do a single iteration
         * @private
         * @param  {Number} dt The timestep size
         * @return {void}
         */
        iterate: function( dt ){

            this._integrator.integrate( this._bodies, dt );
        },

        /**
         * Do a single step
         * @param  {Number} now Current unix timestamp
         * @return {this}
         */
        step: function( now ){
            
            if ( this._paused ){

                this._time = false;
                return this;
            }

            var time = this._time || (this._time = now)
                ,diff = now - time
                ,stats = this._stats
                ,dt = this._dt
                ;

            if ( !diff ){
                return this;
            }
            
            // limit number of iterations in each step
            if ( diff > this._maxJump ){

                this._time = now - this._maxJump;
                diff = this._maxJump;
            }

            // set some stats
            stats.fps = 1000/diff;
            stats.ipf = Math.ceil(diff/this._dt);

            while ( this._time < now ){
                this._time += dt;
                this.iterate( dt );
            }

            this.publish({
                topic: 'step'
            });
            return this;
        },

        /**
         * Render current world state using the renderer
         * @return {this}
         */
        render: function(){

            if ( !this._renderer ){
                throw "No renderer added to world";
            }
            
            this._renderer.render( this._bodies, this._stats );
            this.publish({
                topic: 'render',
                bodies: this._bodies,
                stats: this._stats,
                renderer: this._renderer
            });
            return this;
        },

        /**
         * Pause the world. (step calls do nothing)
         * @return {this}
         */
        pause: function(){

            this._paused = true;
            this.publish({
                topic: 'pause'
            });
            return this;
        },

        /**
         * Unpause the world. (step calls continue as usual)
         * @return {this}
         */
        unpause: function(){

            this._paused = false;
            this.publish({
                topic: 'unpause'
            });
            return this;
        },

        /**
         * Determine if world is paused
         * @return {Boolean} Is the world paused?
         */
        isPaused: function(){

            return !!this._paused;
        }
    };

    Physics.world = World;
    
}());

// ---
// inside: src/integrators/verlet.js

Physics.integrator('verlet', function( parent ){

    // for this integrator we need to know if the object has been integrated before
    // so let's add a mixin to bodies

    Physics.body.mixin({

        started: function( val ){
            if ( val !== undefined ){
                this._started = true;
            }

            return !!this._started;
        }
    });


    return {

        /**
         * Initialization
         * @param  {Object} options Configuration options
         * @return {void}
         */
        init: function( options ){

            // call parent init
            parent.init.call(this, options);
        },

        /**
         * Velocity integration
         * @param  {Array} bodies Array of bodies to integrate
         * @param  {Number} dt     Timestep size
         * @return {void}
         */
        integrateVelocities: function( bodies, dt ){

            // half the timestep
            var dtdt = dt * dt
                ,drag = 1 - this.options.drag
                ,body = null
                ,state
                ;

            for ( var i = 0, l = bodies.length; i < l; ++i ){

                body = bodies[ i ];
                state = body.state;

                // only integrate if the body isn't fixed
                if ( !body.fixed ){

                    // Inspired from https://github.com/soulwire/Coffee-Physics
                    // @licence MIT
                    // 
                    // v = x - ox
                    // x = x + (v + a * dt * dt)

                    // use the velocity in vel if the velocity has been changed manually
                    if (state.vel.equals( state.old.vel ) && body.started()){
                            
                        // Get velocity by subtracting old position from curr position
                        state.vel.clone( state.pos ).vsub( state.old.pos );

                    } else {

                        state.old.pos.clone( state.pos ).vsub( state.vel );
                        // so we need to scale the value by dt so it 
                        // complies with other integration methods
                        state.vel.mult( dt );
                    }

                    // Apply "air resistance".
                    if ( drag ){

                        state.vel.mult( drag );
                    }

                    // Apply acceleration
                    // v += a * dt * dt
                    state.vel.vadd( state.acc.mult( dtdt ) );

                    // normalize velocity 
                    state.vel.mult( 1/dt );

                    // store calculated velocity
                    state.old.vel.clone( state.vel );

                    // Reset accel
                    state.acc.zero();

                    //
                    // Angular components
                    // 

                    if (state.angular.vel === state.old.angular.vel && body.started()){

                        state.angular.vel = (state.angular.pos - state.old.angular.pos);

                    } else {

                        state.old.angular.pos = state.angular.pos - state.angular.vel;
                        state.angular.vel *= dt;
                    }

                    state.angular.vel += state.angular.acc * dtdt;
                    state.angular.vel /= dt;
                    state.old.angular.vel = state.angular.vel;
                    state.angular.acc = 0;

                    body.started( true );

                } else {
                    // set the velocity and acceleration to zero!
                    state.vel.zero();
                    state.acc.zero();
                    state.angular.vel = 0;
                    state.angular.acc = 0;
                }
            }
        },

        /**
         * Position integration
         * @param  {Array} bodies Array of bodies to integrate
         * @param  {Number} dt     Timestep size
         * @return {void}
         */
        integratePositions: function( bodies, dt ){

            // half the timestep
            var dtdt = dt * dt
                ,body = null
                ,state
                ;

            for ( var i = 0, l = bodies.length; i < l; ++i ){

                body = bodies[ i ];
                state = body.state;

                // only integrate if the body isn't fixed
                if ( !body.fixed ){

                    // so we need to scale the value by dt so it 
                    // complies with other integration methods
                    state.vel.mult( dt );
                
                    // Store old position.
                    // xold = x
                    state.old.pos.clone( state.pos );

                    state.pos.vadd( state.vel );

                    // normalize velocity 
                    state.vel.mult( 1/dt );

                    // store calculated velocity
                    state.old.vel.clone( state.vel );

                    //
                    // Angular components
                    // 

                    
                    state.angular.vel *= dt;
                
                    state.old.angular.pos = state.angular.pos;

                    state.angular.pos += state.angular.vel;
                    state.angular.vel /= dt;
                    state.old.angular.vel = state.angular.vel;
                }
            }
        }
    };
});



// ---
// inside: src/geometries/point.js

/**
 * Point geometry
 * @module geometries/point
 */
Physics.geometry('point', function( parent ){

    // alias of default
});


// ---
// inside: src/outro.js

return Physics;
}));