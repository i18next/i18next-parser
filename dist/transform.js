"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));var _helpers = require("./helpers");
var _stream = require("stream");
var _eol = _interopRequireDefault(require("eol"));
var _fs = _interopRequireDefault(require("fs"));
var _parser = _interopRequireDefault(require("./parser"));
var _path = _interopRequireDefault(require("path"));
var _vinyl = _interopRequireDefault(require("vinyl"));
var _jsYaml = _interopRequireDefault(require("js-yaml"));
var _i18next = _interopRequireDefault(require("i18next"));function _createForOfIteratorHelper(o, allowArrayLike) {var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {if (i >= o.length) return { done: true };return { done: false, value: o[i++] };}, e: function e(_e) {throw _e;}, f: F };}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion = true,didErr = false,err;return { s: function s() {it = it.call(o);}, n: function n() {var step = it.next();normalCompletion = step.done;return step;}, e: function e(_e2) {didErr = true;err = _e2;}, f: function f() {try {if (!normalCompletion && it["return"] != null) it["return"]();} finally {if (didErr) throw err;}} };}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {(0, _defineProperty2["default"])(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = (0, _getPrototypeOf2["default"])(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return (0, _possibleConstructorReturn2["default"])(this, result);};}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}

function getPluralSuffix(numberOfPluralForms, nthForm) {
  if (numberOfPluralForms.length > 2) {
    return nthForm; // key_0, key_1, etc.
  } else if (nthForm === 1) {
    return 'plural';
  }
  return '';
}var

