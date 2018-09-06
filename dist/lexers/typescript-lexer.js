'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _get = function get(object, property, receiver) {if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {var parent = Object.getPrototypeOf(object);if (parent === null) {return undefined;} else {return get(parent, property, receiver);}} else if ("value" in desc) {return desc.value;} else {var getter = desc.get;if (getter === undefined) {return undefined;}return getter.call(receiver);}};var _jsxLexer = require('./jsx-lexer');var _jsxLexer2 = _interopRequireDefault(_jsxLexer);
var _fs = require('fs');
var _path = require('path');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}

var loadedTs = null;
function loadTypeScript() {
  if (loadedTs) {
    return loadedTs;
  }

  try {
    loadedTs = require('typescript');
  } catch (e) {
    throw new ParsingError('You must install typescript to parse TypeScript files. Try running "yarn install typescript"');
  }

  return loadedTs;
}var

TypescriptLexer = function (_JsxLexer) {_inherits(TypescriptLexer, _JsxLexer);
  function TypescriptLexer() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, TypescriptLexer);var _this = _possibleConstructorReturn(this, (TypescriptLexer.__proto__ || Object.getPrototypeOf(TypescriptLexer)).call(this,
    options));
    _this.tsOptions = options.tsOptions;return _this;
  }_createClass(TypescriptLexer, [{ key: 'extract', value: function extract(

    content, extension) {
      var transpiled = loadTypeScript().transpileModule(content, {
        compilerOptions: _extends({},
        this.tsOptions, {
          jsx: 'Preserve' }) });



      return _get(TypescriptLexer.prototype.__proto__ || Object.getPrototypeOf(TypescriptLexer.prototype), 'extract', this).call(this, transpiled.outputText);
    } }]);return TypescriptLexer;}(_jsxLexer2.default);exports.default = TypescriptLexer;module.exports = exports['default'];