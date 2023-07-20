import JavascriptLexer from './javascript-lexer.js'
import ts from 'typescript'
import { unescape } from '../helpers.js'

export default class JsxLexer extends JavascriptLexer {
  constructor(options = {}) {
    super(options)

    this.componentFunctions = options.componentFunctions || ['Trans']
    this.transSupportBasicHtmlNodes =
      options.transSupportBasicHtmlNodes || false
    this.transKeepBasicHtmlNodesFor = options.transKeepBasicHtmlNodesFor || [
      'br',
      'strong',
      'i',
      'p',
    ]
    this.omitAttributes = [this.attr, 'ns', 'defaults']
  }

  extract(content, filename = '__default.jsx') {
    const keys = []

    const parseCommentNode = this.createCommentNodeParser()

    const parseTree = (node) => {
      let entry

      parseCommentNode(keys, node, content)

      switch (node.kind) {
        case ts.SyntaxKind.CallExpression:
          entry = this.expressionExtractor.call(this, node)
          break
        case ts.SyntaxKind.TaggedTemplateExpression:
          entry = this.taggedTemplateExpressionExtractor.call(this, node)
          break
        case ts.SyntaxKind.JsxElement:
          entry = this.jsxExtractor.call(this, node, content)
          break
        case ts.SyntaxKind.JsxSelfClosingElement:
          entry = this.jsxExtractor.call(this, node, content)
          break
      }

      if (entry) {
        keys.push(entry)
      }

      node.forEachChild(parseTree)
    }

    const sourceFile = ts.createSourceFile(
      filename,
      content,
      ts.ScriptTarget.Latest
    )
    parseTree(sourceFile)

    const keysWithNamespace = this.setNamespaces(keys)
    const keysWithPrefixes = this.setKeyPrefixes(keysWithNamespace)

    return keysWithPrefixes
  }

  jsxExtractor(node, sourceText) {
    const tagNode = node.openingElement || node

    const getPropValue = (node, attributeName) => {
      const attribute = node.attributes.properties.find(
        (attr) => attr.name !== undefined && attr.name.text === attributeName
      )
      if (!attribute) {
        return undefined
      }

      if (attribute.initializer.expression?.kind === ts.SyntaxKind.Identifier) {
        this.emit(
          'warning',
          `Namespace is not a string literal: ${attribute.initializer.expression.text}`
        )
        return undefined
      }

      return attribute.initializer.expression
        ? attribute.initializer.expression.text
        : attribute.initializer.text
    }

    const getKey = (node) => getPropValue(node, this.attr)

    if (this.componentFunctions.includes(tagNode.tagName.text)) {
      const entry = {}
      entry.key = getKey(tagNode)

      const namespace = getPropValue(tagNode, 'ns')
      if (namespace) {
        entry.namespace = namespace
      }

      tagNode.attributes.properties.forEach((property) => {
        if (property.kind === ts.SyntaxKind.JsxSpreadAttribute) {
          this.emit(
            'warning',
            `Component attribute is a JSX spread attribute : ${property.expression.text}`
          )
          return
        }

        if (this.omitAttributes.includes(property.name.text)) {
          return
        }

        if (property.initializer) {
          if (property.initializer.expression) {
            if (
              property.initializer.expression.kind === ts.SyntaxKind.TrueKeyword
            ) {
              entry[property.name.text] = true
            } else if (
              property.initializer.expression.kind ===
              ts.SyntaxKind.FalseKeyword
            ) {
              entry[property.name.text] = false
            } else {
              entry[
                property.name.text
              ] = `{${property.initializer.expression.text}}`
            }
          } else {
            entry[property.name.text] = property.initializer.text
          }
        } else entry[property.name.text] = true
      })

      const defaultsProp = getPropValue(tagNode, 'defaults')
      let defaultValue =
        defaultsProp || this.nodeToString.call(this, node, sourceText)

      if (entry.shouldUnescape === true) {
        defaultValue = unescape(defaultValue)
      }

      if (defaultValue !== '') {
        entry.defaultValue = defaultValue

        if (!entry.key) {
          entry.key = entry.defaultValue
        }
      }

      return entry.key ? entry : null
    } else if (tagNode.tagName.text === 'Interpolate') {
      const entry = {}
      entry.key = getKey(tagNode)
      return entry.key ? entry : null
    } else if (tagNode.tagName.text === 'Translation') {
      const namespace = getPropValue(tagNode, 'ns')
      if (namespace) {
        this.defaultNamespace = namespace
      }
    }
  }

