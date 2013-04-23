/**
 * physicsjs v0.0.1a - 2013-04-23
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

  /** Detect free variable `exports` */
  var freeExports = typeof exports == 'object' && exports;

  /** Detect free variable `module` */
  var freeModule = typeof module == 'object' && module && module.exports == freeExports && module;

  /** Detect free variable `global` and use it as `window` */
  var freeGlobal = typeof global == 'object' && global;
  if (freeGlobal.global === freeGlobal) {
    window = freeGlobal;
  }

  /** Used for array and object method references */
  var arrayRef = [],
      objectRef = {};

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used internally to indicate various things */
  var indicatorObject = objectRef;

  /** Used by `cachedContains` as the default size when optimizations are enabled for large arrays */
  var largeArraySize = 30;

  /** Used to restore the original `_` reference in `noConflict` */
  var oldDash = window._;

  /** Used to match HTML entities */
  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g;

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to detect if a method is native */
  var reNative = RegExp('^' +
    (objectRef.valueOf + '')
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/valueOf|for [^\]]+/g, '.+?') + '$'
  );

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-7.8.6
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to match HTML characters */
  var reUnescapedHtml = /[&<>"']/g;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to fix the JScript [[DontEnum]] bug */
  var shadowed = [
    'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
    'toLocaleString', 'toString', 'valueOf'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** Native method shortcuts */
  var ceil = Math.ceil,
      concat = arrayRef.concat,
      floor = Math.floor,
      hasOwnProperty = objectRef.hasOwnProperty,
      push = arrayRef.push,
      toString = objectRef.toString;

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeBind = reNative.test(nativeBind = slice.bind) && nativeBind,
      nativeIsArray = reNative.test(nativeIsArray = Array.isArray) && nativeIsArray,
      nativeIsFinite = window.isFinite,
      nativeIsNaN = window.isNaN,
      nativeKeys = reNative.test(nativeKeys = Object.keys) && nativeKeys,
      nativeMax = Math.max,
      nativeMin = Math.min,
      nativeRandom = Math.random;

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

  /** Detect various environments */
  var isIeOpera = !!window.attachEvent,
      isV8 = nativeBind && !/\n|true/.test(nativeBind + isIeOpera);

  /* Detect if `Function#bind` exists and is inferred to be fast (all but V8) */
  var isBindFast = nativeBind && !isV8;

  /* Detect if `Object.keys` exists and is inferred to be fast (IE, Opera, V8) */
  var isKeysFast = nativeKeys && (isIeOpera || isV8);

  /**
   * Detect the JScript [[DontEnum]] bug:
   *
   * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
   * made non-enumerable as well.
   */
  var hasDontEnumBug;

  /**
   * Detect if a `prototype` properties are enumerable by default:
   *
   * Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
   * (if the prototype or a property on the prototype has been set)
   * incorrectly sets a function's `prototype` property [[Enumerable]]
   * value to `true`.
   */
  var hasEnumPrototype;

  /** Detect if `arguments` object indexes are non-enumerable (Firefox < 4, IE < 9, PhantomJS, Safari < 5.1) */
  var nonEnumArgs = true;

  (function() {
    var props = [];
    function ctor() { this.x = 1; }
    ctor.prototype = { 'valueOf': 1, 'y': 1 };
    for (var prop in new ctor) { props.push(prop); }
    for (prop in arguments) { nonEnumArgs = !prop; }

    hasDontEnumBug = !/valueOf/.test(props);
    hasEnumPrototype = ctor.propertyIsEnumerable('prototype');

  }(1));

  /** Detect if `arguments` objects are `Object` objects (all but Opera < 10.5) */
  var argsAreObjects = arguments.constructor == Object;

  /** Detect if `arguments` objects [[Class]] is unresolvable (Firefox < 4, IE < 9) */
  var noArgsClass = !isArguments(arguments);

  /**
   * Detect lack of support for accessing string characters by index:
   *
   * IE < 8 can't access characters by index and IE 8 can only access
   * characters by index on string literals.
   */
  var noCharByIndex = ('x'[0] + Object('x')[0]) != 'xx';

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

  /**
   * Creates a `lodash` object, that wraps the given `value`, to enable method
   * chaining.
   *
   * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
   * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
   * and `unshift`
   *
   * The chainable wrapper functions are:
   * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`, `compose`,
   * `concat`, `countBy`, `debounce`, `defaults`, `defer`, `delay`, `difference`,
   * `filter`, `flatten`, `forEach`, `forIn`, `forOwn`, `functions`, `groupBy`,
   * `initial`, `intersection`, `invert`, `invoke`, `keys`, `map`, `max`, `memoize`,
   * `merge`, `min`, `object`, `omit`, `once`, `pairs`, `partial`, `partialRight`,
   * `pick`, `pluck`, `push`, `range`, `reject`, `rest`, `reverse`, `shuffle`,
   * `slice`, `sort`, `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`,
   * `union`, `uniq`, `unshift`, `values`, `where`, `without`, `wrap`, and `zip`
   *
   * The non-chainable wrapper functions are:
   * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `has`, `identity`,
   * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`, `isEmpty`,
   * `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`, `isObject`,
   * `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`, `lastIndexOf`,
   * `mixin`, `noConflict`, `pop`, `random`, `reduce`, `reduceRight`, `result`,
   * `shift`, `size`, `some`, `sortedIndex`, `template`, `unescape`, and `uniqueId`
   *
   * The wrapper functions `first` and `last` return wrapped values when `n` is
   * passed, otherwise they return unwrapped values.
   *
   * @name _
   * @constructor
   * @category Chaining
   * @param {Mixed} value The value to wrap in a `lodash` instance.
   * @returns {Object} Returns a `lodash` instance.
   */
  function lodash() {
    // no operation performed
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The template used to create iterator functions.
   *
   * @private
   * @param {Obect} data The data object used to populate the text.
   * @returns {String} Returns the interpolated text.
   */
  var iteratorTemplate = function(obj) {
    
    var __p = 'var index, iterable = ' +
    (obj.firstArg ) +
    ', result = iterable;\nif (!iterable) return result;\n' +
    (obj.top ) +
    ';\n';
     if (obj.arrays) {
    __p += 'var length = iterable.length; index = -1;\nif (' +
    (obj.arrays ) +
    ') {  ';
     if (obj.noCharByIndex) {
    __p += '\n  if (isString(iterable)) {\n    iterable = iterable.split(\'\')\n  }  ';
     } ;
    __p += '\n  while (++index < length) {\n    ' +
    (obj.loop ) +
    '\n  }\n}\nelse {  ';
      } else if (obj.nonEnumArgs) {
    __p += '\n  var length = iterable.length; index = -1;\n  if (length && isArguments(iterable)) {\n    while (++index < length) {\n      index += \'\';\n      ' +
    (obj.loop ) +
    '\n    }\n  } else {  ';
     } ;
    
     if (obj.hasEnumPrototype) {
    __p += '\n  var skipProto = typeof iterable == \'function\';\n  ';
     } ;
    
     if (obj.isKeysFast && obj.useHas) {
    __p += '\n  var ownIndex = -1,\n      ownProps = objectTypes[typeof iterable] ? nativeKeys(iterable) : [],\n      length = ownProps.length;\n\n  while (++ownIndex < length) {\n    index = ownProps[ownIndex];\n    ';
     if (obj.hasEnumPrototype) {
    __p += 'if (!(skipProto && index == \'prototype\')) {\n  ';
     } ;
    __p += 
    (obj.loop ) +
    '';
     if (obj.hasEnumPrototype) {
    __p += '}\n';
     } ;
    __p += '  }  ';
     } else {
    __p += '\n  for (index in iterable) {';
        if (obj.hasEnumPrototype || obj.useHas) {
    __p += '\n    if (';
          if (obj.hasEnumPrototype) {
    __p += '!(skipProto && index == \'prototype\')';
     }      if (obj.hasEnumPrototype && obj.useHas) {
    __p += ' && ';
     }      if (obj.useHas) {
    __p += 'hasOwnProperty.call(iterable, index)';
     }    ;
    __p += ') {    ';
     } ;
    __p += 
    (obj.loop ) +
    ';    ';
     if (obj.hasEnumPrototype || obj.useHas) {
    __p += '\n    }';
     } ;
    __p += '\n  }  ';
     } ;
    
     if (obj.hasDontEnumBug) {
    __p += '\n\n  var ctor = iterable.constructor;\n    ';
     for (var k = 0; k < 7; k++) {
    __p += '\n  index = \'' +
    (obj.shadowed[k] ) +
    '\';\n  if (';
          if (obj.shadowed[k] == 'constructor') {
    __p += '!(ctor && ctor.prototype === iterable) && ';
          } ;
    __p += 'hasOwnProperty.call(iterable, index)) {\n    ' +
    (obj.loop ) +
    '\n  }    ';
     } ;
    
     } ;
    
     if (obj.arrays || obj.nonEnumArgs) {
    __p += '\n}';
     } ;
    __p += 
    (obj.bottom ) +
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
    'top': "callback = callback && typeof thisArg == 'undefined' ? callback : createCallback(callback, thisArg)",
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
   * @param {Number} [fromIndex=0] The index to search from.
   * @param {Number} [largeSize=30] The length at which an array is considered large.
   * @returns {Boolean} Returns `true`, if `value` is found, else `false`.
   */
  function cachedContains(array, fromIndex, largeSize) {
    fromIndex || (fromIndex = 0);

    var length = array.length,
        isLarge = (length - fromIndex) >= (largeSize || largeArraySize);

    if (isLarge) {
      var cache = {},
          index = fromIndex - 1;

      while (++index < length) {
        // manually coerce `value` to a string because `hasOwnProperty`, in some
        // older versions of Firefox, coerces objects incorrectly
        var key = array[index] + '';
        (hasOwnProperty.call(cache, key) ? cache[key] : (cache[key] = [])).push(array[index]);
      }
    }
    return function(value) {
      if (isLarge) {
        var key = value + '';
        return hasOwnProperty.call(cache, key) && indexOf(cache[key], value) > -1;
      }
      return indexOf(array, value, fromIndex) > -1;
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
   * @param {Object} [rightIndicator] Used to indicate partially applying arguments from the right.
   * @returns {Function} Returns the new bound function.
   */
  function createBound(func, thisArg, partialArgs, rightIndicator) {
    var isFunc = isFunction(func),
        isPartial = !partialArgs,
        key = thisArg;

    // juggle arguments
    if (isPartial) {
      partialArgs = thisArg;
    }
    if (!isFunc) {
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
          ? (args = slice(args), rightIndicator ? args.concat(partialArgs) : partialArgs.concat(args))
          : partialArgs;
      }
      if (this instanceof bound) {
        // ensure `new bound` is an instance of `bound` and `func`
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
   * Produces a callback bound to an optional `thisArg`. If `func` is a property
   * name, the created callback will return the property value for a given element.
   * If `func` is an object, the created callback will return `true` for elements
   * that contain the equivalent object properties, otherwise it will return `false`.
   *
   * @private
   * @param {Mixed} [func=identity] The value to convert to a callback.
   * @param {Mixed} [thisArg] The `this` binding of the created callback.
   * @param {Number} [argCount=3] The number of arguments the callback accepts.
   * @returns {Function} Returns a callback function.
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
        return function(accumulator, value, index, object) {
          return func.call(thisArg, accumulator, value, index, object);
        };
      }
      return function(value, index, object) {
        return func.call(thisArg, value, index, object);
      };
    }
    return func;
  }

  /**
   * Creates compiled iteration functions.
   *
   * @private
   * @param {Object} [options1, options2, ...] The compile options object(s).
   *  arrays - A string of code to determine if the iterable is an array or array-like.
   *  useHas - A boolean to specify using `hasOwnProperty` checks in the object loop.
   *  args - A string of comma separated arguments the iteration function will accept.
   *  top - A string of code to execute before the iteration branches.
   *  loop - A string of code to execute in the object loop.
   *  bottom - A string of code to execute after the iteration branches.
   *
   * @returns {Function} Returns the compiled function.
   */
  function createIterator() {
    var data = {
      // support properties
      'hasDontEnumBug': hasDontEnumBug,
      'hasEnumPrototype': hasEnumPrototype,
      'isKeysFast': isKeysFast,
      'nonEnumArgs': nonEnumArgs,
      'noCharByIndex': noCharByIndex,
      'shadowed': shadowed,

      // iterator options
      'arrays': 'isArray(iterable)',
      'bottom': '',
      'loop': '',
      'top': '',
      'useHas': true
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
        'createCallback, hasOwnProperty, isArguments, isArray, isString, ' +
        'objectTypes, nativeKeys',
      'return function(' + args + ') {\n' + iteratorTemplate(data) + '\n}'
    );
    // return the compiled function
    return factory(
      createCallback, hasOwnProperty, isArguments, isArray, isString,
      objectTypes, nativeKeys
    );
  }

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
  var each = createIterator(eachIteratorOptions);

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
  if (noArgsClass) {
    isArguments = function(value) {
      return value ? hasOwnProperty.call(value, 'callee') : false;
    };
  }

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
  var isArray = nativeIsArray || function(value) {
    // `instanceof` may cause a memory leak in IE 7 if `value` is a host object
    // http://ajaxian.com/archives/working-aroung-the-instanceof-memory-leak
    return (argsAreObjects && value instanceof Array) || toString.call(value) == arrayClass;
  };

  /**
   * A fallback implementation of `isPlainObject` that checks if a given `value`
   * is an object created by the `Object` constructor, assuming objects created
   * by the `Object` constructor have no inherited enumerable properties and that
   * there are no `Object.prototype` extensions.
   *
   * @private
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true`, if `value` is a plain object, else `false`.
   */
  function shimIsPlainObject(value) {
    // avoid non-objects and false positives for `arguments` objects
    var result = false;
    if (!(value && typeof value == 'object') || isArguments(value)) {
      return result;
    }
    // check that the constructor is `Object` (i.e. `Object instanceof Object`)
    var ctor = value.constructor;
    if ((!isFunction(ctor)) || ctor instanceof ctor) {
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      forIn(value, function(value, key) {
        result = key;
      });
      return result === false || hasOwnProperty.call(value, result);
    }
    return result;
  }

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
   * object. Subsequent sources will overwrite propery assignments of previous
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
        '  var callback = createCallback(args[--argsLength - 1], args[argsLength--], 2);\n' +
        "} else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {\n" +
        '  callback = args[--argsLength];\n' +
        '}'
      ),
    'loop': 'result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]'
  });

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
      each(collection, callback, thisArg);
    }
    return collection;
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
    return isBindFast || (nativeBind && arguments.length > 2)
      ? nativeBind.call.apply(nativeBind, arguments)
      : createBound(func, thisArg, slice(arguments, 2));
  }
  // use `setImmediate` if it's available in Node.js
  if (isV8 && freeModule && typeof setImmediate == 'function') {
    defer = bind(setImmediate, window);
  }

  /**
   * Creates a function that, when executed, will only call the `func`
   * function at most once per every `wait` milliseconds. If the throttled
   * function is invoked more than once during the `wait` timeout, `func` will
   * also be called on the trailing edge of the timeout. Subsequent calls to the
   * throttled function will return the result of the last `func` call.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to throttle.
   * @param {Number} wait The number of milliseconds to throttle executions to.
   * @returns {Function} Returns the new throttled function.
   * @example
   *
   * var throttled = _.throttle(updatePosition, 100);
   * jQuery(window).on('scroll', throttled);
   */
  function throttle(func, wait) {
    var args,
        result,
        thisArg,
        timeoutId,
        lastCalled = 0;

    function trailingCall() {
      lastCalled = new Date;
      timeoutId = null;
      result = func.apply(thisArg, args);
    }
    return function() {
      var now = new Date,
          remaining = wait - (now - lastCalled);

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

  /**
   * Produces the `toString` result of the wrapped value.
   *
   * @name toString
   * @memberOf _
   * @category Chaining
   * @returns {String} Returns the string result.
   * @example
   *
   * _([1, 2, 3]).toString();
   * // => '1,2,3'
   */
  function wrapperToString() {
    return this.__wrapped__ + '';
  }

  /**
   * Extracts the wrapped value.
   *
   * @name valueOf
   * @memberOf _
   * @alias value
   * @category Chaining
   * @returns {Mixed} Returns the wrapped value.
   * @example
   *
   * _([1, 2, 3]).valueOf();
   * // => [1, 2, 3]
   */
  function wrapperValueOf() {
    return this.__wrapped__;
  }

  /*--------------------------------------------------------------------------*/
  lodash.assign = assign;
  lodash.bind = bind;
  lodash.forEach = forEach;
  lodash.forOwn = forOwn;
  lodash.throttle = throttle;
  lodash.each = forEach;
  lodash.extend = assign;
  /*--------------------------------------------------------------------------*/
  lodash.identity = identity;
  lodash.isArguments = isArguments;
  lodash.isArray = isArray;
  lodash.isFunction = isFunction;
  lodash.isObject = isObject;
  lodash.isString = isString;

  /*--------------------------------------------------------------------------*/

  /**
   * The semantic version number.
   *
   * @static
   * @memberOf _
   * @type String
   */
  lodash.VERSION = '1.0.1';

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

    var Bounds = function Bounds( minX, minY, maxX, maxY ){

        // enforce instantiation
        if ( !(this instanceof Bounds) ){

            return new Bounds( minX, minY, maxX, maxY );
        }

        this.min = Physics.vector();
        this.max = Physics.vector();

        this.set( minX, minY, maxX, maxY );
    };

    Bounds.prototype.set = function( minX, minY, maxX, maxY ){

        this.min.set( minX, minY );
        this.max.set( maxX, maxY );
    };

    Bounds.prototype.get = function(){

        return {
            min: this._min.values(),
            max: this._max.values()
        };
    };    

    Physics.bounds = Bounds;
}());
// Gilbert–Johnson–Keerthi object collison algorithm
// For general information about GJK see: 
// * http://www.codezealot.org/archives/88
// * http://mollyrocket.com/849
(function(){

/**
 * Implementation agnostic GJK function.
 * @param  {Function} support The support function. 
 *                            Signature: function(<Physics.vector> axis).
 *                            axis: The axis to use
 * @param {Physics.vector} seed The starting direction for the simplex
 * @return {Object} The algorithm information containing properties: .overlap (bool), and .simplex (Array)
 */
var gjk = function gjk( support, seed ){

    var overlap = false
        ,simplex = []
        ,simplexLen = 1
        // setup a scratchpad of temporary cheap objects
        ,scratch = Physics.scratchpad()
        // use seed as starting direction or use x axis
        ,dir = scratch.vector().clone(seed || Physics.vector.axis[ 0 ])
        ,last
        ,lastlast
        ,ab
        ,ac
        ,sign
        ,tmp
        ;

    // get the first Minkowski Difference point
    last = support( dir );
    simplexLen = simplex.push( last );
    // negate d for the next point
    dir.negate();
    // start looping
    while ( true ) {
        // push a new point to the simplex because we haven't terminated yet
        lastlast = last;
        last = support( dir );
        simplexLen = simplex.push( last );

        // check if the last point we added actually passed the origin
        if ( last.dot( dir ) <= 0.0 ) {
            // if the point added last was not past the origin in the direction of d
            // then the Minkowski Sum cannot possibly contain the origin since
            // the last point added is on the edge of the Minkowski Difference
            break;
        } else {

            // otherwise we need to determine if the origin is in
            // the current simplex and act accordingly

            // if it's a line...
            if ( simplexLen === 2 ){
                // dir = AB = B - A
                dir.clone( lastlast ).vsub( last );
                // if (left handed coordinate system) 
                // A cross AB < 0 then get perpendicular counter clockwise 
                dir.perp( (last.cross( dir ) < 0) );

            // if it's a triangle...
            } else if ( simplexLen === 3 ){

                ab = ab || scratch.vector();
                ac = ac || scratch.vector();

                // get the edges AB and AC
                ab.clone( lastlast ).vsub( last );
                ac.clone( simplex[ 0 ] ).vsub( last );

                // here normally people think about this as getting outward facing
                // normals and checking dot products. Since we're in 2D
                // we can be clever...
                sign = ab.cross( ac ) > 0;
                tmp = last.cross( ab );
                // TODO: if tmp === 0, then the origin is ON an edge... optimization?

                if ( sign ^ (tmp > 0) ){

                    // ok... so there's an XOR here... don't freak out
                    // remember last = A = -AO
                    // if AB cross AC and AO cross AB have the same sign
                    // then the origin is along the outward facing normal of AB
                    // so if AB cross AC and A cross AB have _different_ (XOR) signs
                    // then this is also the case... so we proceed...

                    // morph the ab vector into its outward facing normal
                    ab.perp( sign );
                    // swap names
                    sign = dir;
                    dir = ab;
                    ab = sign;
                    // point C is dead to us now...
                    simplex.shift();
                    // continue...

                } else {
                    // this means we can continue to look along
                    // the other outward normal direction (ACperp)
                    // if we don't see the origin... then we must have it enclosed

                    tmp = ac.cross( last );
                    if ( sign ^ (tmp > 0) ){
                        // then the origin is along the outward facing normal 
                        // of AC; (ACperp)

                        ac.perp( !sign );
                        // swap names
                        sign = dir;
                        dir = ac;
                        ac = sign;
                        // point B is dead to us now...
                        simplex.splice(1, 1);
                        // continue...

                    } else {

                        // we have enclosed the origin!
                        overlap = true;
                        // take a break...
                        break;
                    }
                }
            }
        }
    }

    // free workspace
    scratch.done();

    return {
        overlap: overlap,
        simplex: simplex
    }
};

Physics.gjk = gjk;

})();
/**
 * Original liner notes:
 * A simple library for determining intersections of circles and
 * polygons using the Separating Axis Theorem.
 */
