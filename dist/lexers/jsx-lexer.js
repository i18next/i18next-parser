'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _acornJsx = require('acorn-jsx');var acorn = _interopRequireWildcard(_acornJsx);
var _walk = require('acorn/dist/walk');var walk = _interopRequireWildcard(_walk);
var _javascriptLexer = require('./javascript-lexer');var _javascriptLexer2 = _interopRequireDefault(_javascriptLexer);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}

var JSXParserExtension = Object.assign({}, walk.base, {
  JSXText: function JSXText(node, st, c) {
    // We need this catch, but we don't need the catch to do anything.
  },
  JSXElement: function JSXElement(node, st, c) {
    node.openingElement.attributes.forEach(function (attr) {return c(attr, st, attr.type);});
    node.children.forEach(function (child) {return c(child, st, child.type);});
  },
  JSXExpressionContainer: function JSXExpressionContainer(node, st, c) {
    c(node.expression, st, node.expression.type);
  },
  JSXAttribute: function JSXAttribute(node, st, c) {
    if (node.value !== null) {
      c(node.value, st, node.value.type);
    }
  },
  JSXSpreadAttribute: function JSXSpreadAttribute(node, st, c) {
    c(node.argument, st, node.argument.type);
  } });var


JsxLexer = function (_JavascriptLexer) {_inherits(JsxLexer, _JavascriptLexer);
  function JsxLexer() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, JsxLexer);var _this = _possibleConstructorReturn(this, (JsxLexer.__proto__ || Object.getPrototypeOf(JsxLexer)).call(this,
    options));

    _this.acornOptions = _extends({ sourceType: 'module', plugins: { jsx: true } }, options.acorn);

    _this.functions = options.functions || ['t'];
    _this.attr = options.attr || 'i18nKey';return _this;
  }_createClass(JsxLexer, [{ key: 'extract', value: function extract(

    content) {
      var that = this;

      walk.simple(
      acorn.parse(content, this.acornOptions),
      {
        CallExpression: function CallExpression(node) {
          that.expressionExtractor.call(that, node);
        },
        JSXElement: function JSXElement(node) {
          var element = node.openingElement;
          if (element.name.name === "Trans") {
            var entry = {};
            var defaultValue = that.nodeToString.call(that, node, content);

            element.attributes.forEach(function (attr) {
              if (attr.name.name === that.attr) {
                entry.key = attr.value.value;
              }
            });

            if (defaultValue !== '') {
              entry.defaultValue = defaultValue;

              if (!entry.key)
              entry.key = entry.defaultValue;
            }

            if (entry.key)
            that.keys.push(entry);
          } else

          if (element.name.name === "Interpolate") {
            var _entry = {};

            element.attributes.forEach(function (attr) {
              if (attr.name.name === that.attr) {
                _entry.key = attr.value.value;
              }
            });

            if (_entry.key)
            that.keys.push(_entry);
          }
        } },

      JSXParserExtension);


      return this.keys;
    } }, { key: 'nodeToString', value: function nodeToString(

    ast, string) {
      var children = this.parseAcornPayload(ast.children, string);

      var elemsToString = function elemsToString(children) {return children.map(function (child, index) {
          switch (child.type) {
            case 'text':return child.content;
            case 'js':return '<' + index + '>' + child.content + '</' + index + '>';
            case 'tag':return '<' + index + '>' + elemsToString(child.children) + '</' + index + '>';
            default:throw new ParsingError('Unknown parsed content: ' + child.type);}

        }).join('');};

      return elemsToString(children);
    } }, { key: 'parseAcornPayload', value: function parseAcornPayload(

    children, originalString) {var _this2 = this;
      return children.map(function (child) {
        if (child.type === 'JSXText') {
          return {
            type: 'text',
            content: child.value.replace(/^(?:\s*(\n|\r)\s*)?(.*)(?:\s*(\n|\r)\s*)?$/, '$2') };

        } else
        if (child.type === 'JSXElement') {
          return {
            type: 'tag',
            children: _this2.parseAcornPayload(child.children, originalString) };

        } else
        if (child.type === 'JSXExpressionContainer') {
          return {
            type: 'js',
            content: originalString.slice(child.start, child.end) };

        } else
        {
          throw new ParsingError('Unknown ast element when parsing jsx: ' + child.type);
        }
      }).filter(function (child) {return child.type !== 'text' || child.content;});
    } }]);return JsxLexer;}(_javascriptLexer2.default);exports.default = JsxLexer;module.exports = exports['default'];