'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _baseLexer = require('./base-lexer');var _baseLexer2 = _interopRequireDefault(_baseLexer);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var

HTMLLexer = function (_BaseLexer) {_inherits(HTMLLexer, _BaseLexer);

  function HTMLLexer() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, HTMLLexer);var _this = _possibleConstructorReturn(this, (HTMLLexer.__proto__ || Object.getPrototypeOf(HTMLLexer)).call(this,
    options));

    _this.attr = options.attr || 'data-i18n';
    _this.optionAttr = options.optionAttr || 'data-i18n-options';

    _this.createAttributeRegex();
    _this.createOptionAttributeRegex();return _this;
  }

  // TODO rewrite to support the BaseLexer.extract()
  _createClass(HTMLLexer, [{ key: 'extract', value: function extract(content) {var _this2 = this;
      var matches = void 0;
      var regex = new RegExp(
      '<([A-Z][A-Z0-9]*)([^>]*\\s' + this.attr + '[^>]*)>(?:(.*?)<\\/\\1>)?',
      'gi');var _loop = function _loop() {



        var attrs = _this2.parseAttributes(matches[2]);

        // the attribute can hold multiple keys
        var keys = attrs.keys.split(';');
        keys.forEach(function (key) {
          // remove any leading [] in the key
          key = key.replace(/^\[[a-zA-Z0-9_-]*\]/, '');

          // if empty grab innerHTML from regex
          key = key || matches[3];

          if (key) {
            _this2.keys.push(_extends({}, attrs.options, { key: key }));
          }
        });};while (matches = regex.exec(content)) {_loop();

      }

      return this.keys;
    } }, { key: 'createAttributeRegex', value: function createAttributeRegex()

    {
      var pattern = '(?:' + this.attr + ')(?:\\s*=\\s*(' + _baseLexer2.default.stringPattern + ')|$|\\s)';
      this.attrRegex = new RegExp(pattern, 'i');
      return this.attrRegex;
    } }, { key: 'createOptionAttributeRegex', value: function createOptionAttributeRegex()

    {
      var pattern = '(?:' + this.optionAttr + ')(?:\\s*=\\s*(' + _baseLexer2.default.stringPattern + '))?';
      this.optionAttrRegex = new RegExp(pattern, 'i');
      return this.optionAttrRegex;
    } }, { key: 'parseAttributes', value: function parseAttributes(

    args) {
      var result = { keys: '', options: {} };
      this.attrRegex.lastIndex = 0;
      var keysMatch = this.attrRegex.exec(args);
      if (keysMatch && keysMatch[1]) {
        result.keys = keysMatch[1].slice(1, -1);
      }

      this.optionAttrRegex.lastIndex = 0;
      var optionsMatch = this.optionAttrRegex.exec(args);
      if (optionsMatch && optionsMatch[1]) {
        try {
          result.options = JSON.parse(optionsMatch[1].slice(1, -1));
        } finally
        {}
      }

      return result;
    } }]);return HTMLLexer;}(_baseLexer2.default);exports.default = HTMLLexer;