/**
 * physicsjs v0.0.1a - 2013-05-03
 * A decent javascript physics engine
 *
 * Copyright (c) 2013 Jasper Palfree <jasper@wellcaffeinated.net>
 * Licensed MIT
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

    var Physics = function Physics(){

        return Physics.world.apply(Physics, arguments);
    };

    Physics.util = {};

(function(window,Physics,undefined){

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Detect free variable `global`, from Node.js or Browserified code, and use it as `window` */
  var freeGlobal = typeof global == 'object' && global;
  if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
    window = freeGlobal;
  }

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used internally to indicate various things */
  var indicatorObject = {};

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 200;

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
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

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

  /*--------------------------------------------------------------------------*/

  /** Used for `Array` and `Object` method references */
  var arrayRef = Array(),
      objectRef = Object();

  /** Used to restore the original `_` reference in `noConflict` */
  var oldDash = window._;

  /** Used to detect if a method is native */
  var reNative = RegExp('^' +
    String(objectRef.valueOf)
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/valueOf|for [^\]]+/g, '.+?') + '$'
  );

  /** Native method shortcuts */
  var ceil = Math.ceil,
      clearTimeout = window.clearTimeout,
      concat = arrayRef.concat,
      floor = Math.floor,
      hasOwnProperty = objectRef.hasOwnProperty,
      push = arrayRef.push,
      setTimeout = window.setTimeout,
      toString = objectRef.toString;

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeBind = reNative.test(nativeBind = toString.bind) && nativeBind,
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
   * `tap`, `throttle`, `times`, `toArray`, `union`, `uniq`, `unshift`, `unzip`,
   * `values`, `where`, `without`, `wrap`, and `zip`
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
    support.enumPrototypes = ctor.propertyIsEnumerable('prototype');

    /**
     * Detect if `Function#bind` exists and is inferred to be fast (all but V8).
     *
     * @memberOf _.support
     * @type Boolean
     */
    support.fastBind = nativeBind && !isV8;

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
    ';\n';
     if (obj.arrays) {
    __p += 'var length = iterable.length; index = -1;\nif (' +
    (obj.arrays) +
    ') {  ';
     if (support.unindexedChars) {
    __p += '\n  if (isString(iterable)) {\n    iterable = iterable.split(\'\')\n  }  ';
     }
    __p += '\n  while (++index < length) {\n    ' +
    (obj.loop) +
    '\n  }\n}\nelse {  ';
      } else if (support.nonEnumArgs) {
    __p += '\n  var length = iterable.length; index = -1;\n  if (length && isArguments(iterable)) {\n    while (++index < length) {\n      index += \'\';\n      ' +
    (obj.loop) +
    '\n    }\n  } else {  ';
     }

     if (support.enumPrototypes) {
    __p += '\n  var skipProto = typeof iterable == \'function\';\n  ';
     }

     if (obj.useHas && obj.useKeys) {
    __p += '\n  var ownIndex = -1,\n      ownProps = objectTypes[typeof iterable] ? keys(iterable) : [],\n      length = ownProps.length;\n\n  while (++ownIndex < length) {\n    index = ownProps[ownIndex];\n    ';
     if (support.enumPrototypes) {
    __p += 'if (!(skipProto && index == \'prototype\')) {\n  ';
     }
    __p += 
    (obj.loop);
     if (support.enumPrototypes) {
    __p += '}\n';
     }
    __p += '  }  ';
     } else {
    __p += '\n  for (index in iterable) {';
        if (support.enumPrototypes || obj.useHas) {
    __p += '\n    if (';
          if (support.enumPrototypes) {
    __p += '!(skipProto && index == \'prototype\')';
     }      if (support.enumPrototypes && obj.useHas) {
    __p += ' && ';
     }      if (obj.useHas) {
    __p += 'hasOwnProperty.call(iterable, index)';
     }
    __p += ') {    ';
     }
    __p += 
    (obj.loop) +
    ';    ';
     if (support.enumPrototypes || obj.useHas) {
    __p += '\n    }';
     }
    __p += '\n  }    ';
     if (support.nonEnumShadows) {
    __p += '\n\n  var ctor = iterable.constructor;\n      ';
     for (var k = 0; k < 7; k++) {
    __p += '\n  index = \'' +
    (obj.shadowedProps[k]) +
    '\';\n  if (';
          if (obj.shadowedProps[k] == 'constructor') {
    __p += '!(ctor && ctor.prototype === iterable) && ';
          }
    __p += 'hasOwnProperty.call(iterable, index)) {\n    ' +
    (obj.loop) +
    '\n  }      ';
     }

     }

     }

     if (obj.arrays || support.nonEnumArgs) {
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
    'arrays': "typeof length == 'number'",
    'loop': 'if (callback(iterable[index], index, collection) === false) return result'
  };

  /** Reusable iterator options for `forIn` and `forOwn` */
  var forOwnIteratorOptions = {
    'top': 'if (!objectTypes[typeof iterable]) return result;\n' + eachIteratorOptions.top,
    'arrays': false
  };

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a function optimized to search large arrays for a given `value`,
   * starting at `fromIndex`, using strict equality for comparisons, i.e. `===`.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {Mixed} value The value to search for.
   * @returns {Boolean} Returns `true`, if `value` is found, else `false`.
   */
  function cachedContains(array) {
    var length = array.length,
        isLarge = length >= largeArraySize;

    if (isLarge) {
      var cache = {},
          index = -1;

      while (++index < length) {
        var key = keyPrefix + array[index];
        (cache[key] || (cache[key] = [])).push(array[index]);
      }
    }
    return function(value) {
      if (isLarge) {
        var key = keyPrefix + value;
        return  cache[key] && indexOf(cache[key], value) > -1;
      }
      return indexOf(array, value) > -1;
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default `callback` when a given
   * `collection` is a string value.
   *
   * @private
   * @param {String} value The character to inspect.
   * @returns {Number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` values, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {Number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ai = a.index,
        bi = b.index;

    a = a.criteria;
    b = b.criteria;

    // ensure a stable sort in V8 and other engines
    // http://code.google.com/p/v8/issues/detail?id=90
    if (a !== b) {
      if (a > b || typeof a == 'undefined') {
        return 1;
      }
      if (a < b || typeof b == 'undefined') {
        return -1;
      }
    }
    return ai < bi ? -1 : 1;
  }

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
        noop.prototype = func.prototype;
        thisBinding = new noop;
        noop.prototype = null;

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
   *  arrays - A string of code to determine if the iterable is an array or array-like.
   *  useHas - A boolean to specify using `hasOwnProperty` checks in the object loop.
   *  useKeys - A boolean to specify using `_.keys` for own property iteration.
   *  args - A string of comma separated arguments the iteration function will accept.
   *  top - A string of code to execute before the iteration branches.
   *  loop - A string of code to execute in the object loop.
   *  bottom - A string of code to execute after the iteration branches.
   * @returns {Function} Returns the compiled function.
   */
  function createIterator() {
    var data = {
      // data properties
      'shadowedProps': shadowedProps,
      // iterator options
      'arrays': 'isArray(iterable)',
      'bottom': '',
      'init': 'iterable',
      'loop': '',
      'top': '',
      'useHas': true,
      'useKeys': !!keys
    };

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
        'hasOwnProperty, isArguments, isArray, keys, ' +
        'lodash, objectTypes',
      'return function(' + args + ') {\n' + iteratorTemplate(data) + '\n}'
    );
    // return the compiled function
    return factory(
      hasOwnProperty, isArguments, isArray, keys,
      lodash, objectTypes
    );
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {String} match The matched character to escape.
   * @returns {String} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Used by `escape` to convert characters to HTML entities.
   *
   * @private
   * @param {String} match The matched character to escape.
   * @returns {String} Returns the escaped character.
   */
  function escapeHtmlChar(match) {
    return htmlEscapes[match];
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

  /**
   * Used by `unescape` to convert HTML entities to characters.
   *
   * @private
   * @param {String} match The matched character to unescape.
   * @returns {String} Returns the unescaped character.
   */
  function unescapeHtmlChar(match) {
    return htmlUnescapes[match];
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
    'loop': 'result.push(index)',
    'arrays': false
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
   * Used to convert characters to HTML entities:
   *
   * Though the `>` character is escaped for symmetry, characters like `>` and `/`
   * don't require escaping in HTML and have no special meaning unless they're part
   * of a tag or an unquoted attribute value.
   * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
   */
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  /** Used to convert HTML entities to characters */
  var htmlUnescapes = {'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#x27;':"'"};

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
  function isArray(value) {
    // `instanceof` may cause a memory leak in IE 7 if `value` is a host object
    // http://ajaxian.com/archives/working-aroung-the-instanceof-memory-leak
    return (support.argsObject && value instanceof Array) ||
      (nativeIsArray ? nativeIsArray(value) : toString.call(value) == arrayClass);
  }

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
    stackA || (stackA = []);
    stackB || (stackB = []);

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
      return value instanceof Function || toString.call(value) == funcClass;
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
    return value ? objectTypes[typeof value] : false;
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
    if (typeof thisArg != 'undefined') {
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
    return func;
  }

  /**
   * Creates a function that, when executed, will only call the `func` function
   * at most once per every `wait` milliseconds. If the throttled function is
   * invoked more than once during the `wait` timeout, `func` will also be called
   * on the trailing edge of the timeout. Pass an `options` object to indicate
   * that `func` should be invoked on the leading and/or trailing edge of the
   * `wait` timeout. Subsequent calls to the throttled function will return
   * the result of the last `func` call.
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
   */
  function throttle(func, wait, options) {
    var args,
        result,
        thisArg,
        timeoutId,
        lastCalled = 0,
        leading = true,
        trailing = true;

    function trailingCall() {
      lastCalled = new Date;
      timeoutId = null;

      if (trailing) {
        result = func.apply(thisArg, args);
      }
    }
    if (options === false) {
      leading = false;
    } else if (options && objectTypes[typeof options]) {
      leading = 'leading' in options ? options.leading : leading;
      trailing = 'trailing' in options ? options.trailing : trailing;
    }
    return function() {
      var now = new Date;
      if (!timeoutId && !leading) {
        lastCalled = now;
      }
      var remaining = wait - (now - lastCalled);
      args = arguments;
      thisArg = this;

      if (remaining <= 0) {
        clearTimeout(timeoutId);
        timeoutId = null;
        lastCalled = now;
        result = func.apply(thisArg, args);
      }
      else if (!timeoutId) {
        timeoutId = setTimeout(trailingCall, remaining);
      }
      return result;
    };
  }

  /*--------------------------------------------------------------------------*/

  /**
   * This function returns the first argument passed to it.
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

  /*--------------------------------------------------------------------------*/

  lodash.assign = assign;
  lodash.bind = bind;
  lodash.createCallback = createCallback;
  lodash.forIn = forIn;
  lodash.forOwn = forOwn;
  lodash.keys = keys;
  lodash.throttle = throttle;

  lodash.extend = assign;

  /*--------------------------------------------------------------------------*/

  lodash.identity = identity;
  lodash.isArguments = isArguments;
  lodash.isArray = isArray;
  lodash.isEqual = isEqual;
  lodash.isFunction = isFunction;
  lodash.isObject = isObject;
  lodash.sortedIndex = sortedIndex;

  /*--------------------------------------------------------------------------*/

  /**
   * The semantic version number.
   *
   * @static
   * @memberOf _
   * @type String
   */
  lodash.VERSION = '1.2.0';

  /*--------------------------------------------------------------------------*/

;lodash.extend(Physics.util, lodash);}(this,Physics));
var Decorator = function Decorator( type, proto ){

    var registry = {}
        ,base = function(){}
        ;

    // TODO: not sure of the best way to make the constructor names
    // transparent and readable in debug consoles...
    proto = proto || {};
    proto.type = type;

    // little function to set the world
    proto.setWorld = function( world ){

        this._world = world;
    };
    
    return function factory( name, parentName, decorator, cfg ){

        var instance
            ,result
            ,parent = proto
            ;

        if ( typeof parentName !== 'string' ){

            cfg = decorator;
            decorator = parentName;

        } else {

            parent = registry[ parentName ].prototype;
        }

        if ( typeof decorator === 'function' ){

            // store the new class
            result = registry[ name ] = function constructor( opts ){
                if (this.init){
                    this.init( opts );
                }
            };

            result.prototype = Physics.util.extend({}, parent, decorator( parent ));
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
};
(function(window){
    var log;

    if (window && window.console && window.console.log){
        log = function(){
            window.console.log.apply(window, arguments);
        };
    } else {
        log = function(){};
    }

    Physics.util.log = log;
}(this));
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
(function(window){
        
var lastTime = 0
    ,active = false
    ,listeners = []
    ;

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

function start(){
    
    lastTime = (new Date()).getTime();
    active = true;
    step();

    return this;
}

function stop(){

    active = false;
    return this;
}

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
(function(){

    var AABB = function AABB( minX, minY, maxX, maxY ){

        // enforce instantiation
        if ( !(this instanceof AABB) ){

            return new AABB( minX, minY, maxX, maxY );
        }

        this._pos = Physics.vector();
        
        this.set( minX, minY, maxX, maxY );
    };

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

    AABB.prototype.get = function get(){

        return {
            pos: this._pos.values(),
            halfWidth: this.halfWidth(),
            halfHeight: this.halfHeight()
        };
    };

    AABB.prototype.halfWidth = function halfWidth(){

        return this._hw;
    };

    AABB.prototype.halfHeight = function halfHeight(){

        return this._hh;
    };

    // check if point is inside bounds
    AABB.prototype.contains = function contains( pt ){

        return  (pt.get(0) > (this._pos.get(0) - this._hw)) && 
                (pt.get(0) < (this._pos.get(0) + this._hw)) &&
                (pt.get(1) > (this._pos.get(1) - this._hh)) &&
                (pt.get(1) < (this._pos.get(1) + this._hh));
    };

    // apply a transformation to both vectors
    AABB.prototype.transform = function transform( trans ){

        this._pos.transform( trans );
        return this;
    };

    Physics.aabb = AABB;
}());
// Gilbert–Johnson–Keerthi object collison algorithm
// For general information about GJK see: 
// * http://www.codezealot.org/archives/88
// * http://mollyrocket.com/849
(function(){

// the algorithm doesn't always converge for curved shapes.
// need these constants to dictate how accurate we want to be.
var gjkAccuracy = 0.001;
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
(function(window){
    
/**
 * begin Transform Class
 * @class Transform
 */

/**
 * Transform Constructor / Factory
 * @param {Physics.vector|Physics.transform} vect (optional) vector to use for translation or a transform to copy
 * @param {Number} angle (optional) Angle (radians) to use for rotation
 */
var Transform = function Transform( vect, angle ) {

    if (!(this instanceof Transform)){
        return new Transform( vect, angle );
    }

    this.v = Physics.vector();
    this.angle = 0;

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
 */
Transform.prototype.setRotation = function( angle ){

    this.angle = 0;
    this.cosA = Math.cos( angle );
    this.sinA = Math.sin( angle );
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
        this.setRotation( t.angle );

        return this;
    }

    return new Transform( this );
};

Physics.transform = Transform;

})(this);
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
 * begin Vector Class
 * @class Vector
 */

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

    var ang = atan2(this._[ 1 ], this._[ 0 ]);

    if (v){
        ang -= atan2(v._[ 1 ], v._[ 0 ]);
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
        this._[ 0 ] * t.cosA + this._[ 1 ] * t.sinA + t.v._[ 0 ], 
        - this._[ 0 ] * t.sinA + this._[ 1 ] * t.cosA + t.v._[ 1 ]
    );
};

/**
 * Apply an inverse transform to this vector
 * @param  {Physics.transform} t The transform
 */
Vector.prototype.transformInv = function( t ){

    return this.set(
        this._[ 0 ] * t.cosA - this._[ 1 ] * t.sinA - t.v._[ 0 ], 
        this._[ 0 ] * t.sinA + this._[ 1 ] * t.cosA - t.v._[ 1 ]
    );
};

/**
 * Apply the rotation portion of transform to this vector
 * @param  {Physics.transform} t The transform
 */
Vector.prototype.rotate = function( t ){

    return this.set(
        this._[ 0 ] * t.cosA + this._[ 1 ] * t.sinA, 
        - this._[ 0 ] * t.sinA + this._[ 1 ] * t.cosA
    );
};

/**
 * Apply an inverse rotation portion of transform to this vector
 * @param  {Physics.transform} t The transform
 */
Vector.prototype.rotateInv = function( t ){

    return this.set(
        this._[ 0 ] * t.cosA - this._[ 1 ] * t.sinA, 
        this._[ 0 ] * t.sinA + this._[ 1 ] * t.cosA
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

    this._[0] = min(max(this._[0], minV._[0]), maxV._[0]);
    this._[1] = min(max(this._[1], minV._[1]), maxV._[1]);
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

/**
 * end Vector class
 */
}(this));

(function(){

    // Service
    Physics.behavior = Physics.behaviour = Decorator('behavior', {

        // lowest priority by default
        priority: 0,

        init: function(){
            //empty
        },

        behave: function( bodies, dt ){

            throw 'The behavior.behave() method must be overriden';
        }
    });

}());
(function(){

    // Service
    Physics.body = Decorator('body', {

        // prototype methods
        init: function( options ){

            var vector = Physics.vector;

            // properties
            this.fixed = options.fixed || false;
            this.mass = options.mass || 1.0;
            this.restitution = options.restitution || 1.0;
            this.cof = options.cof || 0.8;
            // moment of inertia
            this.moi = 0.0;

            // placeholder for renderers
            this.view = null;

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

        accelerate: function( acc ){

            this.state.acc.vadd( acc );
            return this;
        },

        // p relative to center of mass
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

        aabb: function(){

            var scratch = Physics.scratchpad()
                ,trans = scratch.transform()
                ,aabb = Physics.aabb(this.geometry.aabb())
                ;

            trans.setRotation(this.state.angular.pos).setTranslation(this.state.pos);
            aabb.transform( trans );

            scratch.done();
            return aabb.get();
        },

        recalc: function(){
            // override to recalculate properties
        }
    });

}());
(function(){

    var ERROR_UNSUPPORTED_ARG = "Error: Unsupported argument";

    // Service
    Physics.geometry = Decorator('geometry', {

        // prototype methods
        init: function( options ){

            this._aabb = new Physics.aabb();
        },
        
        // get axis-aligned bounding box for this object.
        // Intended to be overridden.
        aabb: function(){

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

    // utility functions

    // check if polygon array is convex
    // points are assumed to wrap clockwise
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

    // gets the moment of inertia of a 
    // convex polygon
    // see: http://en.wikipedia.org/wiki/List_of_moments_of_inertia
    // assumptions: 
    //  * mass is unitary
    //  * axis of rotation is the origin
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
     * @param  {Vector-like}  pt
     * @param  {Array(Vector-likes)}  hull
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
     * @param  {Array} hull Polygon hull definition
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
     * @param  {Vector-like} pt The point
     * @param  {Vector-like} linePt1 The first endpoint of the line
     * @param  {Vector-like} linePt2 The second endpoint of the line
     * @return {Number}
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

}());
(function(){

    var defaults = {

        // 0 means vacuum
        // 0.9 means molasses
        drag: 0
    };

    // Service
    Physics.integrator = Decorator('integrator', {

        init: function( options ){
            
            this.options = Physics.util.extend({}, defaults, options);
        },

        // prototype
        integrate: function( bodies, dt ){

            throw 'The integrator.integrate() method must be overriden';
        }
    });

}());
(function(){

    var defaults = {
        // draw meta data (fps, steps, etc)
        meta: true,
        // refresh rate of meta info
        metaRefresh: 200,

        width: 600,
        height: 600
    };

    // Service
    Physics.renderer = Decorator('renderer', {

        init: function( options ){

            var el = typeof options.el === 'string' ? document.getElementById(options.el) : options.el
                ;

            this.options = Physics.util.extend({}, defaults, options);

            this.el = el ? el : document.body;

            this.drawMeta = Physics.util.throttle( Physics.util.bind(this.drawMeta, this), this.options.metaRefresh );
        },

        // prototype methods
        render: function( bodies, stats ){

            var body
                ,view
                ,pos
                ;

            if (this.beforeRender){

                this.beforeRender();
            }

            if (this.options.meta){
                this.drawMeta( stats );
            }

            for ( var i = 0, l = bodies.length; i < l; ++i ){
                
                body = bodies[ i ];
                view = body.view || ( body.view = this.createView(body.geometry) );

                this.drawBody( body, view );
            }
        },

        // methods that should be overridden
        createView: function( geometry ){

            // example:
            // var el = document.createElement('div');
            // el.style.height = geometry.height + 'px';
            // el.style.width = geometry.width + 'px';
            // return el;
        },

        drawMeta: function( stats ){
            
            // example:
            // this.els.fps.innerHTML = stats.fps.toFixed(2);
            // this.els.steps.innerHTML = stats.steps;
        },

        drawBody: function( body, view ){

            // example (pseudocode):
            // view.angle = body.state.angle
            // view.position = body.state.position
        }

        
    });

}());
// scratchpad
// thread-safe management of temporary (voletile)
// objects for use in calculations
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
        this.transformIndex = 0;
        this.objectStack = [];
        this.arrayStack = [];
        this.vectorStack = [];
        this.transformStack = [];

        if (++numScratches >= SCRATCH_MAX_SCRATCHES){
            throw SCRATCH_MAX_REACHED;
        }
    };

    ScratchCls.prototype = {

        // declare that your work is finished
        done: function(){

            this._active = false;
            this.objIndex = this.arrayIndex = this.vectorIndex = this.transformIndex = 0;
            // add it back to the scratch stack for future use
            scratches.push(this);
        },

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
    
    Physics.scratchpad = function(){

        var scratch = scratches.pop() || new ScratchCls();
        scratch._active = true;
        return scratch;
    };

})();
(function(){

var PRIORITY_PROP_NAME = 'priority';

var defaults = {
    name: false,
    timestep: 1000.0 / 160,
    maxSteps: 16,
    webworker: false, // to implement
    integrator: 'verlet'
};

var World = function World( cfg, fn ){

    if (!(this instanceof World)){
        return new World( cfg, fn );
    }
    
    this.init( cfg, fn );
};

World.prototype = {

    init: function( cfg, fn ){

        // prevent double initialization
        this.init = true;

        this._stats = {
           // statistics (fps, etc)
           fps: 0,
           steps: 0 
        }; 
        this._bodies = [];
        this._behaviorStack = [];
        this._integrator = null;
        this._renderer = null;
        this._paused = false;
        this._opts = {};
        this._pubsub = {};

        // set options
        this.options( cfg );

        // apply the callback function
        if (typeof fn === 'function'){

            fn.apply(this, [ this ]);
        }
    },

    // get/set options
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

        return Physics.util.extend({}, this._opts);
    },

    subscribe: function( topic, fn, scope ){

        var listeners = this._pubsub[ topic ] || (this._pubsub[ topic ] = [])
            ,orig = fn
            ;

        if ( scope ){
            
            fn = Physics.util.bind( fn, scope );
            fn._bindfn_ = orig;
        }

        listeners.push( fn );

        return this;
    },

    unsubscribe: function( topic, fn ){

        var listeners = this._pubsub[ topic ]
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

    publish: function( data, scope ){

        if (typeof data !== 'object'){
            data = { topic: data };
        }

        var topic = data.topic
            ,listeners = this._pubsub[ topic ]
            ;

        if (!listeners || !listeners.length){
            return this;
        }
        
        data.scope = data.scope || this;

        for ( var i = 0, l = listeners.length; i < l; i++ ){
            
            listeners[ i ]( data );
        }

        return this;
    },

    // add objects, integrators, behaviors...
    add: function( arg ){

        var i = 0
            ,len = arg && arg.length || 0
            ,thing = len ? arg[ 0 ] : arg
            ;

        // we'll either cycle through an array
        // or just run this on the arg itself
        do {
            switch (thing.type){

                case 'behavior':
                    this.addBehavior(thing);
                break; // end behavior

                case 'integrator':
                    this._integrator = thing;
                break; // end integrator

                case 'renderer':
                    this._renderer = thing;
                break; // end renderer

                case 'body':
                    this.addBody(thing);
                break; // end body
                
                default:
                    throw 'Error: failed to add item of unknown type to world';
                // end default
            }
        } while ( ++i < len && (thing = arg[ i ]) );

        return this;
    },

    // add a behavior
    addBehavior: function( behavior ){

        var stack = this._behaviorStack
            // gets the index to insert the behavior
            ,idx = Physics.util.sortedIndex( stack, behavior, PRIORITY_PROP_NAME )
            ;

        behavior.setWorld( this );
        stack.splice( idx, 0, behavior );
        return this;
    },

    addBody: function( body ){

        body.setWorld( this );
        this._bodies.push( body );
        return this;
    },

    applyBehaviors: function( dt ){

        var behaviors = this._behaviorStack
            ,l = behaviors.length
            ,bodies = this._bodies
            ;

        // apply behaviors in reverse order... highest priority first
        while ( l-- ){
            
            behaviors[ l ].behave( bodies, dt );
        }
    },

    // internal method
    substep: function( dt ){

        this._integrator.integrate( this._bodies, dt );
        this.applyBehaviors( dt );
    },

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
        
        // limit number of substeps in each step
        if ( diff > this._maxJump ){

            this._time = now - this._maxJump;
            diff = this._maxJump;
        }

        // set some stats
        stats.fps = 1000/diff;
        stats.steps = Math.ceil(diff/this._dt);

        while ( this._time < now ){
            this._time += dt;
            this.substep( dt );
        }

        return this;
    },

    render: function(){

        if ( !this._renderer ){
            throw "No renderer added to world";
        }
        
        this._renderer.render( this._bodies, this._stats );

        return this;
    },

    pause: function(){

        this._paused = true;
        return this;
    },

    unpause: function(){

        this._paused = false;
        return this;
    },

    isPaused: function(){

        return !!this._paused;
    },

    timeStep: function( dt ){

        if ( dt ){

            this._dt = dt;
            // calculate the maximum jump in time over which to do substeps
            this._maxJump = dt * this._opts.maxSteps;

            return this;
        }

        return this._dt;
    },

    // TODO: find bodies
    // select: function( sel ){

    //     if (!sel){

    //         // fast array copy
    //         return this._bodies.splice(0);
    //     }

    //     // TODO
    // }

    getByClassName: function( klass ){

        var bodies = this._bodies
            ,obj
            ,ret = []
            ;

        for ( var i = 0, l = bodies.length; i < l; ++i ){
            
            obj = bodies[ i ];

            if ( obj.hasClass( klass ) ){

                ret.push( obj );
            }
        }

        return ret;
    }
};

Physics.world = World;
    
}());
// circle geometry
Physics.geometry('circle', function( parent ){

    var defaults = {

        radius: 1.0
    };

    return {

        init: function( options ){

            // call parent init method
            parent.init.call(this, options);

            options = Physics.util.extend({}, defaults, options);
            this.radius = options.radius;
            this._aabb = Physics.aabb();
        },
        
        aabb: function(){

            var r = this.radius
                ,aabb = this._aabb
                ;

            if ( aabb.halfWidth() === r ){
                // don't recalculate
                return aabb.get();
            }

            return aabb.set( -r, -r, r, r ).get();
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

            return result.clone( dir ).normalize().mult( this.radius );
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

            // we can use the center of the circle as the core object
            // because we can project a point to the hull in any direction
            // ... yay circles!
            // but since the caller is expecting a certain margin... give it
            // to them
            return result.clone( dir ).normalize().mult( this.radius - margin );
        }
    };
});

// circle geometry
Physics.geometry('convex-polygon', function( parent ){

    var ERROR_NOT_CONVEX = 'Error: The vertices specified do not match that of a _convex_ polygon.';

    var defaults = {

    };

    return {

        init: function( options ){

            // call parent init method
            parent.init.call(this, options);
            options = Physics.util.extend({}, defaults, options);

            this.setVertices( options.vertices || [Physics.vector()] );
        },

        setVertices: function( hull ){

            var scratch = Physics.scratchpad()
                ,transl = scratch.transform()
                ,verts = this.vertices = []
                ;

            if ( !Physics.geometry.isPolygonConvex( hull ) ){
                throw ERROR_NOT_CONVEX;
            }

            transl.setRotation( 0 );
            transl.setTranslation( Physics.geometry.getPolygonCentroid( hull ).negate() )

            // translate each vertex so that the centroid is at the origin
            // then add the vertex as a vector to this.vertices
            for ( var i = 0, l = hull.length; i < l; ++i ){
                
                verts.push( Physics.vector( hull[ i ] ).translate( transl ) );
            }

            this._aabb = false;
            scratch.done();
            return this;
        },
        
        aabb: function(){

            if (this._aabb){
                return this._aabb.get();
            }

            var scratch = Physics.scratchpad()
                ,p = scratch.vector()
                ,xaxis = scratch.vector().clone(Physics.vector.axis[0])
                ,yaxis = scratch.vector().clone(Physics.vector.axis[1])
                ,xmax = this.getFarthestHullPoint( xaxis, p ).get(0)
                ,xmin = this.getFarthestHullPoint( xaxis.negate(), p ).get(0)
                ,ymax = this.getFarthestHullPoint( yaxis, p ).get(1)
                ,ymin = this.getFarthestHullPoint( yaxis.negate(), p ).get(1)
                ;

            this._aabb = new Physics.aabb( xmin, ymin, xmax, ymax );
            scratch.done();
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

            var verts = this.vertices
                ,val
                ,prev
                ,l = verts.length
                ,i = 2
                ;

            result = result || Physics.vector();

            if ( l < 2 ){
                return result.clone( verts[0] );
            }

            prev = verts[ 0 ].dot( dir );
            val = verts[ 1 ].dot( dir );

            if ( l === 2 ){
                return result.clone( (val >= prev) ? verts[ 1 ] : verts[ 0 ] );
            }

            if ( val >= prev ){
                // go up
                // search until the next dot product 
                // is less than the previous
                while ( i < l && val >= prev ){
                    prev = val;
                    val = verts[ i ].dot( dir );
                    i++;
                }

                if (val >= prev){
                    i++;
                }

                // return the previous (furthest with largest dot product)
                return result.clone( verts[ i - 2 ] );

            } else {
                // go down

                i = l;
                while ( i > 2 && prev >= val ){
                    i--;
                    val = prev;
                    prev = verts[ i ].dot( dir );
                }

                // return the previous (furthest with largest dot product)
                return result.clone( verts[ (i + 1) % l ] );                
            }
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

            var norm;
            result = this.getFarthestHullPoint( dir, result );

            // now scale it
            norm = result.norm();
            return result.normalize().mult( norm - margin );
        }
    };
});

// point geometry
Physics.geometry('point', function( parent ){

    // alias of default
});

// circle body
Physics.body('circle', function( parent ){

    var defaults = {
        
    };

    return {
        init: function( options ){

            // call parent init method
            parent.init.call(this, options);

            options = Physics.util.extend({}, defaults, options);

            this.geometry = Physics.geometry('circle', {
                radius: options.radius
            });

            this.recalc();
        },

        recalc: function(){
            parent.recalc.call(this);
            // moment of inertia
            this.moi = this.mass * this.geometry.radius * this.geometry.radius / 2;
        }
    };
});

// circle body
Physics.body('convex-polygon', function( parent ){

    var defaults = {
        
    };

    return {
        init: function( options ){

            // call parent init method
            parent.init.call(this, options);

            options = Physics.util.extend({}, defaults, options);

            this.geometry = Physics.geometry('convex-polygon', {
                vertices: options.vertices
            });

            this.recalc();
        },

        recalc: function(){
            parent.recalc.call(this);
            // moment of inertia
            this.moi = Physics.geometry.getPolygonMOI( this.geometry.vertices );
        }
    };
});

// object bouncing collision response
Physics.behavior('body-impulse-response', function( parent ){
    
    var defaults = {

    };

    var PUBSUB_TOPIC = 'collision-detect';

    return {

        priority: 1,

        init: function( options ){

            this._collisions = [];
        },

        collect: function( data ){
        
            this._collisions.push( data );
        },

        // custom set world in order to subscribe to events
        setWorld: function( world ){

            if (this._world){

                this._world.unsubscribe( PUBSUB_TOPIC, this.collect );
            }

            world.subscribe( PUBSUB_TOPIC, this.collect, this );
            parent.setWorld.call( this, world );
        },

        collideBodies: function(bodyA, bodyB, normal, point, mtrans, contact){

            var fixedA = bodyA.fixed
                ,fixedB = bodyB.fixed
                ;

            // do nothing if both are fixed
            if ( fixedA && fixedB ){
                return;
            }

            // inverse masses and moments of inertia.
            // give fixed bodies infinite mass and moi
            var invMoiA = fixedA ? 0 : 1 / bodyA.moi
                ,invMoiB = fixedB ? 0 : 1 / bodyB.moi
                ,invMassA = fixedA ? 0 : 1 / bodyA.mass
                ,invMassB = fixedB ? 0 : 1 / bodyB.mass
                // coefficient of restitution between bodies
                ,cor = contact ? 0 : bodyA.restitution * bodyB.restitution
                // coefficient of friction between bodies
                ,cof = bodyA.cof * bodyB.cof
                ,scratch = Physics.scratchpad()
                // minimum transit vector for each body
                ,mtv = scratch.vector().clone( mtrans )
                // normal vector
                ,n = scratch.vector().clone( normal )
                // vector perpendicular to n
                ,perp = scratch.vector().clone( n ).perp( true )
                // collision point from A's center
                ,rA = scratch.vector().clone( point ).vsub( bodyA.state.pos )
                // collision point from B's center
                ,rB = scratch.vector().clone( point ).vsub( bodyB.state.pos )
                ,tmp = scratch.vector()
                ,angVelA = bodyA.state.angular.vel
                ,angVelB = bodyB.state.angular.vel
                // relative velocity towards B at collision point
                ,vAB = scratch.vector().clone( bodyB.state.vel )
                        .vadd( tmp.clone(rB).perp( true ).mult( angVelB ) )
                        .vsub( bodyA.state.vel )
                        .vsub( tmp.clone(rA).perp( true ).mult( angVelA ) )
                // break up components along normal and perp-normal directions
                ,rAproj = rA.proj( n )
                ,rAreg = rA.proj( perp )
                ,rBproj = rB.proj( n )
                ,rBreg = rB.proj( perp )
                ,vproj = vAB.proj( n ) // projection of vAB along n
                ,vreg = vAB.proj( perp ) // rejection of vAB along n (perp of proj)
                ,impulse
                ,sign
                ,max
                ,inContact = false
                ;

            // if moving away from each other... don't bother.
            if (vproj >= 0){
                scratch.done();
                return;
            }

            impulse =  - ((1 + cor) * vproj) / ( invMassA + invMassB + (invMoiA * rAreg * rAreg) + (invMoiB * rBreg * rBreg) );
            // vproj += impulse * ( invMass + (invMoi * rreg * rreg) );
            // angVel -= impulse * rreg * invMoi;

            
            if ( fixedA ){

                // extract bodies
                bodyB.state.pos.vadd( mtv );

                // apply impulse
                bodyB.state.vel.vadd( n.mult( impulse * invMassB ) );
                bodyB.state.angular.vel += impulse * invMoiB * rBreg;
                
            } else if ( fixedB ){

                // extract bodies
                bodyA.state.pos.vsub( mtv );

                // apply impulse
                bodyA.state.vel.vsub( n.mult( impulse * invMassA ) );
                bodyA.state.angular.vel -= impulse * invMoiA * rAreg;

            } else {

                // extract bodies
                mtv.mult( 0.5 );
                bodyA.state.pos.vsub( mtv );
                bodyB.state.pos.vadd( mtv );

                // apply impulse
                bodyB.state.vel.vadd( n.mult( impulse * invMassB ) );
                bodyB.state.angular.vel += impulse * invMoiB * rBreg;
                bodyA.state.vel.vsub( n.mult( invMassA * bodyB.mass ) );
                bodyA.state.angular.vel -= impulse * invMoiA * rAreg;
            }

            // inContact = (impulse < 0.004);
            
            // if we have friction and a relative velocity perpendicular to the normal
            if ( cof && vreg ){


                // TODO: here, we could first assume static friction applies
                // and that the tangential relative velocity is zero.
                // Then we could calculate the impulse and check if the
                // tangential impulse is less than that allowed by static
                // friction. If not, _then_ apply kinetic friction.

                // instead we're just applying kinetic friction and making
                // sure the impulse we apply is less than the maximum
                // allowed amount

                // maximum impulse allowed by kinetic friction
                max = vreg / ( invMassA + invMassB + (invMoiA * rAproj * rAproj) + (invMoiB * rBproj * rBproj) );

                if (!inContact){
                    // the sign of vreg ( plus or minus 1 )
                    sign = vreg < 0 ? -1 : 1;

                    // get impulse due to friction
                    impulse *= sign * cof;
                    // make sure the impulse isn't giving the system energy
                    impulse = (sign === 1) ? Math.min( impulse, max ) : Math.max( impulse, max );
                    
                } else {

                    impulse = max;
                }

                if ( fixedA ){

                    // apply frictional impulse
                    bodyB.state.vel.vsub( perp.mult( impulse * invMassB ) );
                    bodyB.state.angular.vel -= impulse * invMoiB * rBproj;
                    
                } else if ( fixedB ){

                    // apply frictional impulse
                    bodyA.state.vel.vadd( perp.mult( impulse * invMassA ) );
                    bodyA.state.angular.vel += impulse * invMoiA * rAproj;

                } else {

                    // apply frictional impulse
                    bodyB.state.vel.vsub( perp.mult( impulse * invMassB ) );
                    bodyB.state.angular.vel -= impulse * invMoiB * rBproj;
                    bodyA.state.vel.vadd( perp.mult( invMassA * bodyB.mass ) );
                    bodyA.state.angular.vel += impulse * invMoiA * rAproj;
                }  
            }

            scratch.done();
        },

        behave: function(){

            var self = this
                ,col
                ,collisions = self._collisions
                ;

            self._collisions = [];

            for ( var i = 0, l = collisions.length; i < l; ++i ){
                
                col = collisions[ i ];
                self.collideBodies( col.bodyA, col.bodyB, col.norm, col.pos, col.mtv );
            }

            // self._world.publish({
            //     topic: 'collision-detect:request-sweep',
            //     callback: function( collisions ){

            //         for ( var i = 0, l = collisions.length; i < l; ++i ){
                        
            //             col = collisions[ i ];
            //             self.collideBodies( col.bodyA, col.bodyB, col.norm, col.pos, col.mtv, true );
            //         }
            //     }
            // });
        }
    };
});

// edge-bounce behavior
Physics.behavior('edge-bounce', function( parent ){

    var defaults = {

        bounds: null,
        restitution: 1.0
    };

    var PUBSUB_TOPIC = 'edge-bounce';

    var perp = Physics.vector(); //tmp
    var applyImpulse = function applyImpulse(state, n, r, moi, mass, cor, cof){

        perp.clone( n ).perp( true );

        // break up components along normal and perp-normal directions
        var v = state.vel
            ,angVel = state.angular.vel
            ,vproj = v.proj( n ) // projection of v along n
            ,vreg = v.proj( perp ) // rejection of v along n (perp of proj)
            ,rproj = r.proj( n )
            ,rreg = r.proj( perp )
            ,impulse
            ,sign
            ,max
            ,inContact = false
            ,invMass = 1 / mass
            ,invMoi = 1 / moi
            ;

        // account for rotation ... += (r omega) in the tangential direction
        vproj += angVel * rreg;
        vreg += angVel * rproj;

        impulse =  - ((1 + cor) * vproj) / ( invMass + (invMoi * rreg * rreg) );
        vproj += impulse * ( invMass + (invMoi * rreg * rreg) );
        angVel -= impulse * rreg * invMoi;
        // inContact = (impulse < 0.004);
        
        // if we have friction and a relative velocity perpendicular to the normal
        if ( cof && vreg ){

            // maximum impulse allowed by friction
            max = vreg / ( invMass + (invMoi * rproj * rproj) );

            if (!inContact){
                // the sign of vreg ( plus or minus 1 )
                sign = vreg < 0 ? -1 : 1;

                // get impulse due to friction
                impulse *= sign * cof;
                // make sure the impulse isn't giving the system energy
                impulse = (sign === 1) ? Math.min( impulse, max ) : Math.max( impulse, max );
                
            } else {

                impulse = max;
            }

            angVel -= impulse * rproj * invMoi;
            vreg -= impulse * ( invMass + (invMoi * rproj * rproj) );
        }

        // adjust velocities
        state.angular.vel = angVel;
        v.clone( n ).mult( vproj - angVel * rreg ).vadd( perp.mult( vreg - angVel * rproj ) );
    };

    return {

        priority: 2,

        init: function( options ){

            // call parent init method
            parent.init.call(this, options);

            options = Physics.util.extend({}, defaults, options);

            this.setAABB( options.aabb );
            this.restitution = options.restitution;
        },

        setAABB: function( aabb ){

            if (!aabb) {
                throw 'Error: aabb not set';
            }

            this.aabb = aabb;
            this._edges = [
                // set edges
            ];
        },
        
        behave: function( bodies, dt ){

            var body
                ,pos
                ,state
                ,scratch = Physics.scratchpad()
                ,p = scratch.vector()
                ,aabb = this.aabb.get()
                ,minx = aabb.pos.x - aabb.halfWidth
                ,maxx = aabb.pos.x + aabb.halfWidth
                ,miny = aabb.pos.y - aabb.halfHeight
                ,maxy = aabb.pos.y + aabb.halfHeight
                ,world = this._world
                ,dim
                ,x
                ,cor
                ,cof = 0.6
                ,norm = scratch.vector()
                ,impulse
                ;

            for ( var i = 0, l = bodies.length; i < l; ++i ){
                
                body = bodies[ i ];
                state = body.state;
                pos = body.state.pos;
                cor = body.restitution * this.restitution;

                switch ( body.geometry.name ){

                    case 'circle':
                        dim = body.geometry.radius;
                        x = body.moi / body.mass;

                        // right
                        if ( (pos._[ 0 ] + dim) >= maxx ){

                            norm.set(-1, 0);
                            p.set(dim, 0); // set perpendicular displacement from com to impact point
                            
                            // adjust position
                            pos._[ 0 ] = maxx - dim;

                            applyImpulse(state, norm, p, body.moi, body.mass, cor, cof);

                            p.set( maxx, pos._[ 1 ] );
                            if (world){
                                world.publish({ topic: PUBSUB_TOPIC, body: body, point: p.values() });
                            }
                        }
                        
                        // left
                        if ( (pos._[ 0 ] - dim) <= minx ){

                            norm.set(1, 0);
                            p.set(-dim, 0); // set perpendicular displacement from com to impact point
                            
                            // adjust position
                            pos._[ 0 ] = minx + dim;

                            applyImpulse(state, norm, p, body.moi, body.mass, cor, cof);

                            p.set( minx, pos._[ 1 ] );
                            if (world){
                                world.publish({ topic: PUBSUB_TOPIC, body: body, point: p.values() });
                            }
                        }

                        // bottom
                        if ( (pos._[ 1 ] + dim) >= maxy ){

                            norm.set(0, -1);
                            p.set(0, dim); // set perpendicular displacement from com to impact point
                            
                            // adjust position
                            pos._[ 1 ] = maxy - dim;

                            applyImpulse(state, norm, p, body.moi, body.mass, cor, cof);

                            p.set( pos._[ 0 ], maxy );
                            if (world){
                                world.publish({ topic: PUBSUB_TOPIC, body: body, point: p.values() });
                            }
                        }
                            
                        // top
                        if ( (pos._[ 1 ] - dim) <= miny ){

                            norm.set(0, 1);
                            p.set(0, -dim); // set perpendicular displacement from com to impact point
                            
                            // adjust position
                            pos._[ 1 ] = miny + dim;

                            applyImpulse(state, norm, p, body.moi, body.mass, cor, cof);

                            p.set( pos._[ 0 ], miny );
                            if (world){
                                world.publish({ topic: PUBSUB_TOPIC, body: body, point: p.values() });
                            }
                        }

                    break;
                }
            }

            scratch.done();
        }
    };
});

// newtonian gravity
Physics.behavior('newtonian', function( parent ){

    var defaults = {

        strength: 1
    };

    return {

        init: function( options ){

            // call parent init method
            parent.init.call(this, options);

            options = Physics.util.extend({}, defaults, options);

            this.strength = options.strength;
            this.tolerance = options.tolerance || 100 * this.strength;
        },
        
        behave: function( bodies, dt ){

            var body
                ,other
                ,strength = this.strength
                ,tolerance = this.tolerance
                ,scratch = Physics.scratchpad()
                ,pos = scratch.vector()
                ,normsq
                ,g
                ;

            for ( var j = 0, l = bodies.length; j < l; j++ ){
                
                body = bodies[ j ];

                for ( var i = j + 1; i < l; i++ ){
                    
                    other = bodies[ i ];
                    // clone the position
                    pos.clone( other.state.pos );
                    pos.vsub( body.state.pos );
                    // get the square distance
                    normsq = pos.normSq();

                    if (normsq > tolerance){

                        g = strength / normsq;

                        body.accelerate( pos.normalize().mult( g * other.mass ) );
                        other.accelerate( pos.mult( body.mass/other.mass ).negate() );
                    }
                }
            }

            scratch.done();
        }
    };
});

Physics.integrator('improved-euler', function( parent ){

    return {

        init: function( options ){

            // call parent init
            parent.init.call(this, options);
        },

        integrate: function( bodies, dt ){

            // half the timestep
            var halfdt = 0.5 * dt
                ,drag = 1 - this.options.drag
                ,body = null
                ,state
                // use cached vector instances
                // so we don't need to recreate them in a loop
                ,scratch = Physics.scratchpad()
                ,vel = scratch.vector()
                ,angVel
                ;

            for ( var i = 0, l = bodies.length; i < l; ++i ){

                body = bodies[ i ];

                // only integrate if the body isn't fixed
                if ( !body.fixed ){

                    state = body.state;

                    // Inspired from https://github.com/soulwire/Coffee-Physics
                    // @licence MIT
                    // 
                    // x += (v * dt) + (a * 0.5 * dt * dt)
                    // v += a * dt

                    // Store previous location.
                    state.old.pos.clone( state.pos );

                    // Scale force to mass.
                    // state.acc.mult( body.massInv );

                    // Duplicate velocity to preserve momentum.
                    vel.clone( state.vel );

                    // Update velocity first so we can reuse the acc vector.
                    // a *= dt
                    // v += a ...
                    state.vel.vadd( state.acc.mult( dt ) );

                    // Update position.
                    // ...
                    // oldV *= dt
                    // a *= 0.5 * dt
                    // x += oldV + a
                    state.pos.vadd( vel.mult( dt ) ).vadd( state.acc.mult( halfdt ) );

                    // Apply "air resistance".
                    if ( drag ){

                        state.vel.mult( drag );
                    }

                    // Reset accel
                    state.acc.zero();

                    //
                    // Angular components
                    // 

                    state.old.angular.pos = state.angular.pos;
                    angVel = state.old.angular.vel = state.angular.vel;
                    state.angular.acc *= dt;
                    angVel += state.angular.acc;
                    state.angular.pos += angVel * dt + state.angular.acc * halfdt;
                    state.angular.acc = 0;

                }                    
            }

            scratch.done();
        }
    };
});


Physics.integrator('verlet', function( parent ){

    return {

        init: function( options ){

            // call parent init
            parent.init.call(this, options);
        },

        integrate: function( bodies, dt ){

            // half the timestep
            var dtdt = dt * dt
                ,drag = 1 - this.options.drag
                ,body = null
                ,state
                // use cached vector instances
                // so we don't need to recreate them in a loop
                ,scratch = Physics.scratchpad()
                ,vel = scratch.vector()
                ;

            for ( var i = 0, l = bodies.length; i < l; ++i ){

                body = bodies[ i ];

                // only integrate if the body isn't fixed
                if ( !body.fixed ){

                    state = body.state;

                    // Inspired from https://github.com/soulwire/Coffee-Physics
                    // @licence MIT
                    // 
                    // v = x - ox
                    // x = x + (v + a * dt * dt)

                    // Get velocity by subtracting old position from curr position
                    state.old.vel.clone( state.pos ).vsub( state.old.pos ).mult( 1/dt );

                    // only use this velocity if the velocity hasn't been changed manually
                    if (state.old.vel.equals( state.vel )){
                        
                        state.vel.clone( state.old.vel );
                    }

                    // so we need to scale the value by dt so it 
                    // complies with other integration methods
                    state.vel.mult( dt );

                    // Apply "air resistance".
                    if ( drag ){

                        state.vel.mult( drag );
                    }

                    // Store old position.
                    // xold = x
                    state.old.pos.clone( state.pos );

                    // Apply acceleration
                    // x = x + (v + a * dt * dt)
                    state.pos.vadd( state.vel.vadd( state.acc.mult( dtdt ) ) );

                    // normalize velocity 
                    state.vel.mult( 1/dt );

                    // Reset accel
                    state.acc.zero();

                    // store old velocity
                    state.old.vel.clone( state.vel );


                    //
                    // Angular components
                    // 

                    state.old.angular.vel = (state.angular.pos - state.old.angular.pos) / dt;

                    if (state.old.angular.vel === state.angular.vel){

                        state.angular.vel = state.old.angular.vel;
                    }

                    state.angular.vel *= dt;

                    state.old.angular.pos = state.angular.pos;

                    state.angular.vel += state.angular.acc * dtdt;
                    state.angular.pos += state.angular.vel;
                    state.angular.vel /= dt;
                    state.angular.acc = 0;
                    state.old.angular.vel = state.angular.vel;

                }
            }

            scratch.done();
        }
    };
});


Physics.renderer('canvas', function( proto ){

    var Pi2 = Math.PI * 2
        ,newEl = function( node, content ){
            var el = document.createElement(node || 'div');
            if (content){
                el.innerHTML = content;
            }
            return el;
        }
        ;

    var defaults = {

        bodyColor: '#fff',
        orientationLineColor: '#cc0000',
        offset: Physics.vector()
    };

    return {

        init: function( options ){

            // call proto init
            proto.init.call(this, options);

            // further options
            this.options = Physics.util.extend({}, defaults, this.options);

            // hidden canvas
            this.hiddenCanvas = document.createElement('canvas');
            this.hiddenCanvas.width = this.hiddenCanvas.height = 100;
            
            if (!this.hiddenCanvas.getContext){
                throw "Canvas not supported";
            }

            this.hiddenCtx = this.hiddenCanvas.getContext('2d');

            // actual viewport
            var viewport = this.el;
            if (viewport.nodeName.toUpperCase() !== "CANVAS"){

                viewport = document.createElement('canvas');
                this.el.appendChild( viewport );
                this.el = viewport;
            }

            viewport.width = this.options.width;
            viewport.height = this.options.height;

            this.ctx = viewport.getContext("2d");

            this.els = {};

            var stats = newEl();
            stats.className = 'pjs-meta';
            this.els.fps = newEl('span');
            this.els.steps = newEl('span');
            stats.appendChild(newEl('span', 'fps: '));
            stats.appendChild(this.els.fps);
            stats.appendChild(newEl('br'));
            stats.appendChild(newEl('span', 'steps: '));
            stats.appendChild(this.els.steps);

            viewport.parentNode.insertBefore(stats, viewport);
        },

        drawCircle: function(x, y, r, color, ctx){

            ctx = ctx || this.ctx;

            ctx.beginPath();
            ctx.fillStyle = ctx.strokeStyle = color || this.options.bodyColor;
            ctx.arc(x, y, r, 0, Pi2, false);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        },

        drawPolygon: function(verts, color, ctx){

            var vert = verts[0]
                ,x = vert.x === undefined ? vert.get(0) : vert.x
                ,y = vert.y === undefined ? vert.get(1) : vert.y
                ,l = verts.length
                ;

            ctx = ctx || this.ctx;
            ctx.beginPath();
            ctx.fillStyle = ctx.strokeStyle = color || this.options.bodyColor;

            ctx.moveTo(x, y);

            for ( var i = 1; i < l; ++i ){
                
                vert = verts[ i ];
                x = vert.x === undefined ? vert.get(0) : vert.x;
                y = vert.y === undefined ? vert.get(1) : vert.y;
                ctx.lineTo(x, y);
            }

            if (l > 2){
                ctx.closePath();
            }

            ctx.stroke();
            ctx.fill();
        },

        createView: function( geometry ){

            var view = new Image()
                ,aabb = geometry.aabb()
                ,hw = aabb.halfWidth + Math.abs(aabb.pos.x)
                ,hh = aabb.halfHeight + Math.abs(aabb.pos.y)
                ,x = hw + 1
                ,y = hh + 1
                ,hiddenCtx = this.hiddenCtx
                ,hiddenCanvas = this.hiddenCanvas
                ;
            
            // clear
            hiddenCanvas.width = 2 * hw + 2;
            hiddenCanvas.height = 2 * hh + 2;

            hiddenCtx.save();
            hiddenCtx.translate(x, y);

            if (geometry.name === 'circle'){

                this.drawCircle(0, 0, geometry.radius, false, hiddenCtx);

            } else if (geometry.name === 'convex-polygon'){

                this.drawPolygon(geometry.vertices, false, hiddenCtx);
            }

            if (this.options.orientationLineColor){

                hiddenCtx.beginPath();
                hiddenCtx.strokeStyle = this.options.orientationLineColor;
                hiddenCtx.moveTo(0, 0);
                hiddenCtx.lineTo(hw, 0);
                hiddenCtx.closePath();
                hiddenCtx.stroke();
            }

            hiddenCtx.restore();

            view.src = hiddenCanvas.toDataURL("image/png");
            return view;
        },

        drawMeta: function( stats ){

            this.els.fps.innerHTML = stats.fps.toFixed(2);
            this.els.steps.innerHTML = stats.steps;
        },

        beforeRender: function(){

            // clear canvas
            this.el.width = this.el.width;
        },

        drawBody: function( body, view ){

            var ctx = this.ctx
                ,pos = body.state.pos
                ,offset = this.options.offset
                ;

            ctx.save();
            ctx.translate(pos.get(0) + offset.get(0), pos.get(1) + offset.get(1));
            ctx.rotate(body.state.angular.pos);
            ctx.drawImage(view, -view.width/2, -view.height/2);
            ctx.restore();
        }
    };
});
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
            this.els.steps = newEl('span');
            stats.appendChild(newEl('span', 'fps: '));
            stats.appendChild(this.els.fps);
            stats.appendChild(newEl('br'));
            stats.appendChild(newEl('span', 'steps: '));
            stats.appendChild(this.els.steps);

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
            this.els.steps.innerHTML = stats.steps;
        },

        drawBody: drawBody
    };
});
    return Physics;
}));