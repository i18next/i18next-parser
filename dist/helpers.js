'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.ParsingError = exports.transferValues = exports.mergeHashes = exports.dotPathToHash = undefined;var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};var _lodash = require('lodash');var _lodash2 = _interopRequireDefault(_lodash);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}

/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Turn an entry for the Parser and turn in into a hash,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * turning the key path 'foo.bar' into an hash {foo: {bar: ""}}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * The generated hash can be attached to an optional `target`.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  */
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

/**
   * Takes a `source` hash and makes sure its value
   * is pasted in the `target` hash, if the target
   * hash has the corresponding key (or if `keepRemoved` is true).
   * If not, the value is added to an `old` hash.
   */
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
      if (Object.keys(nested.old).length) {
        old[key] = nested.old;
      }
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
      pluralMatch && target[singularKey] !== undefined ||
      keepRemoved)
      {
        target[key] = source[key];
      } else
      {
        old[key] = source[key];
      }
    }
  });

  return target;
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
}var

ParsingError = function (_Error) {_inherits(ParsingError, _Error);
  function ParsingError(message) {_classCallCheck(this, ParsingError);var _this = _possibleConstructorReturn(this, (ParsingError.__proto__ || Object.getPrototypeOf(ParsingError)).call(this,
    message));
    _this.name = 'ParsingError';return _this;
  }return ParsingError;}(Error);exports.



dotPathToHash = dotPathToHash;exports.
mergeHashes = mergeHashes;exports.
populateHash = populateHash;exports.
transferValues = transferValues;exports.
ParsingError = ParsingError;