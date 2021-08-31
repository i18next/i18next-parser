"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));var _baseLexer = _interopRequireDefault(require("./base-lexer"));function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {(0, _defineProperty2["default"])(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = (0, _getPrototypeOf2["default"])(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return (0, _possibleConstructorReturn2["default"])(this, result);};}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}var

HandlebarsLexer = /*#__PURE__*/function (_BaseLexer) {(0, _inherits2["default"])(HandlebarsLexer, _BaseLexer);var _super = _createSuper(HandlebarsLexer);
  function HandlebarsLexer() {var _this;var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};(0, _classCallCheck2["default"])(this, HandlebarsLexer);
    _this = _super.call(this, options);

    _this.functions = options.functions || ['t'];

    _this.createFunctionRegex();
    _this.createArgumentsRegex();return _this;
  }(0, _createClass2["default"])(HandlebarsLexer, [{ key: "extract", value:

    function extract(content) {
      var matches;

      while (matches = this.functionRegex.exec(content)) {
        var args = this.parseArguments(matches[1] || matches[2]);
        this.populateKeysFromArguments(args);
      }

      return this.keys;
    } }, { key: "parseArguments", value:

    function parseArguments(args) {
      var matches;
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
    } }, { key: "populateKeysFromArguments", value:

    function populateKeysFromArguments(args) {
      var firstArgument = args.arguments[0];
      var secondArgument = args.arguments[1];
      var isKeyString = this.validateString(firstArgument);
      var isDefaultValueString = this.validateString(secondArgument);

      if (!isKeyString) {
        this.emit('warning', "Key is not a string literal: ".concat(firstArgument));
      } else {
        var result = _objectSpread(_objectSpread({},
        args.options), {}, {
          key: firstArgument.slice(1, -1) });

        if (isDefaultValueString) {
          result.defaultValue = secondArgument.slice(1, -1);
        }
        this.keys.push(result);
      }
    } }, { key: "createFunctionRegex", value:

    function createFunctionRegex() {
      var functionPattern = this.functionPattern();
      var curlyPattern = '(?:{{)' + functionPattern + '\\s+(.*?)(?:}})';
      var parenthesisPattern = '(?:\\()' + functionPattern + '\\s+(.*)(?:\\))';
      var pattern = curlyPattern + '|' + parenthesisPattern;
      this.functionRegex = new RegExp(pattern, 'gi');
      return this.functionRegex;
    } }, { key: "createArgumentsRegex", value:

    function createArgumentsRegex() {
      var pattern =
      '(?:\\s+|^)' +
      '(' +
      '(?:' +
      _baseLexer["default"].variablePattern +
      '(?:=' +
      _baseLexer["default"].stringOrVariablePattern +
      ')?' +
      ')' +
      '|' +
      _baseLexer["default"].stringPattern +
      ')';
      this.argumentsRegex = new RegExp(pattern, 'gi');
      return this.argumentsRegex;
    } }]);return HandlebarsLexer;}(_baseLexer["default"]);exports["default"] = HandlebarsLexer;