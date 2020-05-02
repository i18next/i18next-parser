'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _events = require('events');var _events2 = _interopRequireDefault(_events);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var

BaseLexer = function (_EventEmitter) {_inherits(BaseLexer, _EventEmitter);
  function BaseLexer() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, BaseLexer);var _this = _possibleConstructorReturn(this, (BaseLexer.__proto__ || Object.getPrototypeOf(BaseLexer)).call(this));

    _this.keys = [];
    _this.functions = options.functions || ['t'];return _this;
  }_createClass(BaseLexer, [{ key: 'validateString', value: function validateString(

    string) {
      var regex = new RegExp('^' + BaseLexer.stringPattern + '$', 'i');
      return regex.test(string);
    } }, { key: 'functionPattern', value: function functionPattern()

    {
      return '(?:' + this.functions.join('|').replace('.', '\\.') + ')';
    } }], [{ key: 'singleQuotePattern', get: function get()

    {
      return "'(?:[^'].*?[^\\\\])?'";
    } }, { key: 'doubleQuotePattern', get: function get()

    {
      return '"(?:[^"].*?[^\\\\])?"';
    } }, { key: 'backQuotePattern', get: function get()

    {
      return '`(?:[^`].*?[^\\\\])?`';
    } }, { key: 'variablePattern', get: function get()

    {
      return '(?:[A-Z0-9_.-]+)';
    } }, { key: 'stringPattern', get: function get()

    {
      return (
        '(?:' +
        [BaseLexer.singleQuotePattern, BaseLexer.doubleQuotePattern].join('|') +
        ')');

    } }, { key: 'stringOrVariablePattern', get: function get()

    {
      return (
        '(?:' +
        [
        BaseLexer.singleQuotePattern,
        BaseLexer.doubleQuotePattern,
        BaseLexer.variablePattern].
        join('|') +
        ')');

    } }]);return BaseLexer;}(_events2.default);exports.default = BaseLexer;module.exports = exports['default'];