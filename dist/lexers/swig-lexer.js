'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _baseLexer = require('./base-lexer');var _baseLexer2 = _interopRequireDefault(_baseLexer);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var

SwigLexer = function (_BaseLexer) {_inherits(SwigLexer, _BaseLexer);
  function SwigLexer() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, SwigLexer);var _this = _possibleConstructorReturn(this, (SwigLexer.__proto__ || Object.getPrototypeOf(SwigLexer)).call(this,
    options));

    _this.functions = options.functions || ['t'];
    console.log(_this.functions);

    _this.createFunctionRegex();
    _this.createArgumentsRegex();return _this;
  }_createClass(SwigLexer, [{ key: 'extract', value: function extract(

    content) {
      var matches = void 0;

      while (matches = this.functionRegex.exec(content)) {
        console.log('function matches are ', matches[0]);
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
        console.log('arg matches: ', matches);
        var parts = arg.split('=');
        result.arguments.push(arg);
        if (parts.length === 2 && this.validateString(parts[1])) {
          result.options[parts[0]] = parts[1].slice(1, -1);
        }
      }
      return result;
    } }, { key: 'populateKeysFromArguments', value: function populateKeysFromArguments(

    args) {
      var firstArgument = args.arguments[0];
      var secondArgument = args.arguments[1];
      var isKeyString = this.validateString(firstArgument);
      var isDefaultValueString = this.validateString(secondArgument);

      if (!isKeyString) {
        this.emit('warning', 'Key is not a string literal: ' + firstArgument);
      } else
      {
        var result = _extends({},
        args.options, {
          key: firstArgument.slice(1, -1) });

        if (isDefaultValueString) {
          result.defaultValue = secondArgument.slice(1, -1);
        }
        this.keys.push(result);
      }
    } }, { key: 'createFunctionRegex', value: function createFunctionRegex()

    {
      var functionPattern = this.functionPattern();
      var curlyPattern = '(?:{{)' + '\\s*' + functionPattern + '\\s*(.*?)(?:}})';
      var parenthesisPattern = '(?:\\()' + functionPattern + '\\s+(.*)(?:\\))';
      var pattern = curlyPattern + '|' + parenthesisPattern;
      this.functionRegex = new RegExp(pattern, 'gi');
      return this.functionRegex;
    } }, { key: 'createArgumentsRegex', value: function createArgumentsRegex()


    {
      var pattern =
      '(?:\\s*|^)' + '\\(' +
      '(' +
      '(?:' +
      _baseLexer2.default.variablePattern +
      '(?:=' + _baseLexer2.default.stringOrVariablePattern + ')?' +
      '\\)' +
      ')' +
      '|' +
      _baseLexer2.default.stringPattern +
      ')?';
      console.log(pattern);
      this.argumentsRegex = new RegExp(pattern, 'gi');
      return this.argumentsRegex;
    } }]);return SwigLexer;}(_baseLexer2.default);exports.default = SwigLexer;module.exports = exports['default'];