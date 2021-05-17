"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));var _baseLexer = _interopRequireDefault(require("./base-lexer"));
var _cheerio = _interopRequireDefault(require("cheerio"));function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {(0, _defineProperty2["default"])(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _createForOfIteratorHelper(o, allowArrayLike) {var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {if (i >= o.length) return { done: true };return { done: false, value: o[i++] };}, e: function e(_e) {throw _e;}, f: F };}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion = true,didErr = false,err;return { s: function s() {it = it.call(o);}, n: function n() {var step = it.next();normalCompletion = step.done;return step;}, e: function e(_e2) {didErr = true;err = _e2;}, f: function f() {try {if (!normalCompletion && it["return"] != null) it["return"]();} finally {if (didErr) throw err;}} };}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = (0, _getPrototypeOf2["default"])(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return (0, _possibleConstructorReturn2["default"])(this, result);};}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}var

HTMLLexer = /*#__PURE__*/function (_BaseLexer) {(0, _inherits2["default"])(HTMLLexer, _BaseLexer);var _super = _createSuper(HTMLLexer);
  function HTMLLexer() {var _this;var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};(0, _classCallCheck2["default"])(this, HTMLLexer);
    _this = _super.call(this, options);

    _this.attr = options.attr || 'data-i18n';
    _this.optionAttr = options.optionAttr || 'data-i18n-options';return _this;
  }(0, _createClass2["default"])(HTMLLexer, [{ key: "extract", value:

    function extract(content) {var _this2 = this;
      var that = this;
      var $ = _cheerio["default"].load(content);
      $("[".concat(that.attr, "]")).each(function (index, node) {
        var $node = _cheerio["default"].load(node);

        // the attribute can hold multiple keys
        var keys = node.attribs[that.attr].split(';');
        var options = node.attribs[that.optionAttr];

        if (options) {
          try {
            options = JSON.parse(options);
          } finally {
          }
        }var _iterator = _createForOfIteratorHelper(

        keys),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var key = _step.value;
            // remove any leading [] in the key
            key = key.replace(/^\[[a-zA-Z0-9_-]*\]/, '');

            // if empty grab innerHTML from regex
            key = key || $node.text();

            if (key) {
              _this2.keys.push(_objectSpread(_objectSpread({}, options), {}, { key: key }));
            }
          }} catch (err) {_iterator.e(err);} finally {_iterator.f();}
      });

      return this.keys;
    } }]);return HTMLLexer;}(_baseLexer["default"]);exports["default"] = HTMLLexer;