(function() {
    
    /**
     * A circle.
     * 
     * @param {Vector=} pos A vector representing the position of the center of the circle
     * @param {?number=} r The radius of the circle
     * @constructor
     */
    var Circle = function(pos, r) {
        this.pos = pos || Physics.vector();
        this.r = r || 0;
    };
    
    /**
     * A *convex* clockwise polygon.
     * 
     * @param {Vector=} pos A vector representing the origin of the polygon. (all other
     *   vertices are relative to this one)
     * @param {Array.<Vector>=} vertices An array of vectors representing the vertices in the polygon,
     *   in clockwise order.
     * @constructor
     */
    var Polygon = function(pos, vertices) {
        this.pos = pos || Physics.vector();
        this.vertices = vertices || [];
        this.recalc();
    };
    
    /**
     * Recalculate the edges and normals of the polygon.  This
     * MUST be called if the vertices array is modified at all and
     * the edges or normals are to be accessed.
     */
    Polygon.prototype.recalc = function() {
        var vertices = this.vertices;
        var len = vertices.length;
        this.edges = []; 
        this.normals = [];
        for (var i = 0; i < len; i++) {
            var p1 = vertices[i]; 
            var p2 = i < len - 1 ? vertices[i + 1] : vertices[0];
            var e = Physics.vector().clone(p2).vsub(p1);
            var n = Physics.vector().clone(e).perp().normalize();
            this.edges.push(e);
            this.normals.push(n);
        }
    };
    
    /**
     * An axis-aligned box, with width and height.
     * 
     * @param {Vector=} pos A vector representing the top-left of the box.
     * @param {?number=} w The width of the box.
     * @param {?number=} h The height of the box.
     * @constructor
     */
    var Box = function(pos, w, h) {
        this.pos = pos || Physics.vector();
        this.w = w || 0; 
        this.h = h || 0;
    };

    /**
     * Create a polygon that is the same as this box.
     * 
     * @return {Polygon} A new Polygon that represents this box.
     */
    Box.prototype.toPolygon = function() {
        var pos = this.pos;
        var w = this.w;
        var h = this.h;
        return new Polygon(Physics.vector(pos), [
         Physics.vector(), Physics.vector(w, 0), 
         Physics.vector(w,h), Physics.vector(0,h)
        ]);
    };
    

    /**
     * An object representing the result of an intersection. Contain information about:
     * - The two objects participating in the intersection
     * - The vector representing the minimum change necessary to extract the first object
     *   from the second one.
     * - Whether the first object is entirely inside the second, or vice versa.
     * 
     * @constructor
     */  
    var Result = function Result() {

        if (!(this instanceof Result)){
            return new Result();
        }

        this.a = null;
        this.b = null;
        this.overlapN = Physics.vector(); // Unit vector in the direction of overlap
        this.overlapV = Physics.vector(); // Subtract this from a's position to extract it from b
        this.clear();
    };

    /**
     * Set some values of the result back to their defaults.  Call this between tests if 
     * you are going to reuse a single Result object for multiple intersection tests (recommented)
     * 
     * @return {Result} This for chaining
     */
    Result.prototype.clear = function() {
        this.aInB = true; // Is a fully inside b?
        this.bInA = true; // Is b fully inside a?
        this.overlap = Number.MAX_VALUE; // Amount of overlap (magnitude of overlapV). Can be 0 (if a and b are touching)
        return this;
    };
    
    /**
     * Flattens the specified array of vertices onto a unit vector axis,
     * resulting in a one dimensional range of the minimum and 
     * maximum value on that axis.
     *
     * @param {Array.<Vector>} vertices The vertices to flatten.
     * @param {Vector} normal The unit vector axis to flatten on.
     * @param {Array.<number>} result An array.  After calling this function,
     *   result[0] will be the minimum value,
     *   result[1] will be the maximum value.
     */
    var flattenVerticesOn = function flattenVerticesOn(vertices, normal, result) {
        var min = Number.MAX_VALUE;
        var max = -Number.MAX_VALUE;
        var len = vertices.length;
        var dot;
        for (var i = 0; i < len; i++ ) {
            // Get the magnitude of the projection of the point onto the normal
            dot = vertices[i].dot(normal);
            if (dot < min) { min = dot; }
            if (dot > max) { max = dot; }
        }
        result[0] = min;
        result[1] = max;
    };
    
    /**
     * Check whether two convex clockwise polygons are separated by the specified
     * axis (must be a unit vector).
     * 
     * @param {Vector} aPos The position of the first polygon.
     * @param {Vector} bPos The position of the second polygon.
     * @param {Array.<Vector>} aVertices The vertices in the first polygon.
     * @param {Array.<Vector>} bVertices The vertices in the second polygon.
     * @param {Vector} axis The axis (unit sized) to test against.  The vertices of both polygons
     *   will be projected onto this axis.
     * @param {Result=} result A Result object (optional) which will be populated
     *   if the axis is not a separating axis.
     * @return {boolean} true if it is a separating axis, false otherwise.  If false,
     *   and a result is passed in, information about how much overlap and
     *   the direction of the overlap will be populated.
     */
    var isSeparatingAxis = function isSeparatingAxis(aPos, bPos, aVertices, bVertices, axis, result) {
        var scratch = Physics.scratchpad();
        var rangeA = scratch.array();
        var rangeB = scratch.array();
        var offsetV = scratch.vector();
        // Get the magnitude of the offset between the two polygons
        offsetV.clone(bPos).vsub(aPos);
        var projectedOffset = offsetV.dot(axis);
        // Project the polygons onto the axis.
        flattenVerticesOn(aVertices, axis, rangeA);
        flattenVerticesOn(bVertices, axis, rangeB);
        // Move B's range to its position relative to A.
        rangeB[0] += projectedOffset;
        rangeB[1] += projectedOffset;
        // Check if there is a gap. If there is, this is a separating axis and we can stop
        if (rangeA[0] > rangeB[1] || rangeB[0] > rangeA[1]) {
            scratch.done();
            return true;
        }
        // If we're calculating a result, calculate the overlap.
        if (result) {
            var overlap = 0;
            // A starts further left than B
            if (rangeA[0] < rangeB[0]) {
                result.aInB = false;
                // A ends before B does. We have to pull A out of B
                if (rangeA[1] < rangeB[1]) { 
                    overlap = rangeA[1] - rangeB[0];
                    result.bInA = false;
                // B is fully inside A.  Pick the shortest way out.
                } else {
                    var option1 = rangeA[1] - rangeB[0];
                    var option2 = rangeB[1] - rangeA[0];
                    overlap = option1 < option2 ? option1 : -option2;
                }
            // B starts further left than A
            } else {
                result.bInA = false;
                // B ends before A ends. We have to push A out of B
                if (rangeA[1] > rangeB[1]) { 
                    overlap = rangeA[0] - rangeB[1];
                    result.aInB = false;
                // A is fully inside B.  Pick the shortest way out.
                } else {
                    var option1 = rangeA[1] - rangeB[0];
                    var option2 = rangeB[1] - rangeA[0];
                    overlap = option1 < option2 ? option1 : -option2;
                }
            }
            // If this is the smallest amount of overlap we've seen so far, set it as the minimum overlap.
            var absOverlap = Math.abs(overlap);
            if (absOverlap < result.overlap) {
                result.overlap = absOverlap;
                result.overlapN.clone(axis);
                if (overlap < 0) {
                    result.overlapN.negate();
                }
            }      
        }
        scratch.done();
        return false;
    };

    /**
     * @const
     */
    var LEFT_VORNOI_REGION = -1;
    /**
     * @const
     */
    var MIDDLE_VORNOI_REGION = 0;
    /**
     * @const
     */
    var RIGHT_VORNOI_REGION = 1;
    
    /**
     * Calculates which Vornoi region a point is on a line segment.
     * It is assumed that both the line and the point are relative to (0, 0)
     * 
     *             |       (0)      | 
     *      (-1)  [0]--------------[1]  (1)
     *             |       (0)      | 
     * 
     * @param {Vector} line The line segment.
     * @param {Vector} point The point.
     * @return  {number} LEFT_VORNOI_REGION (-1) if it is the left region, 
     *          MIDDLE_VORNOI_REGION (0) if it is the middle region, 
     *          RIGHT_VORNOI_REGION (1) if it is the right region.
     */
    var vornoiRegion = function vornoiRegion(line, point) {
        var len2 = line.normSq();
        var dp = point.dot(line);
        if (dp < 0) { return LEFT_VORNOI_REGION; }
        else if (dp > len2) { return RIGHT_VORNOI_REGION; }
        else { return MIDDLE_VORNOI_REGION; }
    };
    
    /**
     * Check if two circles intersect.
     * 
     * @param {Body} bodyA The first circle.
     * @param {Body} bodyB The second circle.
     * @param {Result=} result Result object (optional) that will be populated if
     *   the circles intersect.
     * @return {boolean} true if the circles intersect, false if they don't. 
     */
    var testCircleCircle = function testCircleCircle(bodyA, bodyB, result) {
        var scratch = Physics.scratchpad();
        var differenceV = scratch.vector().clone(bodyB.state.pos).vsub(bodyA.state.pos);
        var rA = bodyA.geometry.radius;
        var rB = bodyB.geometry.radius;
        var totalRadius = rA + rB;
        var totalRadiusSq = totalRadius * totalRadius;
        var distanceSq = differenceV.normSq();
        if (distanceSq > totalRadiusSq) {
            // They do not intersect 
            scratch.done();
            return false;
        }
        // They intersect.  If we're calculating a result, calculate the overlap.
        if (result) { 
            var dist = Math.sqrt(distanceSq);
            result.a = bodyA;
            result.b = bodyB;
            result.overlap = totalRadius - dist;
            result.overlapN.clone(differenceV.normalize());
            result.overlapV.clone(differenceV).mult(result.overlap);
            result.aInB = rA <= rB && dist <= rB - rA;
            result.bInA = rB <= rA && dist <= rA - rB;
        }
        scratch.done();
        return true;
    };
    
    /**
     * Check if a polygon and a circle intersect.
     * 
     * @param {Polygon} polygon The polygon.
     * @param {Circle} circle The circle.
     * @param {Result=} result Result object (optional) that will be populated if
     *   they interset.
     * @return {boolean} true if they intersect, false if they don't.
     */
    var testPolygonCircle = function testPolygonCircle(polygon, circle, result) {
        var scratch = Physics.scratchpad();
        var circlePos = scratch.vector().clone(circle.pos).vsub(polygon.pos);
        var radius = circle.r;
        var radius2 = radius * radius;
        var vertices = polygon.vertices;
        var len = vertices.length;
        var edge = scratch.vector();
        var point = scratch.vector();
        
        // For each edge in the polygon
        for (var i = 0; i < len; i++) {
            var next = i === len - 1 ? 0 : i + 1;
            var prev = i === 0 ? len - 1 : i - 1;
            var overlap = 0;
            var overlapN = null;
            
            // Get the edge
            edge.clone(polygon.edges[i]);
            // Calculate the center of the cirble relative to the starting point of the edge
            point.clone(circlePos).vsub(vertices[i]);
            
            // If the distance between the center of the circle and the point
            // is bigger than the radius, the polygon is definitely not fully in
            // the circle.
            if (result && point.normSq() > radius2) {
                result.aInB = false;
            }
            
            // Calculate which Vornoi region the center of the circle is in.
            var region = vornoiRegion(edge, point);
            if (region === LEFT_VORNOI_REGION) { 
                // Need to make sure we're in the RIGHT_VORNOI_REGION of the previous edge.
                edge.clone(polygon.edges[prev]);
                // Calculate the center of the circle relative the starting point of the previous edge
                var point2 = scratch.vector().clone(circlePos).vsub(vertices[prev]);
                region = vornoiRegion(edge, point2);
                if (region === RIGHT_VORNOI_REGION) {
                    // It's in the region we want.  Check if the circle intersects the point.
                    var dist = point.norm();
                    if (dist > radius) {
                        // No intersection
                        scratch.done();
                        return false;
                    } else if (result) {
                        // It intersects, calculate the overlap
                        result.bInA = false;
                        overlapN = point.normalize();
                        overlap = radius - dist;
                    }
                }
            } else if (region === RIGHT_VORNOI_REGION) {
                // Need to make sure we're in the left region on the next edge
                edge.clone(polygon.edges[next]);
                // Calculate the center of the circle relative to the starting point of the next edge
                point.clone(circlePos).vsub(vertices[next]);
                region = vornoiRegion(edge, point);
                if (region === LEFT_VORNOI_REGION) {
                    // It's in the region we want.  Check if the circle intersects the point.
                    var dist = point.norm();
                    if (dist > radius) {
                        // No intersection
                        scratch.done();
                        return false;              
                    } else if (result) {
                        // It intersects, calculate the overlap
                        result.bInA = false;
                        overlapN = point.normalize();
                        overlap = radius - dist;
                    }
                }
            // MIDDLE_VORNOI_REGION
            } else {
                // Need to check if the circle is intersecting the edge,
                // Change the edge into its "edge normal".
                var normal = edge.perp().normalize();
                // Find the perpendicular distance between the center of the 
                // circle and the edge.
                var dist = point.dot(normal);
                var distAbs = Math.abs(dist);
                // If the circle is on the outside of the edge, there is no intersection
                if (dist > 0 && distAbs > radius) {
                    scratch.done();
                    return false;
                } else if (result) {
                    // It intersects, calculate the overlap.
                    overlapN = normal;
                    overlap = radius - dist;
                    // If the center of the circle is on the outside of the edge, or part of the
                    // circle is on the outside, the circle is not fully inside the polygon.
                    if (dist >= 0 || overlap < 2 * radius) {
                        result.bInA = false;
                    }
                }
            }
            
            // If this is the smallest overlap we've seen, keep it. 
            // (overlapN may be null if the circle was in the wrong Vornoi region)
            if (overlapN && result && Math.abs(overlap) < Math.abs(result.overlap)) {
                result.overlap = overlap;
                result.overlapN.clone(overlapN);
            }
        }
        
        // Calculate the final overlap vector - based on the smallest overlap.
        if (result) {
            result.a = polygon;
            result.b = circle;
            result.overlapV.clone(result.overlapN).mult(result.overlap);
        }
        scratch.done();
        return true;
    };
    
    /**
     * Check if a circle and a polygon intersect.
     * 
     * NOTE: This runs slightly slower than polygonCircle as it just
     * runs polygonCircle and reverses everything at the end.
     * 
     * @param {Circle} circle The circle.
     * @param {Polygon} polygon The polygon.
     * @param {Result=} result Result object (optional) that will be populated if
     *   they interset.
     * @return {boolean} true if they intersect, false if they don't.
     */
    var testCirclePolygon = function testCirclePolygon(circle, polygon, result) {
        var result = testPolygonCircle(polygon, circle, result);
        if (result && result) {
            // Swap A and B in the result.
            var a = result.a;
            var aInB = result.aInB;
            result.overlapN.negate();
            result.overlapV.negate();
            result.a = result.b; 
            result.b = a;
            result.aInB = result.bInA; 
            result.bInA = aInB;
        }
        return result;
    };
    
    /**
     * Checks whether two convex, clockwise polygons intersect.
     * 
     * @param {Polygon} a The first polygon.
     * @param {Polygon} b The second polygon.
     * @param {Result=} result Result object (optional) that will be populated if
     *   they interset.
     * @return {boolean} true if they intersect, false if they don't.
     */
    var testPolygonPolygon = function testPolygonPolygon(a, b, result) {
        var aVertices = a.vertices;
        var aLen = aVertices.length;
        var bVertices = b.vertices;
        var bLen = bVertices.length;
        // If any of the edge normals of A is a separating axis, no intersection.
        for (var i = 0; i < aLen; i++) {
            if (isSeparatingAxis(a.pos, b.pos, aVertices, bVertices, a.normals[i], result)) {
                return false;
            }
        }
        // If any of the edge normals of B is a separating axis, no intersection.
        for (var i = 0; i < bLen; i++) {
            if (isSeparatingAxis(a.pos, b.pos, aVertices, bVertices, b.normals[i], result)) {
                return false;
            }
        }
        // Since none of the edge normals of A or B are a separating axis, there is an intersection
        // and we've already calculated the smallest overlap (in isSeparatingAxis).  Calculate the
        // final overlap vector.
        if (result) {
            result.a = a;
            result.b = b;
            result.overlapV.clone(result.overlapN).mult(result.overlap);
        }
        return true;
    };

    Physics.intersection = {
        result: Result,
        testCircleCircle: testCircleCircle,
        testPolygonCircle: testPolygonCircle,
        testPolygonPolygon: testPolygonPolygon
    };
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
    ,typedArrays = !!window.Float32Array
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
        this._ = new Float32Array(5);
    }

    if (x && x._ && x._.length){

        this.clone( x );

    } else {

        if (!typedArrays){
            this._ = [];
        }

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

    this._[0] = x;
    this._[1] = y;
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
 * Get the cross product
 */
Vector.prototype.cross = function(v) {

    return (this._[0] * v._[1]) - (this._[1] * v._[0]);
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

    if (!v){
        v = Vector.axis[0];
    }

    var prod = this.dot( v ) / ( this.norm() * v.norm() );

    return acos( prod );
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
 * @param {Boolean} cw Set to true if want to go clockwise instead
 * @return {this}
 */
Vector.prototype.perp = function( ccw ) {

    var tmp = this._[0]
        ;

    if ( ccw ){

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
        this._[ 0 ] * t.sinA - this._[ 1 ] * t.cosA + t.v._[ 1 ]
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
        this._[ 0 ] * t.sinA - this._[ 1 ] * t.cosA
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

// assign

Physics.vector = Vector;

/**
 * end Vector class
 */
}(this));

(function(){

    // Service
    Physics.behavior = Physics.behaviour = Decorator('behavior', {

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
        }
    });

}());
(function(){

    // Service
    Physics.geometry = Decorator('geometry', {

        // prototype methods
        init: function( options ){

        },
        
        // get axis-aligned bounding box for this object
        // to be overridden
        aabb: function(){

            return {
                halfWidth: 0,
                halfHeight: 0
            };
        },

        // get farthest point of this geometry along the direction vector "dir"
        // returns local coordinates
        // replace result if provided
        getFarthestPoint: function( dir, result ){

            result = result || Physics.vector();

            // not implemented.
            return result.set( 0, 0 );
        }
    });

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

    var ScratchFactory = function ScratchFactory(){

        // private variables
        var objIndex = 0
            ,arrayIndex = 0
            ,vectorIndex = 0
            ,objectStack = []
            ,arrayStack = []
            ,vectorStack = []
            ;

        if (++numScratches >= SCRATCH_MAX_SCRATCHES){
            throw SCRATCH_MAX_REACHED;
        }

        return {

            // declare that your work is finished
            done: function(){

                this._active = false;
                objIndex = arrayIndex = vectorIndex = 0;
                // add it back to the scratch stack for future use
                scratches.push(this);
            },

            object: function(){

                if (!this._active){
                    throw SCRATCH_USAGE_ERROR;
                }

                if (objIndex >= SCRATCH_MAX_INDEX){
                    throw SCRATCH_INDEX_OUT_OF_BOUNDS;
                }

                return objectStack[ objIndex++ ] || objectStack[ objectStack.push({}) - 1 ];
            },

            array: function(){

                if (!this._active){
                    throw SCRATCH_USAGE_ERROR;
                }

                if (arrIndex >= SCRATCH_MAX_INDEX){
                    throw SCRATCH_INDEX_OUT_OF_BOUNDS;
                }

                return arrayStack[ arrIndex++ ] || arrayStack[ arrayStack.push([]) - 1 ];
            },

            vector: function(){

                if (!this._active){
                    throw SCRATCH_USAGE_ERROR;
                }

                if (vectorIndex >= SCRATCH_MAX_INDEX){
                    throw SCRATCH_INDEX_OUT_OF_BOUNDS;
                }

                return vectorStack[ vectorIndex++ ] || vectorStack[ vectorStack.push(Physics.vector()) - 1 ];
            }
        };
    };
    
    Physics.scratchpad = function(){

        var scratch = scratches.pop() || ScratchFactory();
        scratch._active = true;
        return scratch;
    };

})();
(function(){

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
                break; // end default
            }
        } while ( ++i < len && (thing = arg[ i ]) )

        return this;
    },

    // add a behavior
    addBehavior: function( behavior ){

        // TODO more...
        this._behaviorStack.push( behavior );
        return this;
    },

    addBody: function( body ){

        this._bodies.push( body );
        return this;
    },

    applyBehaviors: function( dt ){

        var behaviors = this._behaviorStack
            ;

        for ( var i = 0, l = behaviors.length; i < l; ++i ){
            
            behaviors[ i ].behave( this._bodies, dt );
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

        if ( !diff ) return this;
        
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
        },
        
        aabb: function(){

            return {
                halfWidth: this.radius,
                halfHeight: this.radius
            };
        },

        // get farthest point of this geometry along the direction vector "dir"
        // returns local coordinates
        // replace result if provided
        getFarthestPoint: function( dir, result ){

            result = result || Physics.vector();

            return result.clone( dir ).normalize().mult( this.radius );
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

            // moment of inertia
            this.moi = this.mass * this.geometry.radius * this.geometry.radius / 2;
        }
    }
});

