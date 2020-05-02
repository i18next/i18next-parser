'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _colors = require('colors');var _colors2 = _interopRequireDefault(_colors);
var _fsExtra = require('fs-extra');var _fsExtra2 = _interopRequireDefault(_fsExtra);
var _path = require('path');var _path2 = _interopRequireDefault(_path);
var _broccoliPlugin = require('broccoli-plugin');var _broccoliPlugin2 = _interopRequireDefault(_broccoliPlugin);
var _transform = require('../dist/transform');var _transform2 = _interopRequireDefault(_transform);
var _rsvp = require('rsvp');var _rsvp2 = _interopRequireDefault(_rsvp);
var _gulpSort = require('gulp-sort');var _gulpSort2 = _interopRequireDefault(_gulpSort);
var _vinylFs = require('vinyl-fs');var _vinylFs2 = _interopRequireDefault(_vinylFs);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}

var Promise = _rsvp2.default.Promise;var

i18nextParser = function (_Plugin) {_inherits(i18nextParser, _Plugin);
  function i18nextParser(inputNodes) {var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};_classCallCheck(this, i18nextParser);var _this = _possibleConstructorReturn(this, (i18nextParser.__proto__ || Object.getPrototypeOf(i18nextParser)).apply(this,
    arguments));
    _this.options = options;return _this;
  }_createClass(i18nextParser, [{ key: 'build', value: function build()

    {var _this2 = this;
      var outputPath = this.outputPath;
      return new Promise(function (resolve, reject) {
        var files = [];
        var count = 0;

        _vinylFs2.default.
        src(_this2.inputPaths.map(function (x) {return x + '/**/*.{js,hbs}';})).
        pipe((0, _gulpSort2.default)()).
        pipe(
        new _transform2.default(_this2.options).
        on('reading', function (file) {
          if (!this.options.silent) {
            console.log('  [read]  '.green + file.path);
          }
          count++;
        }).
        on('data', function (file) {
          files.push(_fsExtra2.default.outputFile(file.path, file.contents));
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
    } }]);return i18nextParser;}(_broccoliPlugin2.default);exports.default = i18nextParser;module.exports = exports['default'];