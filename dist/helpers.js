'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;}; /**
                                                                                                                                                                                                                                                                                                                                                      * Take an entry for the Parser and turn it into a hash,
                                                                                                                                                                                                                                                                                                                                                      * turning the key path 'foo.bar' into an hash {foo: {bar: ""}}
                                                                                                                                                                                                                                                                                                                                                      * The generated hash can be merged with an optional `target`.
                                                                                                                                                                                                                                                                                                                                                      * @returns An `{ target, duplicate, conflict }` object. `target` is the hash
                                                                                                                                                                                                                                                                                                                                                      * that was passed as an argument or a new hash if none was passed. `duplicate`
                                                                                                                                                                                                                                                                                                                                                      * indicates whether the entry already existed in the `target` hash. `conflict`
                                                                                                                                                                                                                                                                                                                                                      * is `"key"` if a parent of the key was already mapped to a string (e.g. when
                                                                                                                                                                                                                                                                                                                                                      * merging entry {one: {two: "bla"}} with target {one: "bla"}) or the key was
                                                                                                                                                                                                                                                                                                                                                      * already mapped to a map (e.g. when merging entry {one: "bla"} with target
                                                                                                                                                                                                                                                                                                                                                      * {one: {two: "bla"}}), `"value"` if the same key already exists swith a
                                                                                                                                                                                                                                                                                                                                                      * different value, or `false`.
                                                                                                                                                                                                                                                                                                                                                      */
function dotPathToHash(locale, entry) {var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var path = entry.key;
  if (options.suffix || options.suffix === 0) {
    path += '_' + options.suffix;
  }

  var separator = options.separator || '.';
  var key = entry.key.substring(
  entry.key.indexOf(separator) + separator.length,
  entry.key.length);

  var useKeysAsDefaultValue =
  typeof options.useKeysAsDefaultValue === 'function' ?
  options.useKeysAsDefaultValue(locale, entry.namespace) :
  options.useKeysAsDefaultValue;
  var skipDefaultValues =
  typeof options.skipDefaultValues === 'function' ?
  options.skipDefaultValues(locale, entry.namespace) :
  options.skipDefaultValues;
  var defaultValue =
  typeof options.value === 'function' ?
  options.value(locale, entry.namespace, key) :
  options.value;

  var newValue = void 0;
  if (useKeysAsDefaultValue) {
    newValue = key;
  } else if (skipDefaultValues) {
    newValue = '';
  } else if (entry.defaultValue) {
    newValue = entry.defaultValue;
  } else {
    newValue = defaultValue || '';
  }

  if (path.endsWith(separator)) {
    path = path.slice(0, -separator.length);
  }

  var segments = path.split(separator);
  var inner = target;
  var conflict = false;
  for (var i = 0; i < segments.length - 1; i += 1) {
    var segment = segments[i];
    if (segment) {
      if (typeof inner[segment] === 'string') {
        conflict = 'key';
      }
      if (inner[segment] === undefined || conflict) {
        inner[segment] = {};
      }
      inner = inner[segment];
    }
  }

  var lastSegment = segments[segments.length - 1];
  var oldValue = inner[lastSegment];
  if (oldValue !== undefined && oldValue !== newValue) {
    conflict = (typeof oldValue === 'undefined' ? 'undefined' : _typeof(oldValue)) !== (typeof newValue === 'undefined' ? 'undefined' : _typeof(newValue)) ? 'key' : 'value';
  }
  var duplicate = oldValue !== undefined || conflict !== false;

  if (options.customValueTemplate) {
    inner[lastSegment] = {};

    var entries = Object.entries(options.customValueTemplate);
    entries.forEach(function (valueEntry) {
      if (valueEntry[1] === '${defaultValue}') {
        inner[lastSegment][valueEntry[0]] = newValue;
      } else {
        inner[lastSegment][valueEntry[0]] =
        entry[valueEntry[1].replace(/\${(\w+)}/, '$1')] || '';
      }
    });
  } else {
    inner[lastSegment] = newValue;
  }

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
    } else {
      if (target[key] !== undefined) {
        if (typeof source[key] === 'string' || Array.isArray(source[key])) {
          target[key] = source[key];
          mergeCount += 1;
        } else {
          old[key] = source[key];
          oldCount += 1;
        }
      } else {
        // support for plural in keys
        var pluralRegex = /(_plural)|(_\d+)$/;
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
    } else {
      target[key] = sourceValue;
    }
  }
}exports.

dotPathToHash = dotPathToHash;exports.mergeHashes = mergeHashes;exports.transferValues = transferValues;