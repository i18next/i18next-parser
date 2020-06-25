'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _baseLexer = require('./base-lexer');var _baseLexer2 = _interopRequireDefault(_baseLexer);
var _typescript = require('typescript');var ts = _interopRequireWildcard(_typescript);function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var

JavascriptLexer = function (_BaseLexer) {_inherits(JavascriptLexer, _BaseLexer);
  function JavascriptLexer() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, JavascriptLexer);var _this = _possibleConstructorReturn(this, (JavascriptLexer.__proto__ || Object.getPrototypeOf(JavascriptLexer)).call(this,
    options));

    _this.functions = options.functions || ['t'];
    _this.attr = options.attr || 'i18nKey';return _this;
  }_createClass(JavascriptLexer, [{ key: 'extract', value: function extract(

    content) {var _this2 = this;var filename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '__default.js';
      var keys = [];

      var parseTree = function parseTree(node) {
        var entry = void 0;

        if (node.kind === ts.SyntaxKind.CallExpression) {
          entry = _this2.expressionExtractor.call(_this2, node);
        }

        if (entry) {
          keys.push(entry);
        }

        node.forEachChild(parseTree);
      };

      var sourceFile = ts.createSourceFile(
      filename,
      content,
      ts.ScriptTarget.Latest);

      parseTree(sourceFile);

      return keys;
    } }, { key: 'expressionExtractor', value: function expressionExtractor(

    node) {
      var entry = {};

      var isTranslationFunction =
      node.expression.text && this.functions.includes(node.expression.text) ||
      node.expression.name &&
      this.functions.includes(node.expression.name.text);

      if (isTranslationFunction) {
        var keyArgument = node.arguments.shift();

        if (!keyArgument) {
          return null;
        }

        if (
        keyArgument.kind === ts.SyntaxKind.StringLiteral ||
        keyArgument.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral)
        {
          entry.key = keyArgument.text;
        } else if (keyArgument.kind === ts.SyntaxKind.BinaryExpression) {
          var concatenatedString = this.concatenateString(keyArgument);
          if (!concatenatedString) {
            this.emit(
            'warning', 'Key is not a string literal: ' +
            keyArgument.text);

            return null;
          }
          entry.key = concatenatedString;
        } else {
          if (keyArgument.kind === ts.SyntaxKind.Identifier) {
            this.emit(
            'warning', 'Key is not a string literal: ' +
            keyArgument.text);

          }
          return null;
        }

        var optionsArgument = node.arguments.shift();

        if (
        optionsArgument &&
        optionsArgument.kind === ts.SyntaxKind.StringLiteral)
        {
          entry.defaultValue = optionsArgument.text;
        } else if (
        optionsArgument &&
        optionsArgument.kind === ts.SyntaxKind.ObjectLiteralExpression)
        {var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {
            for (var _iterator = optionsArgument.properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var p = _step.value;
              entry[p.name.text] = p.initializer && p.initializer.text || '';
            }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator.return) {_iterator.return();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
        }

        if (entry.ns) {
          if (typeof entry.ns === 'string') {
            entry.namespace = entry.ns;
          } else if (_typeof(entry.ns) === 'object' && entry.ns.length) {
            entry.namespace = entry.ns[0];
          }
        } else if (this.defaultNamespace) {
          entry.namespace = this.defaultNamespace;
        }

        return entry;
      }

      if (
      node.expression.escapedText === 'useTranslation' &&
      node.arguments.length)
      {
        this.defaultNamespace = node.arguments[0].text;
      }

      if (
      node.expression.escapedText === 'withTranslation' &&
      node.arguments.length)
      {var _node$arguments$ =
        node.arguments[0],text = _node$arguments$.text,elements = _node$arguments$.elements;
        if (text) {
          this.defaultNamespace = text;
        } else if (elements && elements.length) {
          this.defaultNamespace = elements[0].text;
        }
      }

      return null;
    } }, { key: 'concatenateString', value: function concatenateString(

    binaryExpression) {var string = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      if (binaryExpression.operatorToken.kind !== ts.SyntaxKind.PlusToken) {
        return;
      }

      if (binaryExpression.left.kind === ts.SyntaxKind.BinaryExpression) {
        string += this.concatenateString(binaryExpression.left, string);
      } else if (binaryExpression.left.kind === ts.SyntaxKind.StringLiteral) {
        string += binaryExpression.left.text;
      } else {
        return;
      }

      if (binaryExpression.right.kind === ts.SyntaxKind.BinaryExpression) {
        string += this.concatenateString(binaryExpression.right, string);
      } else if (binaryExpression.right.kind === ts.SyntaxKind.StringLiteral) {
        string += binaryExpression.right.text;
      } else {
        return;
      }

      return string;
    } }]);return JavascriptLexer;}(_baseLexer2.default);exports.default = JavascriptLexer;module.exports = exports['default'];