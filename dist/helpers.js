'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;}; /**
                                                                                                                                                                                                                                                                                                                                                      * Take an entry for the Parser and turn it into a hash,
                                                                                                                                                                                                                                                                                                                                                      * turning the key path 'foo.bar' into an hash {foo: {bar: ""}}
                                                                                                                                                                                                                                                                                                                                                      * The generated hash can be merged with an optional `target`.
                                                                                                                                                                                                                                                                                                                                                      * @returns An `{ target, duplicate }` object. `target` is the hash that
                                                                                                                                                                                                                                                                                                                                                      * was passed as an argument or a new hash if none was passed. `duplicate`
                                                                                                                                                                                                                                                                                                                                                      * indicates whether the entry already existed in the `target` hash.
                                                                                                                                                                                                                                                                                                                                                      */
function dotPathToHash(entry) {var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var path = entry.key;
  var separator = options.separator || '.';
  var newValue = entry.defaultValue || options.value || '';
  if (options.useKeysAsDefaultValue) {
    newValue = entry.key.substring(entry.key.indexOf(separator) + separator.length, entry.key.length);
  }

  if (path.endsWith(separator)) {
    path = path.slice(0, -separator.length);
  }

  var segments = path.split(separator);
  var inner = target;
  for (var i = 0; i < segments.length - 1; i += 1) {
    var segment = segments[i];
    if (segment) {
      if (inner[segment] === undefined) {
        inner[segment] = {};
      }
      inner = inner[segment];
    }
  }

  var lastSegment = segments[segments.length - 1];
  var oldValue = inner[lastSegment];
  var duplicate = oldValue !== undefined;
  var conflict = oldValue !== undefined && oldValue !== newValue;
  inner[lastSegment] = newValue;

  return { target: target, duplicate: duplicate, conflict: conflict };
}

/**
   * Takes a `source` hash and makes sure its value
   * is pasted in the `target` hash, if the target
   * hash has the corresponding key (or if `keepRemoved` is true).
   * @returns An `{ old, new, mergeCount, pullCount, oldCount }` object.
   * `old` is a hash of values that have not been merged into `target`.
   * `new` is `target`. `mergeCount` is the number of keys merged into
   * `new`, `pullCount` is the number of context and plural keys added to
   * `new` and `oldCount` is the number of keys that were either added to `old` or
   * `new` (if `keepRemoved` is true and `target` didn't have the corresponding
   * key).
   */
function mergeHashes(source, target) {var keepRemoved = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var old = {};
  var mergeCount = 0;
  var pullCount = 0;
  var oldCount = 0;
  for (var key in source) {
    var hasNestedEntries =
    _typeof(target[key]) === 'object' && !Array.isArray(target[key]);

    if (hasNestedEntries) {
      var nested = mergeHashes(
      source[key],
      target[key],
      old[key],
      keepRemoved);

      mergeCount += nested.mergeCount;
      pullCount += nested.pullCount;
      if (Object.keys(nested.old).length) {
        old[key] = nested.old;
        oldCount += nested.oldCount;
      }
    } else
    {
      if (target[key] !== undefined) {
        if (
        typeof source[key] === 'string' ||
        Array.isArray(source[key]))
        {
          target[key] = source[key];
          mergeCount += 1;
        } else {
          old[key] = source[key];
          oldCount += 1;
        }
      } else
      {
        // support for plural in keys
        var pluralRegex = /_plural(_\d+)?$/;
        var pluralMatch = pluralRegex.test(key);
        var singularKey = key.replace(pluralRegex, '');

        // support for context in keys
        var contextRegex = /_([^_]+)?$/;
        var contextMatch = contextRegex.test(singularKey);
        var rawKey = singularKey.replace(contextRegex, '');

        if (
        contextMatch && target[rawKey] !== undefined ||
        pluralMatch && target[singularKey] !== undefined)
        {
          target[key] = source[key];
          pullCount += 1;
        } else {
          if (keepRemoved) {
            target[key] = source[key];
          } else {
            old[key] = source[key];
          }
          oldCount += 1;
        }
      }
    }
  }

  return { old: old, new: target, mergeCount: mergeCount, pullCount: pullCount, oldCount: oldCount };
}

/**
   * Merge `source` into `target` by merging nested dictionaries.
   */
function transferValues(source, target) {
  for (var key in source) {
    var sourceValue = source[key];
    var targetValue = target[key];
    if (
    (typeof sourceValue === 'undefined' ? 'undefined' : _typeof(sourceValue)) === 'object' &&
    (typeof targetValue === 'undefined' ? 'undefined' : _typeof(targetValue)) === 'object' &&
    !Array.isArray(sourceValue))
    {
      transferValues(sourceValue, targetValue);
    } else
    {
      target[key] = sourceValue;
    }
  }
}exports.


dotPathToHash = dotPathToHash;exports.
mergeHashes = mergeHashes;exports.
transferValues = transferValues;