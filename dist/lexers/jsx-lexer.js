'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _acornJsx = require('acorn-jsx');var acorn = _interopRequireWildcard(_acornJsx);
var _assert = require('assert');var _assert2 = _interopRequireDefault(_assert);
var _htmlLexer = require('./html-lexer');var _htmlLexer2 = _interopRequireDefault(_htmlLexer);
var _baseLexer = require('./base-lexer');var _baseLexer2 = _interopRequireDefault(_baseLexer);
var _helpers = require('../helpers');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var

JsxLexer = function (_HTMLLexer) {_inherits(JsxLexer, _HTMLLexer);
  function JsxLexer() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, JsxLexer);
    options.attr = options.attr || 'i18nKey';return _possibleConstructorReturn(this, (JsxLexer.__proto__ || Object.getPrototypeOf(JsxLexer)).call(this,
    options));
  }_createClass(JsxLexer, [{ key: 'extract', value: function extract(

    content) {
      this.extractInterpolate(content);
      this.extractTrans(content);
      return this.keys;
    } }, { key: 'extractInterpolate', value: function extractInterpolate(

    content) {
      var matches = void 0;
      var regex = new RegExp(
      '<Interpolate([^>]*\\s' + this.attr + '[^>]*)\\/?>',
      'gi');


      while (matches = regex.exec(content)) {
        var attrs = this.parseAttributes(matches[1]);
        var key = attrs.keys;
        if (key) {
          this.keys.push(_extends({}, attrs.options, { key: key }));
        }
      }

      return this.keys;
    } }, { key: 'extractTrans', value: function extractTrans(

    content) {
      var matches = void 0;
      var closingTagPattern = '(?:<Trans([^>]*\\s' + this.attr + '[^>]*?)\\/>)';
      var selfClosingTagPattern = '(?:<Trans([^>]*\\s' + this.attr + '[^>]*?)>((?:\\s|.)*?)<\\/Trans>)';
      var regex = new RegExp(
      [closingTagPattern, selfClosingTagPattern].join('|'),
      'gi');


      while (matches = regex.exec(content)) {
        var attrs = this.parseAttributes(matches[1] || matches[2]);
        var key = attrs.keys;

        if (matches[3] && !attrs.options.defaultValue) {
          attrs.options.defaultValue = this.eraseTags(matches[0]).replace(/\s+/g, ' ');
        }

        if (key) {
          this.keys.push(_extends({}, attrs.options, { key: key }));
        }
      }

      return this.keys;
    }

    /**
       * Recursively convert html tags and js injections to tags with the child index in it
       * @param {string} string
       *
       * @returns string
       */ }, { key: 'eraseTags', value: function eraseTags(
    string) {
      var acornAst = acorn.parse(string, { plugins: { jsx: true } });
      var acornTransAst = acornAst.body[0].expression;
      var children = this.parseAcornPayload(acornTransAst.children, string);

      var elemsToString = function elemsToString(children) {return children.map(function (child, index) {
          switch (child.type) {
            case 'text':return child.content;
            case 'js':return '<' + index + '>' + child.content + '</' + index + '>';
            case 'tag':return '<' + index + '>' + elemsToString(child.children) + '</' + index + '>';
            default:throw new _helpers.ParsingError('Unknown parsed content: ' + child.type);}

        }).join('');};

      return elemsToString(children);
    }

    /**
       * Simplify the bulky AST given by Acorn
       * @param {*} children An array of elements contained inside an html tag
       * @param {string} originalString The original string being parsed
       */ }, { key: 'parseAcornPayload', value: function parseAcornPayload(
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
          throw new _helpers.ParsingError('Unknown ast element when parsing jsx: ' + child.type);
        }
      }).filter(function (child) {return child.type !== 'text' || child.content;});
    } }]);return JsxLexer;}(_htmlLexer2.default);exports.default = JsxLexer;