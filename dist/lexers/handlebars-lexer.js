'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _baseLexer = require('./base-lexer');var _baseLexer2 = _interopRequireDefault(_baseLexer);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var

HandlebarsLexer = function (_BaseLexer) {_inherits(HandlebarsLexer, _BaseLexer);

  function HandlebarsLexer() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, HandlebarsLexer);var _this = _possibleConstructorReturn(this, (HandlebarsLexer.__proto__ || Object.getPrototypeOf(HandlebarsLexer)).call(this,
    options));

    _this.functions = options.functions || ['t'];

    _this.createFunctionRegex();
    _this.createArgumentsRegex();return _this;
  }_createClass(HandlebarsLexer, [{ key: 'extract', value: function extract(

    content) {
      var matches = void 0;

      while (matches = this.functionRegex.exec(content)) {
        var args = this.parseArguments(matches[1] || matches[2]);
        this.populateKeysFromArguments(args);
      }

      return this.keys;
    } }, { key: 'parseArguments', value: function parseArguments(

    args) {
      var matches = void 0;
      var result = {
        arguments: [],
        options: {} };

      while (matches = this.argumentsRegex.exec(args)) {
        var arg = matches[1];
        var parts = arg.split('=');
        result.arguments.push(arg);
        if (parts.length === 2 && this.validateString(parts[1])) {
          result.options[parts[0]] = parts[1].slice(1, -1);
        }
      }
      return result;
    } }, { key: 'createFunctionRegex', value: function createFunctionRegex()

    {
      var functionPattern = this.functionPattern();
      var curlyPattern = '(?:{{)' + functionPattern + '\\s+(.*)(?:}})';
      var parenthesisPattern = '(?:\\()' + functionPattern + '\\s+(.*)(?:\\))';
      var pattern = curlyPattern + '|' + parenthesisPattern;
      this.functionRegex = new RegExp(pattern, 'gi');
      return this.functionRegex;
    } }, { key: 'createArgumentsRegex', value: function createArgumentsRegex()

    {
      var pattern =
      '(?:\\s+|^)' +
      '(' +
      '(?:' +
      _baseLexer2.default.variablePattern +
      '(?:=' + _baseLexer2.default.stringOrVariablePattern + ')?' +
      ')' +
      '|' +
      _baseLexer2.default.stringPattern +
      ')';
      this.argumentsRegex = new RegExp(pattern, 'gi');
      return this.argumentsRegex;
    } }]);return HandlebarsLexer;}(_baseLexer2.default);exports.default = HandlebarsLexer;