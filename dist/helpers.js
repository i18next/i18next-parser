'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.populateHash = exports.mergeHashes = exports.dotPathToHash = undefined;var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};var _lodash = require('lodash');var _lodash2 = _interopRequireDefault(_lodash);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

// Turn an entry for the Parser and turn in into a hash,
// turning the key path 'foo.bar' into an hash {foo: {bar: ""}}
// The generated hash can be attached to an optional `target`.
function dotPathToHash(entry) {var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var path = entry.key;
  var separator = options.separator || '.';
  var value = entry.defaultValue || options.value || '';

  if (path.endsWith(separator)) {
    path = path.slice(0, -separator.length);
  }

  var result = {};
  var segments = path.split(separator);

  segments.reduce(function (hash, segment, index) {
    if (!segment) {
      return hash;
    } else
    if (index === segments.length - 1) {
      hash[segment] = value;
    } else
    {
      hash[segment] = {};
    }
    return hash[segment];
  }, result);

  return _lodash2.default.merge(target, result);
}

// Takes a `source` hash and make sure its value
// are pasted in the `target` hash, if the target
// hash has the corresponding key (or if keepRemoved is true).
// If not, the value is added to an `old` hash.
function mergeHashes(source) {var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};var old = arguments[2];var keepRemoved = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  old = old || {};
  Object.keys(source).forEach(function (key) {
    var hasNestedEntries =
    _typeof(target[key]) === 'object' && !Array.isArray(target[key]);

    if (hasNestedEntries) {
      var nested = mergeHashes(
      source[key],
      target[key],
      old[key],
      keepRemoved);

      target[key] = nested.new;
      old[key] = nested.old;
    } else
    if (target[key] !== undefined) {
      if (typeof source[key] === 'string' || Array.isArray(source[key])) {
        target[key] = source[key];
      } else
      {
        old[key] = source[key];
      }
    } else
    {
      // support for plural in keys
      var pluralMatch = /_plural(_\d+)?$/.test(key);
      var singularKey = key.replace(/_plural(_\d+)?$/, '');

      // support for context in keys
      var contextMatch = /_([^_]+)?$/.test(singularKey);
      var rawKey = singularKey.replace(/_([^_]+)?$/, '');

      if (
      contextMatch && target[rawKey] !== undefined ||
      pluralMatch && target[singularKey] !== undefined)
      {
        target[key] = source[key];
      } else
      if (keepRemoved) {
        target[key] = source[key];
        old[key] = source[key];
      } else
      {
        old[key] = source[key];
      }
    }
  });

  return { old: old, new: target };
}

// Takes a `target` hash and replace its empty
// values with the `source` hash ones if they
// exist
function populateHash(source) {var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  Object.keys(source).forEach(function (key) {
    if (target[key] !== undefined) {
      if (_typeof(source[key]) === 'object') {
        target[key] = populateHash(source[key], target[key]);
      } else
      if (target[key] === '') {
        target[key] = source[key];
      }
    }
  });

  return target;
}exports.



dotPathToHash = dotPathToHash;exports.
mergeHashes = mergeHashes;exports.
populateHash = populateHash;