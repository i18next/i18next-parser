"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _acornJsx = require("acorn-jsx");var acorn = _interopRequireWildcard(_acornJsx);
var _inject = require("acorn-object-rest-spread/inject");var _inject2 = _interopRequireDefault(_inject);
var _acornEs = require("acorn-es7");var _acornEs2 = _interopRequireDefault(_acornEs);
var _walk = require("acorn/dist/walk");var walk = _interopRequireWildcard(_walk);
var _baseLexer = require("./base-lexer");var _baseLexer2 = _interopRequireDefault(_baseLexer);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var

JavascriptLexer = function (_BaseLexer) {_inherits(JavascriptLexer, _BaseLexer);
  function JavascriptLexer() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, JavascriptLexer);var _this = _possibleConstructorReturn(this, (JavascriptLexer.__proto__ || Object.getPrototypeOf(JavascriptLexer)).call(this,
    options));

    _this.acornOptions = _extends({ sourceType: 'module' }, options.acorn);
    _this.functions = options.functions || ['t'];
    _this.attr = options.attr || 'i18nKey';return _this;
  }_createClass(JavascriptLexer, [{ key: "extract", value: function extract(

    content) {
      var that = this;

      var localAcorn = acorn;

      if (this.acornOptions.plugins) {
        if (this.acornOptions.plugins.es7) {
          (0, _acornEs2.default)(localAcorn);
        }
        if (this.acornOptions.plugins.objectRestSpread) {
          (0, _inject2.default)(localAcorn);
        }
      }

      walk.simple(
      localAcorn.parse(content, this.acornOptions),
      {
        CallExpression: function CallExpression(node) {
          that.expressionExtractor.call(that, node);
        } });



      return this.keys;
    } }, { key: "expressionExtractor", value: function expressionExtractor(

    node) {
      var entry = {};
      var isTranslationFunction =
      node.callee && (
      this.functions.includes(node.callee.name) ||
      node.callee.property && this.functions.includes(node.callee.property.name));


      if (isTranslationFunction) {
        var keyArgument = node.arguments.shift();

        if (keyArgument && keyArgument.type === 'Literal') {
          entry.key = keyArgument.value;
        } else
        if (keyArgument && keyArgument.type === 'BinaryExpression') {
          var concatenatedString = this.concatenateString(keyArgument);
          if (!concatenatedString) {
            this.emit('warning', "Key is not a string literal: " + keyArgument.name);
            return;
          }
          entry.key = concatenatedString;
        } else
        {
          if (keyArgument.type === 'Identifier') {
            this.emit('warning', "Key is not a string literal: " + keyArgument.name);
          }

          return;
        }


        var optionsArgument = node.arguments.shift();

        if (optionsArgument && optionsArgument.type === 'Literal') {
          entry.defaultValue = optionsArgument.value;
        } else
        if (optionsArgument && optionsArgument.type === 'ObjectExpression') {var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {
            for (var _iterator = optionsArgument.properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var p = _step.value;
              entry[p.key.name || p.key.value] = p.value.value;
            }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator.return) {_iterator.return();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
        }

        this.keys.push(entry);
      }
    } }, { key: "concatenateString", value: function concatenateString(

    binaryExpression) {var string = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      if (binaryExpression.operator !== '+') {
        return;
      }

      if (binaryExpression.left.type === 'BinaryExpression') {
        string += this.concatenateString(binaryExpression.left, string);
      } else
      if (binaryExpression.left.type === 'Literal') {
        string += binaryExpression.left.value;
      } else
      {
        return;
      }

      if (binaryExpression.right.type === 'BinaryExpression') {
        string += this.concatenateString(binaryExpression.right, string);
      } else
      if (binaryExpression.right.type === 'Literal') {
        string += binaryExpression.right.value;
      } else
      {
        return;
      }

      return string;
    } }]);return JavascriptLexer;}(_baseLexer2.default);exports.default = JavascriptLexer;module.exports = exports["default"];