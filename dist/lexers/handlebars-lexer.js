"use strict";function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _baseLexer = _interopRequireDefault(require("./base-lexer"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);}var

HandlebarsLexer = /*#__PURE__*/function (_BaseLexer) {_inherits(HandlebarsLexer, _BaseLexer);var _super = _createSuper(HandlebarsLexer);
  function HandlebarsLexer() {var _this;var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, HandlebarsLexer);
    _this = _super.call(this, options);

    _this.functions = options.functions || ['t'];

    _this.createFunctionRegex();
    _this.createArgumentsRegex();return _this;
  }_createClass(HandlebarsLexer, [{ key: "extract", value:

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
    } }]);return HandlebarsLexer;}(_baseLexer["default"]);exports["default"] = HandlebarsLexer;module.exports = exports.default;