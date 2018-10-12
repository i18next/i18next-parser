'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _javascriptLexer = require('./javascript-lexer');var _javascriptLexer2 = _interopRequireDefault(_javascriptLexer);
var _walk = require('acorn/dist/walk');var walk = _interopRequireWildcard(_walk);function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}

var JSXParserExtension = {
  JSXText: function JSXText(node, st, c) {
    // We need this catch, but we don't need the catch to do anything.
  },
  JSXEmptyExpression: function JSXEmptyExpression(node, st, c) {
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
  } };var


JsxLexer = function (_JavascriptLexer) {_inherits(JsxLexer, _JavascriptLexer);
  function JsxLexer() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, JsxLexer);


    // super will setup acornOptions, acorn and the walker, just add what we need
    var _this = _possibleConstructorReturn(this, (JsxLexer.__proto__ || Object.getPrototypeOf(JsxLexer)).call(this, options));_this.acornOptions.plugins.jsx = true;
    _this.WalkerBase = Object.assign({}, _this.WalkerBase, _extends({},
    JSXParserExtension));


    try {
      var injectAcornJsx = require('acorn-jsx/inject');
      _this.acorn = injectAcornJsx(_this.acorn);
    } catch (e) {
      throw new Error(
      'You must install acorn-jsx to parse jsx files. ' +
      'Try running "yarn add acorn-jsx" or "npm install acorn-jsx"');

    }return _this;
  }_createClass(JsxLexer, [{ key: 'extract', value: function extract(

    content) {
      var that = this;

      walk.simple(
      this.acorn.parse(content, this.acornOptions),
      {
        CallExpression: function CallExpression(node) {
          that.expressionExtractor.call(that, node);
        },
        JSXElement: function JSXElement(node) {
          var element = node.openingElement;
          if (element.name.name === "Trans") {
            var entry = {};
            var defaultValue = that.nodeToString.call(that, node, content);var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {

              for (var _iterator = element.attributes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var attr = _step.value;
                if (attr.name.name === that.attr) {
                  entry.key = attr.value.value;
                }
              }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator.return) {_iterator.return();}} finally {if (_didIteratorError) {throw _iteratorError;}}}

            if (defaultValue !== '') {
              entry.defaultValue = defaultValue;

              if (!entry.key)
              entry.key = entry.defaultValue;
            }

            if (entry.key)
            that.keys.push(entry);
          } else

          if (element.name.name === "Interpolate") {
            var _entry = {};var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {

              for (var _iterator2 = element.attributes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var _attr = _step2.value;
                if (_attr.name.name === that.attr) {
                  _entry.key = _attr.value.value;
                }
              }} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2.return) {_iterator2.return();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}

            if (_entry.key)
            that.keys.push(_entry);
          }
        } },

      this.WalkerBase);


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
          // strip empty expressions
          if (child.expression.type === 'JSXEmptyExpression')
          return {
            type: 'text',
            content: ''


            // strip properties from ObjectExpressions
            // annoying (and who knows how many other exceptions we'll need to write) but necessary
          };else if (child.expression.type === 'ObjectExpression') {
            // i18next-react only accepts two props, any random single prop, and a format prop
            // for our purposes, format prop is always ignored

            var nonFormatProperties = child.expression.properties.filter(function (prop) {return prop.key.name !== 'format';});

            // more than one property throw a warning in i18next-react, but still works as a key
            if (nonFormatProperties.length > 1) {
              _this2.emit('warning', 'The passed in object contained more than one variable - the object should look like {{ value, format }} where format is optional.');

              return {
                type: 'text',
                content: '' };

            }

            return {
              type: 'js',
              content: '{{' + nonFormatProperties[0].key.name + '}}' };

          }

          // slice on the expression so that we ignore comments around it
          return {
            type: 'js',
            content: '{' + originalString.slice(child.expression.start, child.expression.end) + '}' };

        } else
        {
          throw new ParsingError('Unknown ast element when parsing jsx: ' + child.type);
        }
      }).filter(function (child) {return child.type !== 'text' || child.content;});
    } }]);return JsxLexer;}(_javascriptLexer2.default);exports.default = JsxLexer;module.exports = exports['default'];