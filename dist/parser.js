'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _events = require('events');var _events2 = _interopRequireDefault(_events);
var _handlebarsLexer = require('./lexers/handlebars-lexer');var _handlebarsLexer2 = _interopRequireDefault(_handlebarsLexer);
var _htmlLexer = require('./lexers/html-lexer');var _htmlLexer2 = _interopRequireDefault(_htmlLexer);
var _javascriptLexer = require('./lexers/javascript-lexer');var _javascriptLexer2 = _interopRequireDefault(_javascriptLexer);
var _jsxLexer = require('./lexers/jsx-lexer');var _jsxLexer2 = _interopRequireDefault(_jsxLexer);
var _path = require('path');var _path2 = _interopRequireDefault(_path);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}

var lexers = {
  hbs: ['HandlebarsLexer'],
  handlebars: ['HandlebarsLexer'],

  htm: ['HTMLLexer'],
  html: ['HTMLLexer'],

  js: ['JavascriptLexer'],
  jsx: ['JavascriptLexer', 'JsxLexer'],
  mjs: ['JavascriptLexer'],

  default: ['JavascriptLexer'] };


var lexersMap = {
  HandlebarsLexer: _handlebarsLexer2.default,
  HTMLLexer: _htmlLexer2.default,
  JavascriptLexer: _javascriptLexer2.default,
  JsxLexer: _jsxLexer2.default };var


Parser = function (_EventEmitter) {_inherits(Parser, _EventEmitter);
  function Parser() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, Parser);var _this = _possibleConstructorReturn(this, (Parser.__proto__ || Object.getPrototypeOf(Parser)).call(this,
    options));
    _this.options = options;

    if (options.reactNamespace) {
      lexers.js = lexers.jsx;
    }

    _this.lexers = _extends({}, lexers, options.lexers);return _this;
  }_createClass(Parser, [{ key: 'parse', value: function parse(

    content, extension) {var _this2 = this;
      var keys = [];
      var lexers = this.lexers[extension] || this.lexers.default;

      lexers.forEach(function (lexerConfig) {
        var lexerName = void 0;
        var lexerOptions = void 0;

        if (typeof lexerConfig === 'string') {
          lexerName = lexerConfig;
          lexerOptions = {};
        } else
        {
          lexerName = lexerConfig.lexer;
          lexerOptions = lexerConfig;
        }

        if (!lexersMap[lexerName]) {
          _this2.emit('error', new Error('Lexer \'' + lexerName + '\' does not exist'));
        }

        var Lexer = new lexersMap[lexerName](lexerOptions);
        Lexer.on('warning', function (warning) {return _this2.emit('warning', warning);});
        keys = keys.concat(Lexer.extract(content));
      });

      return keys;
    } }]);return Parser;}(_events2.default);exports.default = Parser;module.exports = exports['default'];