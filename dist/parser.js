"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));var _path = _interopRequireDefault(require("path"));
var _events = _interopRequireDefault(require("events"));
var _handlebarsLexer = _interopRequireDefault(require("./lexers/handlebars-lexer"));
var _htmlLexer = _interopRequireDefault(require("./lexers/html-lexer"));
var _javascriptLexer = _interopRequireDefault(require("./lexers/javascript-lexer"));
var _jsxLexer = _interopRequireDefault(require("./lexers/jsx-lexer"));
var _vueLexer = _interopRequireDefault(require("./lexers/vue-lexer"));function _createForOfIteratorHelper(o, allowArrayLike) {var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {if (i >= o.length) return { done: true };return { done: false, value: o[i++] };}, e: function e(_e) {throw _e;}, f: F };}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion = true,didErr = false,err;return { s: function s() {it = it.call(o);}, n: function n() {var step = it.next();normalCompletion = step.done;return step;}, e: function e(_e2) {didErr = true;err = _e2;}, f: function f() {try {if (!normalCompletion && it["return"] != null) it["return"]();} finally {if (didErr) throw err;}} };}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {(0, _defineProperty2["default"])(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = (0, _getPrototypeOf2["default"])(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return (0, _possibleConstructorReturn2["default"])(this, result);};}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}

var lexers = {
  hbs: ['HandlebarsLexer'],
  handlebars: ['HandlebarsLexer'],

  htm: ['HTMLLexer'],
  html: ['HTMLLexer'],

  mjs: ['JavascriptLexer'],
  js: ['JavascriptLexer'],
  ts: ['JavascriptLexer'],
  jsx: ['JsxLexer'],
  tsx: ['JsxLexer'],

  vue: ['VueLexer'],

  "default": ['JavascriptLexer'] };


var lexersMap = {
  HandlebarsLexer: _handlebarsLexer["default"],
  HTMLLexer: _htmlLexer["default"],
  JavascriptLexer: _javascriptLexer["default"],
  JsxLexer: _jsxLexer["default"],
  VueLexer: _vueLexer["default"] };var


Parser = /*#__PURE__*/function (_EventEmitter) {(0, _inherits2["default"])(Parser, _EventEmitter);var _super = _createSuper(Parser);
  function Parser() {var _this;var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};(0, _classCallCheck2["default"])(this, Parser);
    _this = _super.call(this, options);
    _this.options = options;
    _this.lexers = _objectSpread(_objectSpread({}, lexers), options.lexers);return _this;
  }(0, _createClass2["default"])(Parser, [{ key: "parse", value:

    function parse(content, filename) {var _this2 = this;
      var keys = [];
      var extension = _path["default"].extname(filename).substr(1);
      var lexers = this.lexers[extension] || this.lexers["default"];var _iterator = _createForOfIteratorHelper(

      lexers),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var lexerConfig = _step.value;
          var lexerName = void 0;
          var lexerOptions = void 0;

          if (
          typeof lexerConfig === 'string' ||
          typeof lexerConfig === 'function')
          {
            lexerName = lexerConfig;
            lexerOptions = {};
          } else {
            lexerName = lexerConfig.lexer;
            lexerOptions = lexerConfig;
          }

          var Lexer = void 0;
          if (typeof lexerName === 'function') {
            Lexer = lexerName;
          } else {
            if (!lexersMap[lexerName]) {
              this.emit('error', new Error("Lexer '".concat(lexerName, "' does not exist")));
            }

            Lexer = lexersMap[lexerName];
          }

          var lexer = new Lexer(lexerOptions);
          lexer.on('warning', function (warning) {return _this2.emit('warning', warning);});
          keys = keys.concat(lexer.extract(content, filename));
        }} catch (err) {_iterator.e(err);} finally {_iterator.f();}

      return keys;
    } }]);return Parser;}(_events["default"]);exports["default"] = Parser;