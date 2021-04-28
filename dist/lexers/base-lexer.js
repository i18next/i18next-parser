"use strict";function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _events = _interopRequireDefault(require("events"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);}var

BaseLexer = /*#__PURE__*/function (_EventEmitter) {_inherits(BaseLexer, _EventEmitter);var _super = _createSuper(BaseLexer);
  function BaseLexer() {var _this;var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, BaseLexer);
    _this = _super.call(this);
    _this.keys = [];
    _this.functions = options.functions || ['t'];return _this;
  }_createClass(BaseLexer, [{ key: "validateString", value:

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

    } }]);return BaseLexer;}(_events["default"]);exports["default"] = BaseLexer;module.exports = exports.default;