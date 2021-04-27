"use strict";function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}Object.defineProperty(exports, "__esModule", { value: true });exports["default"] = void 0;var _javascriptLexer = _interopRequireDefault(require("./javascript-lexer"));
var ts = _interopRequireWildcard(require("typescript"));function _getRequireWildcardCache() {if (typeof WeakMap !== "function") return null;var cache = new WeakMap();_getRequireWildcardCache = function _getRequireWildcardCache() {return cache;};return cache;}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;}if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {return { "default": obj };}var cache = _getRequireWildcardCache();if (cache && cache.has(obj)) {return cache.get(obj);}var newObj = {};var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) {var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;if (desc && (desc.get || desc.set)) {Object.defineProperty(newObj, key, desc);} else {newObj[key] = obj[key];}}}newObj["default"] = obj;if (cache) {cache.set(obj, newObj);}return newObj;}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { "default": obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);}var

JsxLexer = /*#__PURE__*/function (_JavascriptLexer) {_inherits(JsxLexer, _JavascriptLexer);var _super = _createSuper(JsxLexer);
  function JsxLexer() {var _this;var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, JsxLexer);
    _this = _super.call(this, options);

    _this.transSupportBasicHtmlNodes =
    options.transSupportBasicHtmlNodes || false;
    _this.transKeepBasicHtmlNodesFor = options.transKeepBasicHtmlNodesFor || [
    'br',
    'strong',
    'i',
    'p'];

    _this.omitAttributes = [_this.attr, 'ns', 'defaults'];return _this;
  }_createClass(JsxLexer, [{ key: "extract", value:

    function extract(content) {var _this2 = this;var filename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '__default.jsx';
      var keys = [];

      var parseCommentNode = this.createCommentNodeParser();

      var parseTree = function parseTree(node) {
        var entry;

        parseCommentNode(keys, node, content);

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

      var sourceFile = ts.createSourceFile(
      filename,
      content,
      ts.ScriptTarget.Latest);

      parseTree(sourceFile);

      return this.setNamespaces(keys);
    } }, { key: "jsxExtractor", value:

    function jsxExtractor(node, sourceText) {var _this3 = this;
      var tagNode = node.openingElement || node;

      var getPropValue = function getPropValue(node, tagName) {
        var attribute = node.attributes.properties.find(
        function (attr) {return attr.name.text === tagName;});

        if (!attribute) {
          return undefined;
        }
        return attribute.initializer.expression ?
        attribute.initializer.expression.text :
        attribute.initializer.text;
      };

      var getKey = function getKey(node) {return getPropValue(node, _this3.attr);};

      if (tagNode.tagName.text === 'Trans') {
        var entry = {};
        entry.key = getKey(tagNode);

        var defaultsProp = getPropValue(tagNode, 'defaults');
        var defaultValue =
        defaultsProp || this.nodeToString.call(this, node, sourceText);

        if (defaultValue !== '') {
          entry.defaultValue = defaultValue;

          if (!entry.key) {
            entry.key = entry.defaultValue;
          }
        }

        var namespace = getPropValue(tagNode, 'ns');
        if (namespace) {
          entry.namespace = namespace;
        }

        tagNode.attributes.properties.forEach(function (property) {
          if (_this3.omitAttributes.includes(property.name.text)) {
            return;
          }

          if (property.initializer.expression) {
            entry[
            property.name.text] = "{".concat(
            property.initializer.expression.text, "}");
          } else {
            entry[property.name.text] = property.initializer.text;
          }
        });

        return entry.key ? entry : null;
      } else if (tagNode.tagName.text === 'Interpolate') {
        var _entry = {};
        _entry.key = getKey(tagNode);
        return _entry.key ? _entry : null;
      }
    } }, { key: "nodeToString", value:

    function nodeToString(node, sourceText) {var _this4 = this;
      var children = this.parseChildren.call(this, node.children, sourceText);

      var elemsToString = function elemsToString(children) {return (
          children.
          map(function (child, index) {
            switch (child.type) {
              case 'js':
              case 'text':
                return child.content;
              case 'tag':
                var useTagName =
                child.isBasic &&
                _this4.transSupportBasicHtmlNodes &&
                _this4.transKeepBasicHtmlNodesFor.includes(child.name);
                var elementName = useTagName ? child.name : index;
                var childrenString = elemsToString(child.children);
                return childrenString || !(useTagName && child.selfClosing) ? "<".concat(
                elementName, ">").concat(childrenString, "</").concat(elementName, ">") : "<".concat(
                elementName, " />");
              default:
                throw new Error('Unknown parsed content: ' + child.type);}

          }).
          join(''));};

      return elemsToString(children);
    } }, { key: "parseChildren", value:

    function parseChildren() {var _this5 = this;var children = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];var sourceText = arguments.length > 1 ? arguments[1] : undefined;
      return children.
      map(function (child) {
        if (child.kind === ts.SyntaxKind.JsxText) {
          return {
            type: 'text',
            content: child.text.
            replace(/(^(\n|\r)\s*)|((\n|\r)\s*$)/g, '').
            replace(/(\n|\r)\s*/g, ' ') };

        } else if (
        child.kind === ts.SyntaxKind.JsxElement ||
        child.kind === ts.SyntaxKind.JsxSelfClosingElement)
        {
          var element = child.openingElement || child;
          var name = element.tagName.escapedText;
          var isBasic = !element.attributes.properties.length;
          return {
            type: 'tag',
            children: _this5.parseChildren(child.children, sourceText),
            name: name,
            isBasic: isBasic,
            selfClosing: child.kind === ts.SyntaxKind.JsxSelfClosingElement };

        } else if (child.kind === ts.SyntaxKind.JsxExpression) {
          // strip empty expressions
          if (!child.expression) {
            return {
              type: 'text',
              content: '' };

          } else if (child.expression.kind === ts.SyntaxKind.StringLiteral) {
            return {
              type: 'text',
              content: child.expression.text };

          }

          // strip properties from ObjectExpressions
          // annoying (and who knows how many other exceptions we'll need to write) but necessary
          else if (
            child.expression.kind === ts.SyntaxKind.ObjectLiteralExpression)
            {
              // i18next-react only accepts two props, any random single prop, and a format prop
              // for our purposes, format prop is always ignored

              var nonFormatProperties = child.expression.properties.filter(
              function (prop) {return prop.name.text !== 'format';});


              // more than one property throw a warning in i18next-react, but still works as a key
              if (nonFormatProperties.length > 1) {
                _this5.emit(
                'warning', "The passed in object contained more than one variable - the object should look like {{ value, format }} where format is optional.");



                return {
                  type: 'text',
                  content: '' };

              }

              return {
                type: 'js',
                content: "{{".concat(nonFormatProperties[0].name.text, "}}") };

            }

          // slice on the expression so that we ignore comments around it
          return {
            type: 'js',
            content: "{".concat(sourceText.slice(
            child.expression.pos,
            child.expression.end), "}") };


        } else {
          throw new Error('Unknown ast element when parsing jsx: ' + child.kind);
        }
      }).
      filter(function (child) {return child.type !== 'text' || child.content;});
    } }]);return JsxLexer;}(_javascriptLexer["default"]);exports["default"] = JsxLexer;module.exports = exports.default;