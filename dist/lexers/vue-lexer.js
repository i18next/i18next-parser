"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));var _baseLexer = _interopRequireDefault(require("./base-lexer"));
var _javascriptLexer = _interopRequireDefault(require("./javascript-lexer.js"));function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = (0, _getPrototypeOf2["default"])(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return (0, _possibleConstructorReturn2["default"])(this, result);};}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}var

VueLexer = /*#__PURE__*/function (_BaseLexer) {(0, _inherits2["default"])(VueLexer, _BaseLexer);var _super = _createSuper(VueLexer);
  function VueLexer() {var _this;var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};(0, _classCallCheck2["default"])(this, VueLexer);
    _this = _super.call(this, options);

    _this.functions = options.functions || ['$t'];return _this;
  }(0, _createClass2["default"])(VueLexer, [{ key: "extract", value:

    function extract(content, filename) {var _this2 = this;
      var keys = [];

      var Lexer = new _javascriptLexer["default"]();
      Lexer.on('warning', function (warning) {return _this2.emit('warning', warning);});
      keys = keys.concat(Lexer.extract(content));

      var compiledTemplate = require('vue-template-compiler').compile(content).
      render;
      var Lexer2 = new _javascriptLexer["default"]({ functions: this.functions });
      Lexer2.on('warning', function (warning) {return _this2.emit('warning', warning);});
      keys = keys.concat(Lexer2.extract(compiledTemplate));

      return keys;
    } }]);return VueLexer;}(_baseLexer["default"]);exports["default"] = VueLexer;