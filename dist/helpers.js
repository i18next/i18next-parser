"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.dotPathToHash = dotPathToHash;exports.mergeHashes = mergeHashes;exports.transferValues = transferValues;var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof")); /**
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
function dotPathToHash(entry) {var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var conflict = false;
  var duplicate = false;
  var path = entry.keyWithNamespace;
  if (options.suffix || options.suffix === 0) {
    path += "".concat(options.pluralSeparator).concat(options.suffix);
  }

  var separator = options.separator || '.';

  var key = entry.keyWithNamespace.substring(
  entry.keyWithNamespace.indexOf(separator) + separator.length,
  entry.keyWithNamespace.length);


  // There is no key to process so we return an empty object
  if (!key) {
    target[entry.namespace] = {};
    return { target: target, duplicate: duplicate, conflict: conflict };
  }

  var defaultValue =
  typeof options.value === 'function' ?
  options.value(options.locale, entry.namespace, key) :
  options.value;

  var skipDefaultValues =
  typeof options.skipDefaultValues === 'function' ?
  options.skipDefaultValues(options.locale, entry.namespace) :
  options.skipDefaultValues;

  var useKeysAsDefaultValue =
  typeof options.useKeysAsDefaultValue === 'function' ?
  options.useKeysAsDefaultValue(options.locale, entry.namespace) :
  options.useKeysAsDefaultValue;

  var newValue =
  entry["defaultValue_".concat(options.suffix)] ||
  entry.defaultValue ||
  defaultValue ||
  '';

  if (skipDefaultValues) {
    newValue = '';
  }

  if (useKeysAsDefaultValue) {
    newValue = key;
  }

  if (path.endsWith(separator)) {
    path = path.slice(0, -separator.length);
  }

  var segments = path.split(separator);
  var inner = target;
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
    if ((0, _typeof2["default"])(oldValue) !== (0, _typeof2["default"])(newValue)) {
      conflict = 'key';
    } else if (oldValue !== '') {
      if (newValue === '') {
        newValue = oldValue;
      } else {
        conflict = 'value';
      }
    }
  }
  duplicate = oldValue !== undefined || conflict !== false;

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
    (0, _typeof2["default"])(target[key]) === 'object' && !Array.isArray(target[key]);

    if (hasNestedEntries) {
      var nested = mergeHashes(source[key], target[key], keepRemoved);
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

  return { old: old, "new": target, mergeCount: mergeCount, pullCount: pullCount, oldCount: oldCount };
}

/**
 * Merge `source` into `target` by merging nested dictionaries.
 */
function transferValues(source, target) {
  for (var key in source) {
    var sourceValue = source[key];
    var targetValue = target[key];
    if (
    (0, _typeof2["default"])(sourceValue) === 'object' &&
    (0, _typeof2["default"])(targetValue) === 'object' &&
    !Array.isArray(sourceValue))
    {
      transferValues(sourceValue, targetValue);
    } else {
      target[key] = sourceValue;
    }
  }
}