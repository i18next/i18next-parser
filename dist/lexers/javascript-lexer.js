'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _baseLexer = require('./base-lexer');var _baseLexer2 = _interopRequireDefault(_baseLexer);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var

JavascriptLexer = function (_BaseLexer) {_inherits(JavascriptLexer, _BaseLexer);
  function JavascriptLexer() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, JavascriptLexer);var _this = _possibleConstructorReturn(this, (JavascriptLexer.__proto__ || Object.getPrototypeOf(JavascriptLexer)).call(this,
    options));

    _this.functions = options.functions || ['t'];

    _this.createFunctionRegex();
    _this.createArgumentsRegex();
    _this.createHashRegex();return _this;
  }_createClass(JavascriptLexer, [{ key: 'extract', value: function extract(

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

        if (arg.startsWith('{')) {
          var optionMatches = void 0;
          while (optionMatches = this.hashRegex.exec(args)) {
            var key = optionMatches[2];
            var value = optionMatches[3];
            if (this.validateString(value)) {
              result.options[key] = value.slice(1, -1);
            }
          }
        } else
        {
          arg = this.concatenateString(arg);
        }
        result.arguments.push(arg);
      }
      return result;
    } }, { key: 'concatenateString', value: function concatenateString(

    string) {var _this2 = this;
      string = string.trim();
      var matches = void 0;
      var containsVariable = false;
      var parts = [];
      var quotationMark = string.charAt(0) === '"' ? '"' : "'";

      var regex = new RegExp(JavascriptLexer.concatenatedSegmentPattern, 'gi');
      while (matches = regex.exec(string)) {
        var match = matches[0].trim();
        if (match !== '+') {
          parts.push(match);
        }
      }

      var result = parts.reduce(function (concatenatedString, x) {
        x = x && x.trim();
        if (_this2.validateString(x)) {
          concatenatedString += x.slice(1, -1);
        } else
        {
          containsVariable = true;
        }
        return concatenatedString;
      }, '');
      if (!result || containsVariable) {
        return string;
      } else
      {
        return quotationMark + result + quotationMark;
      }
    } }, { key: 'createFunctionRegex', value: function createFunctionRegex()



































    {
      var pattern =
      '(?:\\W|^)' +
      this.functionPattern() + '\\s*\\(\\s*' +
      JavascriptLexer.stringOrVariableOrHashPattern +
      '\\s*\\)';

      this.functionRegex = new RegExp(pattern, 'gi');
      return this.functionRegex;
    } }, { key: 'createArgumentsRegex', value: function createArgumentsRegex()

    {
      var pattern =
      '(' +
      [
      JavascriptLexer.concatenatedArgumentPattern,
      JavascriptLexer.hashPattern].
      join('|') +
      ')' +
      '(?:\\s*,\\s*)?';

      this.argumentsRegex = new RegExp(pattern, 'gi');
      return this.argumentsRegex;
    } }, { key: 'createHashRegex', value: function createHashRegex()

    {
      var pattern =
      '(?:(\'|")?(' +
      ['context', 'defaultValue'].join('|') +
      ')\\1)' +
      '(?:\\s*:\\s*)' +
      '(' + _baseLexer2.default.stringPattern + ')';

      this.hashRegex = new RegExp(pattern, 'gi');
      return this.hashRegex;
    } }], [{ key: 'concatenatedSegmentPattern', get: function get() {return [_baseLexer2.default.singleQuotePattern, _baseLexer2.default.doubleQuotePattern, _baseLexer2.default.backQuotePattern, _baseLexer2.default.variablePattern, '(?:\\s*\\+\\s*)' // support for concatenation via +
      ].join('|');} }, { key: 'concatenatedArgumentPattern', get: function get() {return '(' + '(?:' + JavascriptLexer.concatenatedSegmentPattern + ')+' + ')';} }, { key: 'hashPattern', get: function get() {return '(\\{.*\\})';} }, { key: 'stringOrVariableOrHashPattern', get: function get() {return '(' + '(' + '(?:' + [JavascriptLexer.concatenatedArgumentPattern, JavascriptLexer.hashPattern].join('|') + ')' + '(?:\\s*,\\s*)?' + ')+' + ')';} }]);return JavascriptLexer;}(_baseLexer2.default);exports.default = JavascriptLexer;module.exports = exports['default'];