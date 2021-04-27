"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _baseLexer = _interopRequireDefault(require("./base-lexer"));
var ts = _interopRequireWildcard(require("typescript"));function _getRequireWildcardCache() {if (typeof WeakMap !== "function") return null;var cache = new WeakMap();_getRequireWildcardCache = function _getRequireWildcardCache() {return cache;};return cache;}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;}if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {return { "default": obj };}var cache = _getRequireWildcardCache();if (cache && cache.has(obj)) {return cache.get(obj);}var newObj = {};var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) {var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;if (desc && (desc.get || desc.set)) {Object.defineProperty(newObj, key, desc);} else {newObj[key] = obj[key];}}}newObj["default"] = obj;if (cache) {cache.set(obj, newObj);}return newObj;}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _createForOfIteratorHelper(o, allowArrayLike) {var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {if (i >= o.length) return { done: true };return { done: false, value: o[i++] };}, e: function e(_e) {throw _e;}, f: F };}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion = true,didErr = false,err;return { s: function s() {it = it.call(o);}, n: function n() {var step = it.next();normalCompletion = step.done;return step;}, e: function e(_e2) {didErr = true;err = _e2;}, f: function f() {try {if (!normalCompletion && it["return"] != null) it["return"]();} finally {if (didErr) throw err;}} };}function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _toConsumableArray(arr) {return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();}function _nonIterableSpread() {throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _iterableToArray(iter) {if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);}function _arrayWithoutHoles(arr) {if (Array.isArray(arr)) return _arrayLikeToArray(arr);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);}var

JavascriptLexer = /*#__PURE__*/function (_BaseLexer) {_inherits(JavascriptLexer, _BaseLexer);var _super = _createSuper(JavascriptLexer);
  function JavascriptLexer() {var _this;var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, JavascriptLexer);
    _this = _super.call(this, options);

    _this.callPattern = '(?<=^|\\s|\\.)' + _this.functionPattern() + '\\(.*\\)';
    _this.functions = options.functions || ['t'];
    _this.attr = options.attr || 'i18nKey';return _this;
  }_createClass(JavascriptLexer, [{ key: "createCommentNodeParser", value:

    function createCommentNodeParser() {var _this2 = this;
      var visitedComments = new Set();

      return function (keys, node, content) {
        ts.forEachLeadingCommentRange(
        content,
        node.getFullStart(),
        function (pos, end, kind) {
          var commentId = "".concat(pos, "_").concat(end);
          if (
          (kind === ts.SyntaxKind.MultiLineCommentTrivia ||
          kind === ts.SyntaxKind.SingleLineCommentTrivia) &&
          !visitedComments.has(commentId))
          {
            visitedComments.add(commentId);
            var text = content.slice(pos, end);
            var commentKeys = _this2.commentExtractor.call(_this2, text);
            if (commentKeys) {
              keys.push.apply(keys, _toConsumableArray(commentKeys));
            }
          }
        });

      };
    } }, { key: "setNamespaces", value:

    function setNamespaces(keys) {var _this3 = this;
      if (this.defaultNamespace) {
        return keys.map(function (entry) {return _objectSpread(_objectSpread({},
          entry), {}, {
            namespace: entry.namespace || _this3.defaultNamespace });});

      }

      return keys;
    } }, { key: "extract", value:

    function extract(content) {var _this4 = this;var filename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '__default.js';
      var keys = [];

      var parseCommentNode = this.createCommentNodeParser();

      var parseTree = function parseTree(node) {
        var entry;

        parseCommentNode(keys, node, content);

        if (node.kind === ts.SyntaxKind.CallExpression) {
          entry = _this4.expressionExtractor.call(_this4, node);
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

      return this.setNamespaces(keys);
    } }, { key: "expressionExtractor", value:

    function expressionExtractor(node) {
      var entry = {};

      if (
      node.expression.escapedText === 'useTranslation' &&
      node.arguments.length)
      {
        this.defaultNamespace = node.arguments[0].text;
      }

      if (
      node.expression.escapedText === 'withTranslation' &&
      node.arguments.length)
      {
        var _node$arguments$ = node.arguments[0],text = _node$arguments$.text,elements = _node$arguments$.elements;
        if (text) {
          this.defaultNamespace = text;
        } else if (elements && elements.length) {
          this.defaultNamespace = elements[0].text;
        }
      }

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
            'warning', "Key is not a string literal: ".concat(
            keyArgument.text));

            return null;
          }
          entry.key = concatenatedString;
        } else {
          this.emit(
          'warning',
          keyArgument.kind === ts.SyntaxKind.Identifier ? "Key is not a string literal: ".concat(
          keyArgument.text) :
          'Key is not a string literal');

          return null;
        }

        var optionsArgument = node.arguments.shift();

        // Second argument could be a string default value
        if (
        optionsArgument &&
        optionsArgument.kind === ts.SyntaxKind.StringLiteral)
        {
          entry.defaultValue = optionsArgument.text;
          optionsArgument = node.arguments.shift();
        }

        if (
        optionsArgument &&
        optionsArgument.kind === ts.SyntaxKind.ObjectLiteralExpression)
        {var _iterator = _createForOfIteratorHelper(
          optionsArgument.properties),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var p = _step.value;
              entry[p.name.text] = p.initializer && p.initializer.text || '';
            }} catch (err) {_iterator.e(err);} finally {_iterator.f();}
        }

        if (entry.ns) {
          if (typeof entry.ns === 'string') {
            entry.namespace = entry.ns;
          } else if (_typeof(entry.ns) === 'object' && entry.ns.length) {
            entry.namespace = entry.ns[0];
          }
        }

        return entry;
      }

      return null;
    } }, { key: "commentExtractor", value:

    function commentExtractor(commentText) {var _this5 = this;
      var regexp = new RegExp(this.callPattern, 'g');
      var expressions = commentText.match(regexp);

      if (!expressions) {
        return null;
      }

      var keys = [];
      expressions.forEach(function (expression) {
        var expressionKeys = _this5.extract(expression);
        if (expressionKeys) {
          keys.push.apply(keys, _toConsumableArray(expressionKeys));
        }
      });
      return keys;
    } }, { key: "concatenateString", value:

    function concatenateString(binaryExpression) {var string = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
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
    } }]);return JavascriptLexer;}(_baseLexer["default"]);exports["default"] = JavascriptLexer;module.exports = exports.default;