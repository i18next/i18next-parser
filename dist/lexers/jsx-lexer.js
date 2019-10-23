'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _javascriptLexer = require('./javascript-lexer');var _javascriptLexer2 = _interopRequireDefault(_javascriptLexer);
var _typescript = require('typescript');var ts = _interopRequireWildcard(_typescript);function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var

JsxLexer = function (_JavascriptLexer) {_inherits(JsxLexer, _JavascriptLexer);
  function JsxLexer() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, JsxLexer);var _this = _possibleConstructorReturn(this, (JsxLexer.__proto__ || Object.getPrototypeOf(JsxLexer)).call(this,
    options));

    _this.transSupportBasicHtmlNodes = options.transSupportBasicHtmlNodes || false;
    _this.transKeepBasicHtmlNodesFor = options.transKeepBasicHtmlNodesFor || ['br', 'strong', 'i', 'p'];return _this;
  }_createClass(JsxLexer, [{ key: 'extract', value: function extract(

    content) {var _this2 = this;var filename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '__default.jsx';
      var keys = [];

      var parseTree = function parseTree(node) {
        var entry = void 0;

        switch (node.kind) {
          case ts.SyntaxKind.CallExpression:
            entry = _this2.expressionExtractor.call(_this2, node);
            break;
          case ts.SyntaxKind.JsxElement:
            entry = _this2.jsxExtractor.call(_this2, node, content);
            break;
          case ts.SyntaxKind.JsxSelfClosingElement:
            entry = _this2.jsxExtractor.call(_this2, node, content);
            break;}


        if (entry) {
          keys.push(entry);
        }

        node.forEachChild(parseTree);
      };

      var sourceFile = ts.createSourceFile(filename, content, ts.ScriptTarget.Latest);
      parseTree(sourceFile);

      return keys;
    } }, { key: 'jsxExtractor', value: function jsxExtractor(

    node, sourceText) {var _this3 = this;
      var tagNode = node.openingElement || node;

      var getKey = function getKey(node) {
        var attribute = node.attributes.properties.find(function (attr) {return attr.name.text === _this3.attr;});
        return attribute && attribute.initializer.text;
      };

      if (tagNode.tagName.text === "Trans") {
        var entry = {};
        entry.key = getKey(tagNode);

        var defaultValue = this.nodeToString.call(this, node, sourceText);

        if (defaultValue !== '') {
          entry.defaultValue = defaultValue;

          if (!entry.key) {
            entry.key = entry.defaultValue;
          }
        }

        return entry.key ? entry : null;
      } else
      if (tagNode.tagName.text === "Interpolate") {
        var _entry = {};
        _entry.key = getKey(tagNode);
        return _entry.key ? _entry : null;
      }
    } }, { key: 'nodeToString', value: function nodeToString(

    node, sourceText) {var _this4 = this;
      var children = this.parseChildren.call(this, node.children, sourceText);

      var elemsToString = function elemsToString(children) {return children.map(function (child, index) {
          switch (child.type) {
            case 'js':
            case 'text':
              return child.content;
            case 'tag':
              var elementName =
              child.isBasic &&
              _this4.transSupportBasicHtmlNodes &&
              _this4.transKeepBasicHtmlNodesFor.includes(child.name) ?
              child.name :
              index;
              return '<' + elementName + '>' + elemsToString(child.children) + '</' + elementName + '>';
            default:throw new Error('Unknown parsed content: ' + child.type);}

        }).join('');};

      return elemsToString(children);
    } }, { key: 'parseChildren', value: function parseChildren()

    {var _this5 = this;var children = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];var sourceText = arguments[1];
      return children.map(function (child) {
        if (child.kind === ts.SyntaxKind.JsxText) {
          return {
            type: 'text',
            content: child.text.replace(/(^(\n|\r)\s*)|((\n|\r)\s*$)/g, '').replace(/(\n|\r)\s*/g, ' ') };

        } else
        if (child.kind === ts.SyntaxKind.JsxElement || child.kind === ts.SyntaxKind.JsxSelfClosingElement) {
          var element = child.openingElement || child;
          var name = element.tagName.escapedText;
          var isBasic = !element.attributes.properties.length;
          return {
            type: 'tag',
            children: _this5.parseChildren(child.children, sourceText),
            name: name,
            isBasic: isBasic };

        } else
        if (child.kind === ts.SyntaxKind.JsxExpression) {
          // strip empty expressions
          if (!child.expression) {
            return {
              type: 'text',
              content: '' };

          } else

          if (child.expression.kind === ts.SyntaxKind.StringLiteral) {
            return {
              type: 'text',
              content: child.expression.text };

          }

          // strip properties from ObjectExpressions
          // annoying (and who knows how many other exceptions we'll need to write) but necessary
          else if (child.expression.kind === ts.SyntaxKind.ObjectLiteralExpression) {
              // i18next-react only accepts two props, any random single prop, and a format prop
              // for our purposes, format prop is always ignored

              var nonFormatProperties = child.expression.properties.filter(function (prop) {return prop.name.text !== 'format';});

              // more than one property throw a warning in i18next-react, but still works as a key
              if (nonFormatProperties.length > 1) {
                _this5.emit('warning', 'The passed in object contained more than one variable - the object should look like {{ value, format }} where format is optional.');

                return {
                  type: 'text',
                  content: '' };

              }

              return {
                type: 'js',
                content: '{{' + nonFormatProperties[0].name.text + '}}' };

            }

          // slice on the expression so that we ignore comments around it
          return {
            type: 'js',
            content: '{' + sourceText.slice(child.expression.pos, child.expression.end) + '}' };

        } else
        {
          throw new Error('Unknown ast element when parsing jsx: ' + child.kind);
        }
      }).filter(function (child) {return child.type !== 'text' || child.content;});
    } }]);return JsxLexer;}(_javascriptLexer2.default);exports.default = JsxLexer;module.exports = exports['default'];