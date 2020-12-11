'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _helpers = require('./helpers');
var _stream = require('stream');
var _eol = require('eol');var _eol2 = _interopRequireDefault(_eol);
var _fs = require('fs');var _fs2 = _interopRequireDefault(_fs);
var _parser = require('./parser');var _parser2 = _interopRequireDefault(_parser);
var _path = require('path');var _path2 = _interopRequireDefault(_path);
var _vinyl = require('vinyl');var _vinyl2 = _interopRequireDefault(_vinyl);
var _jsYaml = require('js-yaml');var _jsYaml2 = _interopRequireDefault(_jsYaml);
var _i18next = require('i18next');var _i18next2 = _interopRequireDefault(_i18next);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}

function getPluralSuffix(numberOfPluralForms, nthForm) {
  if (numberOfPluralForms.length > 2) {
    return nthForm; // key_0, key_1, etc.
  } else if (nthForm === 1) {
    return 'plural';
  }
  return '';
}var

i18nTransform = function (_Transform) {_inherits(i18nTransform, _Transform);
  function i18nTransform() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, i18nTransform);
    options.objectMode = true;var _this = _possibleConstructorReturn(this, (i18nTransform.__proto__ || Object.getPrototypeOf(i18nTransform)).call(this,
    options));

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
      output: 'locales/$LOCALE/$NAMESPACE.json',
      sort: false,
      useKeysAsDefaultValue: false,
      verbose: false,
      skipDefaultValues: false,
      customValueTemplate: null,
      failOnWarnings: false };


    _this.options = _extends({}, _this.defaults, options);
    if (_this.options.keySeparator === false) {
      _this.options.keySeparator = '__!NO_KEY_SEPARATOR!__';
    }
    if (_this.options.namespaceSeparator === false) {
      _this.options.namespaceSeparator = '__!NO_NAMESPACE_SEPARATOR!__';
    }
    _this.entries = [];

    _this.parserHadWarnings = false;
    _this.parser = new _parser2.default(_this.options);
    _this.parser.on('error', function (error) {return _this.error(error);});
    _this.parser.on('warning', function (warning) {return _this.warn(warning);});

    _this.localeRegex = /\$LOCALE/g;
    _this.namespaceRegex = /\$NAMESPACE/g;

    _i18next2.default.init();return _this;
  }_createClass(i18nTransform, [{ key: 'error', value: function error(

    _error) {
      this.emit('error', _error);
      if (this.options.verbose) {
        console.error('\x1b[31m%s\x1b[0m', _error);
      }
    } }, { key: 'warn', value: function warn(

    warning) {
      this.emit('warning', warning);
      this.parserHadWarnings = true;
      if (this.options.verbose) {
        console.warn('\x1b[33m%s\x1b[0m', warning);
      }
    } }, { key: '_transform', value: function _transform(

    file, encoding, done) {
      var content = void 0;
      if (file.isBuffer()) {
        content = file.contents.toString('utf8');
      } else if (_fs2.default.lstatSync(file.path).isDirectory()) {
        var warning = file.path + ' is a directory: skipping';
        this.warn(warning);
        done();
        return;
      } else {
        content = _fs2.default.readFileSync(file.path, encoding);
      }

      this.emit('reading', file);
      if (this.options.verbose) {
        console.log('Parsing ' + file.path);
      }

      var filename = _path2.default.basename(file.path);
      var entries = this.parser.parse(content, filename);var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {

        for (var _iterator = entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var entry = _step.value;
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
        }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator.return) {_iterator.return();}} finally {if (_didIteratorError) {throw _iteratorError;}}}

      done();
    } }, { key: '_flush', value: function _flush(

    done) {var _this2 = this;
      if (this.options.sort) {
        this.entries = this.entries.sort(function (a, b) {return a.key.localeCompare(b.key);});
      }var _loop = function _loop(

      locale) {
        var catalog = {};
        var pluralRule = _i18next2.default.services.pluralResolver.getRule(locale);
        var numbers = pluralRule && pluralRule.numbers || [1, 2];

        var countWithPlurals = 0;
        var uniqueCount = _this2.entries.length;

        var transformEntry = function transformEntry(entry, suffix) {var _dotPathToHash =
          (0, _helpers.dotPathToHash)(entry, catalog, {
            suffix: suffix,
            separator: _this2.options.keySeparator,
            value: _this2.options.defaultValue,
            useKeysAsDefaultValue: _this2.options.useKeysAsDefaultValue,
            skipDefaultValues: _this2.options.skipDefaultValues,
            customValueTemplate: _this2.options.customValueTemplate }),duplicate = _dotPathToHash.duplicate,conflict = _dotPathToHash.conflict;


          if (duplicate) {
            uniqueCount -= 1;
            if (conflict === 'key') {
              var warning = 'Found translation key already mapped to a map or parent of new key already mapped to a string: ' + entry.key;
              _this2.warn(warning);
            } else if (conflict === 'value') {
              var _warning = 'Found same keys with different values: ' + entry.key;
              _this2.warn(_warning);
            }
          } else {
            countWithPlurals += 1;
          }
        };

        // generates plurals according to i18next rules: key, key_plural, key_0, key_1, etc.
        var _loop2 = function _loop2(entry) {
          if (entry.count !== undefined) {
            numbers.forEach(function (_, i) {
              transformEntry(entry, getPluralSuffix(numbers, i));
            });
          } else {
            transformEntry(entry);
          }};var _iteratorNormalCompletion3 = true;var _didIteratorError3 = false;var _iteratorError3 = undefined;try {for (var _iterator3 = _this2.entries[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {var entry = _step3.value;_loop2(entry);
          }} catch (err) {_didIteratorError3 = true;_iteratorError3 = err;} finally {try {if (!_iteratorNormalCompletion3 && _iterator3.return) {_iterator3.return();}} finally {if (_didIteratorError3) {throw _iteratorError3;}}}

        var outputPath = _path2.default.resolve(_this2.options.output);

        for (var namespace in catalog) {
          var namespacePath = outputPath;
          namespacePath = namespacePath.replace(_this2.localeRegex, locale);
          namespacePath = namespacePath.replace(_this2.namespaceRegex, namespace);

          var parsedNamespacePath = _path2.default.parse(namespacePath);

          var namespaceOldPath = _path2.default.join(
          parsedNamespacePath.dir,
          parsedNamespacePath.name + '_old' + parsedNamespacePath.ext);


          var existingCatalog = _this2.getCatalog(namespacePath);
          var existingOldCatalog = _this2.getCatalog(namespaceOldPath);

          // merges existing translations with the new ones
          var _mergeHashes =




          (0, _helpers.mergeHashes)(
          existingCatalog,
          catalog[namespace],
          _this2.options.keepRemoved),newCatalog = _mergeHashes.new,oldKeys = _mergeHashes.old,mergeCount = _mergeHashes.mergeCount,oldCount = _mergeHashes.oldCount;


          // restore old translations
          var _mergeHashes2 = (0, _helpers.mergeHashes)(
          existingOldCatalog,
          newCatalog),oldCatalog = _mergeHashes2.old,restoreCount = _mergeHashes2.mergeCount;


          // backup unused translations
          (0, _helpers.transferValues)(oldKeys, oldCatalog);

          if (_this2.options.verbose) {
            console.log('[' + locale + '] ' + namespace + '\n');
            console.log('Unique keys: ' +
            uniqueCount + ' (' + countWithPlurals + ' with plurals)');

            var addCount = countWithPlurals - mergeCount;
            console.log('Added keys: ' + addCount);
            console.log('Restored keys: ' + restoreCount);
            if (_this2.options.keepRemoved) {
              console.log('Unreferenced keys: ' + oldCount);
            } else {
              console.log('Removed keys: ' + oldCount);
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
        }};var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {for (var _iterator2 = this.options.locales[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var locale = _step2.value;_loop(locale);
        }} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2.return) {_iterator2.return();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}

      if (this.options.failOnWarnings && this.parserHadWarnings) {
        this.emit(
        'error',
        'Warnings were triggered and failOnWarnings option is enabled. Exiting...');

        process.exit(1);
      }

      done();
    } }, { key: 'addEntry', value: function addEntry(

    entry) {
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
    } }, { key: 'getCatalog', value: function getCatalog(

    path) {
      try {
        var content = void 0;
        if (path.endsWith('yml')) {
          content = _jsYaml2.default.safeLoad(_fs2.default.readFileSync(path).toString());
        } else {
          content = JSON.parse(_fs2.default.readFileSync(path));
        }
        return content;
      } catch (error) {
        if (error.code !== 'ENOENT') {
          this.emit('error', error);
        }
      }

      return null;
    } }, { key: 'pushFile', value: function pushFile(

    path, contents) {
      var text = void 0;
      if (path.endsWith('yml')) {
        text = _jsYaml2.default.safeDump(contents, {
          indent: this.options.indentation });

      } else {
        text = JSON.stringify(contents, null, this.options.indentation) + '\n';
      }

      if (this.options.lineEnding === 'auto') {
        text = _eol2.default.auto(text);
      } else if (
      this.options.lineEnding === '\r\n' ||
      this.options.lineEnding === 'crlf')
      {
        text = _eol2.default.crlf(text);
      } else if (
      this.options.lineEnding === '\r' ||
      this.options.lineEnding === 'cr')
      {
        text = _eol2.default.cr(text);
      } else {
        // Defaults to LF, aka \n
        text = _eol2.default.lf(text);
      }

      var file = new _vinyl2.default({
        path: path,
        contents: Buffer.from(text) });

      this.push(file);
    } }]);return i18nTransform;}(_stream.Transform);exports.default = i18nTransform;module.exports = exports['default'];