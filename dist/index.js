'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _helpers = require('./helpers');
var _stream = require('stream');
var _lodash = require('lodash');var _lodash2 = _interopRequireDefault(_lodash);
var _eol = require('eol');var _eol2 = _interopRequireDefault(_eol);
var _fs = require('fs');var _fs2 = _interopRequireDefault(_fs);
var _parser = require('./parser');var _parser2 = _interopRequireDefault(_parser);
var _path = require('path');var _path2 = _interopRequireDefault(_path);
var _vinyl = require('vinyl');var _vinyl2 = _interopRequireDefault(_vinyl);
var _yamljs = require('yamljs');var _yamljs2 = _interopRequireDefault(_yamljs);
var _baseLexer = require('./lexers/base-lexer');var _baseLexer2 = _interopRequireDefault(_baseLexer);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var

i18nTransform = function (_Transform) {_inherits(i18nTransform, _Transform);
  function i18nTransform() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, i18nTransform);
    options.objectMode = true;var _this = _possibleConstructorReturn(this, (i18nTransform.__proto__ || Object.getPrototypeOf(i18nTransform)).call(this,
    options));

    _this.defaults = {
      contextSeparator: '_',
      createOldCatalogs: true,
      defaultNamespace: 'translation',
      defaultValue: '',
      extension: '.json',
      filename: '$NAMESPACE',
      indentation: 2,
      keepRemoved: false,
      keySeparator: '.',
      lexers: {},
      lineEnding: 'auto',
      locales: ['en', 'fr'],
      namespaceSeparator: ':',
      output: 'locales',
      reactNamespace: false,
      sort: false };


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

    file, encoding, done) {var _this2 = this;
      var content = void 0;
      if (file.isBuffer()) {
        content = file.contents.toString('utf8');
      } else
      {
        content = _fs2.default.readFileSync(file.path, encoding);
      }

      this.emit('reading', file);

      var extension = _path2.default.extname(file.path).substring(1);
      var entries = this.parser.parse(content, extension);

      entries.forEach(function (entry) {
        var key = entry.key;
        var parts = key.split(_this2.options.namespaceSeparator);

        // make sure we're not pulling a 'namespace' out of a default value
        if (parts.length > 1 && key !== entry.defaultValue) {
          entry.namespace = parts.shift();
        } else
        if (extension === 'jsx' || _this2.options.reactNamespace) {
          entry.namespace = _this2.grabReactNamespace(content);
        }
        entry.namespace = entry.namespace || _this2.options.defaultNamespace;

        key = parts.join(_this2.options.namespaceSeparator);
        key = key.replace(/\\('|"|`)/g, '$1');
        key = key.replace(/\\n/g, '\n');
        key = key.replace(/\\r/g, '\r');
        key = key.replace(/\\t/g, '\t');
        key = key.replace(/\\\\/g, '\\');
        entry.key = entry.namespace + _this2.options.keySeparator + key;

        _this2.addEntry(entry);
      });

      done();
    } }, { key: '_flush', value: function _flush(

    done) {var _this3 = this;
      var catalog = {};

      if (this.options.sort) {
        this.entries = this.entries.sort(function (a, b) {return a.key.localeCompare(b.key);});
      }

      this.entries.forEach(function (entry) {
        catalog = (0, _helpers.dotPathToHash)(
        entry,
        catalog,
        {
          separator: _this3.options.keySeparator,
          value: _this3.options.defaultValue });


      });

      this.options.locales.forEach(function (locale) {
        var outputPath = _path2.default.resolve(_this3.options.output, locale);

        Object.keys(catalog).forEach(function (namespace) {
          var filename = _this3.options.filename;
          filename = filename.replace(_this3.localeRegex, locale);
          filename = filename.replace(_this3.namespaceRegex, namespace);

          var extension = _this3.options.extension;
          extension = extension.replace(_this3.localeRegex, locale);
          extension = extension.replace(_this3.namespaceRegex, namespace);

          var oldFilename = filename + '_old' + extension;
          filename += extension;

          var namespacePath = _path2.default.resolve(outputPath, filename);
          var namespaceOldPath = _path2.default.resolve(outputPath, oldFilename);

          var newCatalog = void 0;
          var existingCatalog = _this3.getCatalog(namespacePath);
          var oldCatalog = _this3.getCatalog(namespaceOldPath);

          // merges existing translations with the new ones
          var _mergeHashes = (0, _helpers.mergeHashes)(
          existingCatalog,
          catalog[namespace],
          null,
          _this3.options.keepRemoved),newKeys = _mergeHashes.new,oldKeys = _mergeHashes.old;


          // restore old translations if the key is empty
          newCatalog = (0, _helpers.populateHash)(oldCatalog, newKeys);

          // add keys from the current catalog that are no longer used
          oldCatalog = _lodash2.default.extend(oldCatalog, oldKeys);

          // push files back to the stream
          _this3.pushFile(namespacePath, newCatalog);
          if (_this3.options.createOldCatalogs) {
            _this3.pushFile(namespaceOldPath, oldCatalog);
          }
        });
      });

      done();
    } }, { key: 'addEntry', value: function addEntry(

    entry) {
      var existing = this.entries.filter(function (x) {return x.key === entry.key;})[0];
      if (!existing) {
        this.entries.push(entry);
      } else
      {
        existing = _extends({}, existing, entry);
      }

      if (entry.context) {
        var contextEntry = Object.assign({}, entry);
        delete contextEntry.context;
        contextEntry.key += this.options.contextSeparator + entry.context;
        this.addEntry(contextEntry);
      }
    } }, { key: 'getCatalog', value: function getCatalog(

    path) {
      var content = void 0;
      try {
        content = JSON.parse(_fs2.default.readFileSync(path));
      }
      catch (error) {
        if (error.code !== 'ENOENT') {
          this.emit('error', error);
        }
        content = {};
      }
      return content;
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
      if (lineEnding === '\r\n' || lineEnding === 'crlf') {
        text = _eol2.default.crlf(text);
      } else
      if (lineEnding === '\r' || lineEnding === 'cr') {
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