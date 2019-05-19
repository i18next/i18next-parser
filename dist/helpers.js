'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;} /**
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
  var path = entry.key;
  var separator = options.separator || '.';
  var newValue = entry.defaultValue || options.value || '';
  if (options.useKeysAsDefaultValue) {
    newValue = entry.key.substring(entry.key.indexOf('.') + 1, entry.key.length);
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
}var

ParsingError = function (_Error) {_inherits(ParsingError, _Error);
  function ParsingError(message) {_classCallCheck(this, ParsingError);var _this = _possibleConstructorReturn(this, (ParsingError.__proto__ || Object.getPrototypeOf(ParsingError)).call(this,
    message));
    _this.name = 'ParsingError';return _this;
  }return ParsingError;}(Error);exports.



dotPathToHash = dotPathToHash;exports.
mergeHashes = mergeHashes;exports.
transferValues = transferValues;exports.
ParsingError = ParsingError;