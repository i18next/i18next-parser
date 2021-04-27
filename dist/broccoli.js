"use strict";function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _colors = _interopRequireDefault(require("colors"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _path = _interopRequireDefault(require("path"));
var _broccoliPlugin = _interopRequireDefault(require("broccoli-plugin"));
var _transform = _interopRequireDefault(require("../dist/transform"));
var _rsvp = _interopRequireDefault(require("rsvp"));
var _gulpSort = _interopRequireDefault(require("gulp-sort"));
var _vinylFs = _interopRequireDefault(require("vinyl-fs"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);}

var Promise = _rsvp["default"].Promise;var

i18nextParser = /*#__PURE__*/function (_Plugin) {_inherits(i18nextParser, _Plugin);var _super = _createSuper(i18nextParser);
  function i18nextParser(inputNodes) {var _this;var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};_classCallCheck(this, i18nextParser);
    _this = _super.apply(this, arguments);
    _this.options = options;return _this;
  }_createClass(i18nextParser, [{ key: "build", value:

    function build() {var _this2 = this;
      var outputPath = this.outputPath;
      return new Promise(function (resolve, reject) {
        var files = [];
        var count = 0;

        _vinylFs["default"].
        src(_this2.inputPaths.map(function (x) {return x + '/**/*.{js,hbs}';})).
        pipe((0, _gulpSort["default"])()).
        pipe(
        new _transform["default"](_this2.options).
        on('reading', function (file) {
          if (!this.options.silent) {
            console.log('  [read]  '.green + file.path);
          }
          count++;
        }).
        on('data', function (file) {
          files.push(_fsExtra["default"].outputFile(file.path, file.contents));
          if (!this.options.silent) {
            console.log('  [write] '.green + file.path);
          }
        }).
        on('error', function (message, region) {
          if (typeof region === 'string') {
            message += ': ' + region.trim();
          }
          console.log('  [error] '.red + message);
        }).
        on('finish', function () {
          if (!this.options.silent) {
            console.log();
          }
          console.log('  Stats:  '.yellow + count + ' files were parsed');

          Promise.all(files).then(function () {
            resolve(files);
          });
        }));

      });
    } }]);return i18nextParser;}(_broccoliPlugin["default"]);exports["default"] = i18nextParser;module.exports = exports.default;