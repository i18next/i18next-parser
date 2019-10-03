'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _helpers = require('./helpers');
var _stream = require('stream');
var _eol = require('eol');var _eol2 = _interopRequireDefault(_eol);
var _fs = require('fs');var _fs2 = _interopRequireDefault(_fs);
var _parser = require('./parser');var _parser2 = _interopRequireDefault(_parser);
var _path = require('path');var _path2 = _interopRequireDefault(_path);
var _vinyl = require('vinyl');var _vinyl2 = _interopRequireDefault(_vinyl);
var _yamljs = require('yamljs');var _yamljs2 = _interopRequireDefault(_yamljs);
var _baseLexer = require('./lexers/base-lexer');var _baseLexer2 = _interopRequireDefault(_baseLexer);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}

function warn() {var _console;for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}
  (_console = console).warn.apply(_console, ['\x1b[33m%s\x1b[0m'].concat(args));
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
      reactNamespace: false,
      sort: false,
      useKeysAsDefaultValue: false,
      verbose: false };


    _this.options = _extends({}, _this.defaults, options);
    if (_this.options.keySeparator === false) {
      _this.options.keySeparator = '__!NO_KEY_SEPARATOR!__';
    }
    if (_this.options.namespaceSeparator === false) {
      _this.options.namespaceSeparator = '__!NO_NAMESPACE_SEPARATOR!__';
    }
    _this.entries = [];

    _this.parser = new _parser2.default(_this.options);
    _this.parser.on('error', function (error) {return _this.emit('error', error);});
    _this.parser.on('warning', function (warning) {return _this.emit('warning', warning);});

    _this.localeRegex = /\$LOCALE/g;
    _this.namespaceRegex = /\$NAMESPACE/g;return _this;
  }_createClass(i18nTransform, [{ key: '_transform', value: function _transform(

    file, encoding, done) {
      var content = void 0;
      if (file.isBuffer()) {
        content = file.contents.toString('utf8');
      } else
      {
        content = _fs2.default.readFileSync(file.path, encoding);
      }

      this.emit('reading', file);
      if (this.options.verbose) {
        console.log('Parsing ' + file.path);
      }

      var extension = _path2.default.extname(file.path).substring(1);
      var entries = this.parser.parse(content, extension);var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {

        for (var _iterator = entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var entry = _step.value;
          var key = entry.key;
          var parts = key.split(this.options.namespaceSeparator);

          // make sure we're not pulling a 'namespace' out of a default value
          if (parts.length > 1 && key !== entry.defaultValue) {
            entry.namespace = parts.shift();
          } else
          if (extension === 'jsx' || this.options.reactNamespace) {
            entry.namespace = this.grabReactNamespace(content);
          }
          entry.namespace = entry.namespace || this.options.defaultNamespace;

          key = parts.join(this.options.namespaceSeparator);
          key = key.replace(/\\('|"|`)/g, '$1');
          key = key.replace(/\\n/g, '\n');
          key = key.replace(/\\r/g, '\r');
          key = key.replace(/\\t/g, '\t');
          key = key.replace(/\\\\/g, '\\');
          entry.key = entry.namespace + this.options.keySeparator + key;

          this.addEntry(entry);
        }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator.return) {_iterator.return();}} finally {if (_didIteratorError) {throw _iteratorError;}}}

      done();
    } }, { key: '_flush', value: function _flush(

    done) {
      var catalog = {};

      if (this.options.sort) {
        this.entries = this.entries.sort(function (a, b) {return a.key.localeCompare(b.key);});
      }

      var uniqueCount = this.entries.length;var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {
        for (var _iterator2 = this.entries[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var entry = _step2.value;var _dotPathToHash =
          (0, _helpers.dotPathToHash)(
          entry,
          catalog,
          {
            separator: this.options.keySeparator,
            value: this.options.defaultValue,
            useKeysAsDefaultValue: this.options.useKeysAsDefaultValue }),duplicate = _dotPathToHash.duplicate,conflict = _dotPathToHash.conflict;


          if (duplicate) {
            uniqueCount -= 1;
            if (conflict) {
              var warning = 'Found same keys with different values: ' + entry.key;
              this.emit('warning', warning);
              if (this.options.verbose) {
                warn(warning);
              }
            }
          }
        }} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2.return) {_iterator2.return();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}
      if (this.options.verbose) {
        console.log('\nParsed keys: ' + uniqueCount + '\n');
      }var _iteratorNormalCompletion3 = true;var _didIteratorError3 = false;var _iteratorError3 = undefined;try {

        for (var _iterator3 = this.options.locales[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {var locale = _step3.value;
          var outputPath = _path2.default.resolve(this.options.output);

          for (var namespace in catalog) {
            var namespacePath = outputPath;
            namespacePath = namespacePath.replace(this.localeRegex, locale);
            namespacePath = namespacePath.replace(this.namespaceRegex, namespace);

            var parsedNamespacePath = _path2.default.parse(namespacePath);

            var namespaceOldPath = _path2.default.join(parsedNamespacePath.dir, parsedNamespacePath.name + '_old' + parsedNamespacePath.ext);

            var existingCatalog = this.getCatalog(namespacePath);
            var existingOldCatalog = this.getCatalog(namespaceOldPath);

            // merges existing translations with the new ones
            var _mergeHashes =
            (0, _helpers.mergeHashes)(
            existingCatalog,
            catalog[namespace],
            this.options.keepRemoved),newCatalog = _mergeHashes.new,oldKeys = _mergeHashes.old,mergeCount = _mergeHashes.mergeCount,oldCount = _mergeHashes.oldCount;


            // restore old translations
            var _mergeHashes2 = (0, _helpers.mergeHashes)(existingOldCatalog, newCatalog),oldCatalog = _mergeHashes2.old,restoreCount = _mergeHashes2.mergeCount;

            // backup unused translations
            (0, _helpers.transferValues)(oldKeys, oldCatalog);

            if (this.options.verbose) {
              console.log('[' + locale + '] ' + namespace + '\n');
              var addCount = uniqueCount - mergeCount;
              console.log('Added keys: ' + addCount);
              console.log('Restored keys: ' + restoreCount);
              if (this.options.keepRemoved) {
                console.log('Unreferenced keys: ' + oldCount);
              } else {
                console.log('Removed keys: ' + oldCount);
              }
              console.log();
            }

            // push files back to the stream
            this.pushFile(namespacePath, newCatalog);
            if (
            this.options.createOldCatalogs && (
            Object.keys(oldCatalog).length || existingOldCatalog))
            {
              this.pushFile(namespaceOldPath, oldCatalog);
            }
          }
        }} catch (err) {_didIteratorError3 = true;_iteratorError3 = err;} finally {try {if (!_iteratorNormalCompletion3 && _iterator3.return) {_iterator3.return();}} finally {if (_didIteratorError3) {throw _iteratorError3;}}}

      done();
    } }, { key: 'addEntry', value: function addEntry(

    entry) {
      if (entry.context) {
        var contextEntry = Object.assign({}, entry);
        delete contextEntry.context;
        contextEntry.key += this.options.contextSeparator + entry.context;
        this.entries.push(contextEntry);
        // this.addEntry(contextEntry)
      } else
      {
        this.entries.push(entry);
      }
    } }, { key: 'getCatalog', value: function getCatalog(

    path) {
      try {
        var content = void 0;
        if (path.endsWith('yml')) {
          content = _yamljs2.default.parse(_fs2.default.readFileSync(path).toString());
        } else
        {
          content = JSON.parse(_fs2.default.readFileSync(path));
        }
        return content;
      }
      catch (error) {
        if (error.code !== 'ENOENT') {
          this.emit('error', error);
        }
      }

      return null;
    } }, { key: 'pushFile', value: function pushFile(

    path, contents) {
      var text = void 0;
      if (path.endsWith('yml')) {
        text = _yamljs2.default.stringify(contents, null, this.options.indentation);
      } else
      {
        text = JSON.stringify(contents, null, this.options.indentation) + '\n';
      }

      if (this.options.lineEnding === 'auto') {
        text = _eol2.default.auto(text);
      } else
      if (this.options.lineEnding === '\r\n' || this.options.lineEnding === 'crlf') {
        text = _eol2.default.crlf(text);
      } else
      if (this.options.lineEnding === '\r' || this.options.lineEnding === 'cr') {
        text = _eol2.default.cr(text);
      } else
      {
        // Defaults to LF, aka \n
        text = _eol2.default.lf(text);
      }

      var file = new _vinyl2.default({
        path: path,
        contents: Buffer.from(text) });

      this.push(file);
    } }, { key: 'grabReactNamespace', value: function grabReactNamespace(

    content) {
      var reactTranslateRegex = new RegExp(
      'translate\\((?:\\s*\\[?\\s*)(' + _baseLexer2.default.stringPattern + ')');

      var translateMatches = content.match(reactTranslateRegex);
      if (translateMatches) {
        return translateMatches[1].slice(1, -1);
      }
    } }]);return i18nTransform;}(_stream.Transform);exports.default = i18nTransform;module.exports = exports['default'];