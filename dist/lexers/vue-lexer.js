'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _baseLexer = require('./base-lexer');var _baseLexer2 = _interopRequireDefault(_baseLexer);
var _javascriptLexer = require('./javascript-lexer.js');var _javascriptLexer2 = _interopRequireDefault(_javascriptLexer);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var

VueLexer = function (_BaseLexer) {_inherits(VueLexer, _BaseLexer);
  function VueLexer() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, VueLexer);var _this = _possibleConstructorReturn(this, (VueLexer.__proto__ || Object.getPrototypeOf(VueLexer)).call(this,
    options));

    _this.functions = options.functions || ['$t'];return _this;
  }_createClass(VueLexer, [{ key: 'extract', value: function extract(

    content, filename) {var _this2 = this;
      var keys = [];

      var Lexer = new _javascriptLexer2.default();
      Lexer.on('warning', function (warning) {return _this2.emit('warning', warning);});
      keys = keys.concat(Lexer.extract(content));

      var compiledTemplate = require('vue-template-compiler').compile(content).
      render;
      var Lexer2 = new _javascriptLexer2.default({ functions: this.functions });
      Lexer2.on('warning', function (warning) {return _this2.emit('warning', warning);});
      keys = keys.concat(Lexer2.extract(compiledTemplate));

      return keys;
    } }]);return VueLexer;}(_baseLexer2.default);exports.default = VueLexer;module.exports = exports['default'];