i18nTransform = /*#__PURE__*/function (_Transform) {(0, _inherits2["default"])(i18nTransform, _Transform);var _super = _createSuper(i18nTransform);
  function i18nTransform() {var _this;var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};(0, _classCallCheck2["default"])(this, i18nTransform);
    options.objectMode = true;
    _this = _super.call(this, options);

    _this.defaults = {
      contextSeparator: '_',
      createOldCatalogs: true,
      defaultNamespace: 'translation',
      defaultValue: '',
      indentation: 2,
      keepRemoved: false,
      keySeparator: '.',
      lexers: {},
      lineEnding: 'auto',
      locales: ['en', 'fr'],
      namespaceSeparator: ':',
      pluralSeparator: '_',
      output: 'locales/$LOCALE/$NAMESPACE.json',
      sort: false,
      useKeysAsDefaultValue: false,
      verbose: false,
      skipDefaultValues: false,
      customValueTemplate: null,
      failOnWarnings: false };


    _this.options = _objectSpread(_objectSpread({}, _this.defaults), options);
    if (_this.options.keySeparator === false) {
      _this.options.keySeparator = '__!NO_KEY_SEPARATOR!__';
    }
    if (_this.options.namespaceSeparator === false) {
      _this.options.namespaceSeparator = '__!NO_NAMESPACE_SEPARATOR!__';
    }
    _this.entries = [];

    _this.parserHadWarnings = false;
    _this.parser = new _parser["default"](_this.options);
    _this.parser.on('error', function (error) {return _this.error(error);});
    _this.parser.on('warning', function (warning) {return _this.warn(warning);});

    _this.localeRegex = /\$LOCALE/g;
    _this.namespaceRegex = /\$NAMESPACE/g;

    _i18next["default"].init();return _this;
  }(0, _createClass2["default"])(i18nTransform, [{ key: "error", value:

    function error(_error) {
      this.emit('error', _error);
      if (this.options.verbose) {
        console.error('\x1b[31m%s\x1b[0m', _error);
      }
    } }, { key: "warn", value:

    function warn(warning) {
      this.emit('warning', warning);
      this.parserHadWarnings = true;
      if (this.options.verbose) {
        console.warn('\x1b[33m%s\x1b[0m', warning);
      }
    } }, { key: "_transform", value:

    function _transform(file, encoding, done) {
      var content;
      if (file.isBuffer()) {
        content = file.contents.toString('utf8');
      } else if (_fs["default"].lstatSync(file.path).isDirectory()) {
        var warning = "".concat(file.path, " is a directory: skipping");
        this.warn(warning);
        done();
        return;
      } else {
        content = _fs["default"].readFileSync(file.path, encoding);
      }

      this.emit('reading', file);
      if (this.options.verbose) {
        console.log("Parsing ".concat(file.path));
      }

      var filename = _path["default"].basename(file.path);
      var entries = this.parser.parse(content, filename);var _iterator = _createForOfIteratorHelper(

      entries),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var entry = _step.value;
          var key = entry.key;
          var parts = key.split(this.options.namespaceSeparator);

          // make sure we're not pulling a 'namespace' out of a default value
          if (parts.length > 1 && key !== entry.defaultValue) {
            entry.namespace = parts.shift();
          }
          entry.namespace = entry.namespace || this.options.defaultNamespace;

          key = parts.join(this.options.namespaceSeparator);
          key = key.replace(/\\('|"|`)/g, '$1');
          key = key.replace(/\\n/g, '\n');
          key = key.replace(/\\r/g, '\r');
          key = key.replace(/\\t/g, '\t');
          key = key.replace(/\\\\/g, '\\');
          entry.key = key;
          entry.keyWithNamespace = entry.namespace + this.options.keySeparator + key;

          this.addEntry(entry);
        }} catch (err) {_iterator.e(err);} finally {_iterator.f();}

      done();
    } }, { key: "_flush", value:

    function _flush(done) {var _this2 = this;
      if (this.options.sort) {
        this.entries = this.entries.sort(function (a, b) {return a.key.localeCompare(b.key);});
      }var _iterator2 = _createForOfIteratorHelper(

      this.options.locales),_step2;try {var _loop = function _loop() {var locale = _step2.value;
          var catalog = {};
          var pluralRule = _i18next["default"].services.pluralResolver.getRule(locale);
          var numbers = pluralRule && pluralRule.numbers || [1, 2];

          var countWithPlurals = 0;
          var uniqueCount = _this2.entries.length;

          var transformEntry = function transformEntry(entry, suffix) {
            var _dotPathToHash = (0, _helpers.dotPathToHash)(entry, catalog, {
              suffix: suffix,
              locale: locale,
              separator: _this2.options.keySeparator,
              pluralSeparator: _this2.options.pluralSeparator,
              value: _this2.options.defaultValue,
              useKeysAsDefaultValue: _this2.options.useKeysAsDefaultValue,
              skipDefaultValues: _this2.options.skipDefaultValues,
              customValueTemplate: _this2.options.customValueTemplate }),duplicate = _dotPathToHash.duplicate,conflict = _dotPathToHash.conflict;


            if (duplicate) {
              uniqueCount -= 1;
              if (conflict === 'key') {
                var warning = "Found translation key already mapped to a map or parent of new key already mapped to a string: ".concat(entry.key);
                _this2.warn(warning);
              } else if (conflict === 'value') {
                var _warning = "Found same keys with different values: ".concat(entry.key);
                _this2.warn(_warning);
              }
            } else {
              countWithPlurals += 1;
            }
          };

          // generates plurals according to i18next rules: key, key_plural, key_0, key_1, etc.
          var _iterator3 = _createForOfIteratorHelper(_this2.entries),_step3;try {var _loop2 = function _loop2() {var entry = _step3.value;
              if (entry.count !== undefined) {
                numbers.forEach(function (_, i) {
                  transformEntry(entry, getPluralSuffix(numbers, i));
                });
              } else {
                transformEntry(entry);
              }};for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {_loop2();
            }} catch (err) {_iterator3.e(err);} finally {_iterator3.f();}

          var outputPath = _path["default"].resolve(_this2.options.output);

          for (var namespace in catalog) {
            var namespacePath = outputPath;
            namespacePath = namespacePath.replace(_this2.localeRegex, locale);
            namespacePath = namespacePath.replace(_this2.namespaceRegex, namespace);

            var parsedNamespacePath = _path["default"].parse(namespacePath);

            var namespaceOldPath = _path["default"].join(
            parsedNamespacePath.dir, "".concat(
            parsedNamespacePath.name, "_old").concat(parsedNamespacePath.ext));


            var existingCatalog = _this2.getCatalog(namespacePath);
            var existingOldCatalog = _this2.getCatalog(namespaceOldPath);

            // merges existing translations with the new ones
            var _mergeHashes =




            (0, _helpers.mergeHashes)(
            existingCatalog,
            catalog[namespace],
            _this2.options.keepRemoved),newCatalog = _mergeHashes["new"],oldKeys = _mergeHashes.old,mergeCount = _mergeHashes.mergeCount,oldCount = _mergeHashes.oldCount;


            // restore old translations
            var _mergeHashes2 = (0, _helpers.mergeHashes)(
            existingOldCatalog,
            newCatalog),oldCatalog = _mergeHashes2.old,restoreCount = _mergeHashes2.mergeCount;


            // backup unused translations
            (0, _helpers.transferValues)(oldKeys, oldCatalog);

            if (_this2.options.verbose) {
              console.log("[".concat(locale, "] ").concat(namespace, "\n"));
              console.log("Unique keys: ".concat(
              uniqueCount, " (").concat(countWithPlurals, " with plurals)"));

              var addCount = countWithPlurals - mergeCount;
              console.log("Added keys: ".concat(addCount));
              console.log("Restored keys: ".concat(restoreCount));
              if (_this2.options.keepRemoved) {
                console.log("Unreferenced keys: ".concat(oldCount));
              } else {
                console.log("Removed keys: ".concat(oldCount));
              }
              console.log();
            }

            if (_this2.options.failOnWarnings && _this2.parserHadWarnings) {
              continue;
            }

            // push files back to the stream
            _this2.pushFile(namespacePath, newCatalog);
            if (
            _this2.options.createOldCatalogs && (
            Object.keys(oldCatalog).length || existingOldCatalog))
            {
              _this2.pushFile(namespaceOldPath, oldCatalog);
            }
          }};for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {_loop();
        }} catch (err) {_iterator2.e(err);} finally {_iterator2.f();}

      if (this.options.failOnWarnings && this.parserHadWarnings) {
        this.emit(
        'error',
        'Warnings were triggered and failOnWarnings option is enabled. Exiting...');

        process.exit(1);
      }

      done();
    } }, { key: "addEntry", value:

    function addEntry(entry) {
      if (entry.context) {
        var contextEntry = Object.assign({}, entry);
        delete contextEntry.context;
        contextEntry.key += this.options.contextSeparator + entry.context;
        contextEntry.keyWithNamespace +=
        this.options.contextSeparator + entry.context;
        this.entries.push(contextEntry);
      } else {
        this.entries.push(entry);
      }
    } }, { key: "getCatalog", value:

    function getCatalog(path) {
      try {
        var content;
        if (path.endsWith('yml')) {
          content = _jsYaml["default"].load(_fs["default"].readFileSync(path).toString());
        } else {
          content = JSON.parse(_fs["default"].readFileSync(path));
        }
        return content;
      } catch (error) {
        if (error.code !== 'ENOENT') {
          this.emit('error', error);
        }
      }

      return null;
    } }, { key: "pushFile", value:

    function pushFile(path, contents) {
      var text;
      if (path.endsWith('yml')) {
        text = _jsYaml["default"].dump(contents, {
          indent: this.options.indentation });

      } else {
        text = JSON.stringify(contents, null, this.options.indentation) + '\n';
      }

      if (this.options.lineEnding === 'auto') {
        text = _eol["default"].auto(text);
      } else if (
      this.options.lineEnding === '\r\n' ||
      this.options.lineEnding === 'crlf')
      {
        text = _eol["default"].crlf(text);
      } else if (
      this.options.lineEnding === '\r' ||
      this.options.lineEnding === 'cr')
      {
        text = _eol["default"].cr(text);
      } else {
        // Defaults to LF, aka \n
        text = _eol["default"].lf(text);
      }

      var file = new _vinyl["default"]({
        path: path,
        contents: Buffer.from(text) });

      this.push(file);
    } }]);return i18nTransform;}(_stream.Transform);exports["default"] = i18nTransform;