  nodeToString(node, sourceText) {
    const children = this.parseChildren.call(this, node.children, sourceText)

    const elemsToString = (children) =>
      children
        .map((child, index) => {
          switch (child.type) {
            case 'js':
            case 'text':
              return child.content
            case 'tag':
              const useTagName =
                child.isBasic &&
                this.transSupportBasicHtmlNodes &&
                this.transKeepBasicHtmlNodesFor.includes(child.name)
              const elementName = useTagName ? child.name : index
              const childrenString = elemsToString(child.children)
              return childrenString || !(useTagName && child.selfClosing)
                ? `<${elementName}>${childrenString}</${elementName}>`
                : `<${elementName} />`
            default:
              throw new Error('Unknown parsed content: ' + child.type)
          }
        })
        .join('')

    return elemsToString(children)
  }

  parseChildren(children = [], sourceText) {
    return children
      .map((child) => {
        if (child.kind === ts.SyntaxKind.JsxText) {
          return {
            type: 'text',
            content: child.text
              .replace(/(^(\n|\r)\s*)|((\n|\r)\s*$)/g, '')
              .replace(/(\n|\r)\s*/g, ' '),
          }
        } else if (
          child.kind === ts.SyntaxKind.JsxElement ||
          child.kind === ts.SyntaxKind.JsxSelfClosingElement
        ) {
          const element = child.openingElement || child
          const name = element.tagName.escapedText
          const isBasic = !element.attributes.properties.length
          const hasDynamicChildren = element.attributes.properties.find(
            (prop) => prop.name.escapedText === 'i18nIsDynamicList'
          )
          return {
            type: 'tag',
            children: hasDynamicChildren
              ? []
              : this.parseChildren(child.children, sourceText),
            name,
            isBasic,
            selfClosing: child.kind === ts.SyntaxKind.JsxSelfClosingElement,
          }
        } else if (child.kind === ts.SyntaxKind.JsxExpression) {
          // strip empty expressions
          if (!child.expression) {
            return {
              type: 'text',
              content: '',
            }
          }

          // simplify trivial expressions, like TypeScript typecasts
          if (child.expression.kind === ts.SyntaxKind.AsExpression) {
            child = child.expression
          }

          if (child.expression.kind === ts.SyntaxKind.StringLiteral) {
            return {
              type: 'text',
              content: child.expression.text,
            }
          }

          // strip properties from ObjectExpressions
          // annoying (and who knows how many other exceptions we'll need to write) but necessary
          else if (
            child.expression.kind === ts.SyntaxKind.ObjectLiteralExpression
          ) {
            // i18next-react only accepts two props, any random single prop, and a format prop

            const nonFormatProperties = child.expression.properties.filter(
              (prop) => prop.name.text !== 'format'
            )
            const formatProperty = child.expression.properties.find(
              (prop) => prop.name.text === 'format'
            )

            // more than one property throw a warning in i18next-react, but still works as a key
            if (nonFormatProperties.length > 1) {
              this.emit(
                'warning',
                `The passed in object contained more than one variable - the object should look like {{ value, format }} where format is optional.`
              )

              return {
                type: 'text',
                content: '',
              }
            }

            // This matches the behaviour of the Trans component in i18next as of v13.0.2:
            // https://github.com/i18next/react-i18next/blob/0a4681e428c888fe986bcc0109eb19eab6ff2eb3/src/TransWithoutContext.js#L88
            const value = formatProperty
              ? `${nonFormatProperties[0].name.text}, ${formatProperty.initializer.text}`
              : nonFormatProperties[0].name.text

            return {
              type: 'js',
              content: `{{${value}}}`,
            }
          }

          // slice on the expression so that we ignore comments around it
          return {
            type: 'js',
            content: `{${sourceText.slice(
              child.expression.pos,
              child.expression.end
            )}}`,
          }
        } else {
          throw new Error('Unknown ast element when parsing jsx: ' + child.kind)
        }
      })
      .filter((child) => child.type !== 'text' || child.content)
  }
}
