"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));var _events = _interopRequireDefault(require("events"));function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = (0, _getPrototypeOf2["default"])(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return (0, _possibleConstructorReturn2["default"])(this, result);};}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}var

BaseLexer = /*#__PURE__*/function (_EventEmitter) {(0, _inherits2["default"])(BaseLexer, _EventEmitter);var _super = _createSuper(BaseLexer);
  function BaseLexer() {var _this;var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};(0, _classCallCheck2["default"])(this, BaseLexer);
    _this = _super.call(this);
    _this.keys = [];
    _this.functions = options.functions || ['t'];return _this;
  }(0, _createClass2["default"])(BaseLexer, [{ key: "validateString", value:

    function validateString(string) {
      var regex = new RegExp('^' + BaseLexer.stringPattern + '$', 'i');
      return regex.test(string);
    } }, { key: "functionPattern", value:

    function functionPattern() {
      return '(?:' + this.functions.join('|').replace('.', '\\.') + ')';
    } }], [{ key: "singleQuotePattern", get:

    function get() {
      return "'(?:[^'].*?[^\\\\])?'";
    } }, { key: "doubleQuotePattern", get:

    function get() {
      return '"(?:[^"].*?[^\\\\])?"';
    } }, { key: "backQuotePattern", get:

    function get() {
      return '`(?:[^`].*?[^\\\\])?`';
    } }, { key: "variablePattern", get:

    function get() {
      return '(?:[A-Z0-9_.-]+)';
    } }, { key: "stringPattern", get:

    function get() {
      return (
        '(?:' +
        [BaseLexer.singleQuotePattern, BaseLexer.doubleQuotePattern].join('|') +
        ')');

    } }, { key: "stringOrVariablePattern", get:

    function get() {
      return (
        '(?:' +
        [
        BaseLexer.singleQuotePattern,
        BaseLexer.doubleQuotePattern,
        BaseLexer.variablePattern].
        join('|') +
        ')');

    } }]);return BaseLexer;}(_events["default"]);exports["default"] = BaseLexer;