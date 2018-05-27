'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _baseLexer = require('./base-lexer');var _baseLexer2 = _interopRequireDefault(_baseLexer);
var _cheerio = require('cheerio');var _cheerio2 = _interopRequireDefault(_cheerio);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var

HTMLLexer = function (_BaseLexer) {_inherits(HTMLLexer, _BaseLexer);
  function HTMLLexer() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, HTMLLexer);var _this = _possibleConstructorReturn(this, (HTMLLexer.__proto__ || Object.getPrototypeOf(HTMLLexer)).call(this,
    options));

    _this.attr = options.attr || 'data-i18n';
    _this.optionAttr = options.optionAttr || 'data-i18n-options';return _this;
  }_createClass(HTMLLexer, [{ key: 'extract', value: function extract(

    content) {var _this2 = this;
      var that = this;
      var $ = _cheerio2.default.load(content);
      $('[' + that.attr + ']').each(function (index, node) {
        var $node = _cheerio2.default.load(node);

        // the attribute can hold multiple keys
        var keys = node.attribs[that.attr].split(';');
        var options = node.attribs[that.optionAttr];

        if (options) {
          try {
            options = JSON.parse(options);
          } finally
          {}
        }

        keys.forEach(function (key) {
          // remove any leading [] in the key
          key = key.replace(/^\[[a-zA-Z0-9_-]*\]/, '');

          // if empty grab innerHTML from regex
          key = key || $node.text();

          if (key) {
            _this2.keys.push(_extends({}, options, { key: key }));
          }
        });
      });

      return this.keys;
    } }]);return HTMLLexer;}(_baseLexer2.default);exports.default = HTMLLexer;module.exports = exports['default'];