// edge-bounce behavior
Physics.behavior('edge-bounce', function( parent ){

    var defaults = {

        bounds: null,
        restitution: 1.0,
        callback: null
    };

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

        init: function( options ){

            // call parent init method
            parent.init.call(this, options);

            options = Physics.util.extend({}, defaults, options);

            this.bounds = options.bounds;
            this.restitution = options.restitution;
            this.callback = options.callback;
        },
        
        behave: function( bodies, dt ){

            var body
                ,pos
                ,state
                ,scratch = Physics.scratchpad()
                ,p = scratch.vector()
                ,bounds = this.bounds
                ,callback = this.callback
                ,dim
                ,x
                ,cor
                ,cof = 0.6
                ,norm = scratch.vector()
                ,impulse
                ;

            if (!bounds) throw "Bounds not set";
            
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
                        if ( (pos._[ 0 ] + dim) >= bounds.max._[ 0 ] ){

                            norm.set(-1, 0);
                            p.set(dim, 0); // set perpendicular displacement from com to impact point
                            
                            // adjust position
                            pos._[ 0 ] = bounds.max._[ 0 ] - dim;

                            applyImpulse(state, norm, p, body.moi, body.mass, cor, cof);

                            p.set( bounds.max._[ 0 ], pos._[ 1 ] );
                            callback && callback( body, p );
                        }
                        
                        // left
                        if ( (pos._[ 0 ] - dim) <= bounds.min._[ 0 ] ){

                            norm.set(1, 0);
                            p.set(-dim, 0); // set perpendicular displacement from com to impact point
                            
                            // adjust position
                            pos._[ 0 ] = bounds.min._[ 0 ] + dim;

                            applyImpulse(state, norm, p, body.moi, body.mass, cor, cof);

                            p.set( bounds.min._[ 0 ], pos._[ 1 ] );
                            callback && callback( body, p );
                        }

                        // bottom
                        if ( (pos._[ 1 ] + dim) >= bounds.max._[ 1 ] ){

                            norm.set(0, -1);
                            p.set(0, dim); // set perpendicular displacement from com to impact point
                            
                            // adjust position
                            pos._[ 1 ] = bounds.max._[ 1 ] - dim;

                            applyImpulse(state, norm, p, body.moi, body.mass, cor, cof);

                            p.set( pos._[ 0 ], bounds.max._[ 1 ] );
                            callback && callback( body, p );
                        }
                            
                        // top
                        if ( (pos._[ 1 ] - dim) <= bounds.min._[ 1 ] ){

                            norm.set(0, 1);
                            p.set(0, -dim); // set perpendicular displacement from com to impact point
                            
                            // adjust position
                            pos._[ 1 ] = bounds.min._[ 1 ] + dim;

                            applyImpulse(state, norm, p, body.moi, body.mass, cor, cof);

                            p.set( pos._[ 0 ], bounds.min._[ 1 ] );
                            callback && callback( body, p );
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

            for ( var j = 0, ll = bodies.length; j < ll; j++ ){
                
                body = bodies[ j ];

                for ( var i = j + 1, l = bodies.length; i < l; i++ ){
                    
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
        orientationLineColor: '#cc0000'
    };

    return {

        init: function( options ){

            // call proto init
            proto.init.call(this, options);

            // further options
            Physics.util.extend(this.options, defaults, this.options);

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

        createView: function( geometry ){

            var view = new Image()
                ,aabb = geometry.aabb()
                ,hw = aabb.halfWidth
                ,hh = aabb.halfHeight
                ,x = hw + 1
                ,y = hh + 1
                ,hiddenCtx = this.hiddenCtx
                ,hiddenCanvas = this.hiddenCanvas
                ;
            
            // clear
            hiddenCanvas.width = 2 * hw + 2;
            hiddenCanvas.height = 2 * hh + 2;

            if (geometry.name === 'circle'){

                hiddenCtx.beginPath();
                hiddenCtx.fillStyle = hiddenCtx.strokeStyle = this.options.bodyColor;
                hiddenCtx.arc(x, y, hw, 0, Pi2, false);
                hiddenCtx.closePath();
                hiddenCtx.stroke();
                hiddenCtx.fill();
            }

            if (this.options.orientationLineColor){

                hiddenCtx.beginPath();
                hiddenCtx.strokeStyle = this.options.orientationLineColor;
                hiddenCtx.moveTo(x, y);
                hiddenCtx.lineTo(x + hw, y);
                hiddenCtx.closePath();
                hiddenCtx.stroke();
            }

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
                ;

            ctx.save();
            ctx.translate(pos.get(0), pos.get(1));
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