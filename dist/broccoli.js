"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));var _colors = _interopRequireDefault(require("colors"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _path = _interopRequireDefault(require("path"));
var _broccoliPlugin = _interopRequireDefault(require("broccoli-plugin"));
var _transform = _interopRequireDefault(require("../dist/transform"));
var _rsvp = _interopRequireDefault(require("rsvp"));
var _gulpSort = _interopRequireDefault(require("gulp-sort"));
var _vinylFs = _interopRequireDefault(require("vinyl-fs"));function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = (0, _getPrototypeOf2["default"])(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return (0, _possibleConstructorReturn2["default"])(this, result);};}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}

var Promise = _rsvp["default"].Promise;var

i18nextParser = /*#__PURE__*/function (_Plugin) {(0, _inherits2["default"])(i18nextParser, _Plugin);var _super = _createSuper(i18nextParser);
  function i18nextParser(inputNodes) {var _this;var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};(0, _classCallCheck2["default"])(this, i18nextParser);
    _this = _super.apply(this, arguments);
    _this.options = options;return _this;
  }(0, _createClass2["default"])(i18nextParser, [{ key: "build", value:

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
    } }]);return i18nextParser;}(_broccoliPlugin["default"]);exports["default"] = i18nextParser;