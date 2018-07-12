import JavascriptLexer from './javascript-lexer'
import * as walk from 'acorn/dist/walk'
import injectAcornJsx from 'acorn-jsx/inject'

const JSXParserExtension = {
  JSXText(node, st, c) {
    // We need this catch, but we don't need the catch to do anything.
  },
  JSXEmptyExpression(node, st, c) {
    // We need this catch, but we don't need the catch to do anything.
  },
  JSXElement(node, st, c) {
    node.openingElement.attributes.forEach(attr => c(attr, st, attr.type))
    node.children.forEach(child => c(child, st, child.type))
  },
  JSXExpressionContainer(node, st, c) {
    c(node.expression, st, node.expression.type)
  },
  JSXAttribute(node, st, c) {
    if (node.value !== null) {
      c(node.value, st, node.value.type)
    }
  },
  JSXSpreadAttribute(node, st, c) {
    c(node.argument, st, node.argument.type)
  }
}

export default class JsxLexer extends JavascriptLexer {
  constructor(options = {}) {
    super(options)

    // super will setup acornOptions, acorn and the walker, just add what we need
    this.acornOptions.plugins.jsx = true
    this.WalkerBase = Object.assign({}, this.WalkerBase, {
      ...JSXParserExtension
    })

    this.acorn = injectAcornJsx(this.acorn)
  }

  extract(content) {
    const that = this

    walk.simple(
      this.acorn.parse(content, this.acornOptions),
      {
        CallExpression(node) {
          that.expressionExtractor.call(that, node)
        },
        JSXElement(node) {
          const element = node.openingElement
          if (element.name.name === "Trans") {
            const entry = {}
            const defaultValue = that.nodeToString.call(that, node, content)

            for (const attr of element.attributes) {
              if (attr.name.name === that.attr) {
                entry.key = attr.value.value
              }
            }

            if (defaultValue !== '') {
              entry.defaultValue = defaultValue

              if (!entry.key)
                entry.key = entry.defaultValue
            }

            if (entry.key)
              that.keys.push(entry)
          }

          else if (element.name.name === "Interpolate") {
            const entry = {}

            for (const attr of element.attributes) {
              if (attr.name.name === that.attr) {
                entry.key = attr.value.value
              }
            }

            if (entry.key)
              that.keys.push(entry)
          }
        }
      },
      this.WalkerBase
    )

    return this.keys
  }

  nodeToString(ast, string) {
    const children = this.parseAcornPayload(ast.children, string)

    const elemsToString = children => children.map((child, index) => {
      switch(child.type) {
        case 'text': return child.content
        case 'js': return `<${index}>${child.content}</${index}>`
        case 'tag': return `<${index}>${elemsToString(child.children)}</${index}>`
        default: throw new ParsingError('Unknown parsed content: ' + child.type)
      }
    }).join('')

    return elemsToString(children)
  }

  parseAcornPayload(children, originalString) {
    return children.map(child => {
      if (child.type === 'JSXText') {
        return {
          type: 'text',
          content: child.value.replace(/^(?:\s*(\n|\r)\s*)?(.*)(?:\s*(\n|\r)\s*)?$/, '$2')
        }
      }
      else if (child.type === 'JSXElement') {
        return {
          type: 'tag',
          children: this.parseAcornPayload(child.children, originalString)
        }
      }
      else if (child.type === 'JSXExpressionContainer') {
        // strip empty expressions
        if (child.expression.type === 'JSXEmptyExpression')
          return {
            type: 'text',
            content: ''
          }

        // strip properties from ObjectExpressions
        // annoying (and who knows how many other exceptions we'll need to write) but necessary
        else if (child.expression.type === 'ObjectExpression') {
          // i18next-react only accepts two props, any random single prop, and a format prop
          // for our purposes, format prop is always ignored

          let nonFormatProperties = child.expression.properties.filter(prop => prop.key.name !== 'format')

          // more than one property throw a warning in i18next-react, but still works as a key
          if (nonFormatProperties.length > 1) {
            this.emit('warning', `The passed in object contained more than one variable - the object should look like {{ value, format }} where format is optional.`)

            return {
              type: 'text',
              content: ''
            }
          }

          return {
            type: 'js',
            content: `{{${nonFormatProperties[0].key.name}}}`
          }
        }

        // slice on the expression so that we ignore comments around it
        return {
          type: 'js',
          content: `{${originalString.slice(child.expression.start, child.expression.end)}}`
        }
      }
      else {
        throw new ParsingError('Unknown ast element when parsing jsx: ' + child.type)
      }
    }).filter(child => child.type !== 'text' || child.content)
  }
}
