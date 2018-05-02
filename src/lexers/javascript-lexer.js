import * as acorn from 'acorn'
import * as walk from 'acorn/dist/walk'
import { ParsingError } from '../helpers'
import BaseLexer from './base-lexer'

export default class JavascriptLexer extends BaseLexer {
  constructor(options = {}) {
    super(options)

    this.acornOptions = { sourceType: 'module', ...options.acorn }
    this.functions = options.functions || ['t']
  }

  extract(content) {
    const that = this

    walk.simple(
      acorn.parse(content, this.acornOptions),
      {
        Expression(node) {
          let entry = {}
          const isTranslationFunction = (
            node.type === 'CallExpression' &&
            node.callee && (
              that.functions.includes(node.callee.name) ||
              node.callee.property && that.functions.includes(node.callee.property.name)
            )
          )
          if (isTranslationFunction) {
            const keyArgument = node.arguments.shift()

            if (keyArgument && keyArgument.type === 'Literal') {
              entry.key = keyArgument.value
            }
            else if (keyArgument && keyArgument.type === 'BinaryExpression') {
              const concatenatedString = that.concatenateString(keyArgument)
              if (!concatenatedString) {
                return
              }
              entry.key = concatenatedString
            }
            else {
              return
            }


            const optionsArgument = node.arguments.shift()

            if (optionsArgument && optionsArgument.type === 'Literal') {
              entry.defaultValue = optionsArgument.value
            }
            else if (optionsArgument && optionsArgument.type === 'ObjectExpression') {
              optionsArgument.properties.forEach(p => {
                entry[p.key.name || p.key.value] = p.value.value
              })
            }

            that.keys.push(entry)
          }
        }
      }
    )

    return this.keys
  }

  concatenateString(binaryExpression, string = '') {
    if (binaryExpression.operator !== '+') {
      return
    }

    if (binaryExpression.left.type === 'BinaryExpression') {
      string += this.concatenateString(binaryExpression.left, string)
    }
    else if (binaryExpression.left.type === 'Literal') {
      string += binaryExpression.left.value
    }
    else {
      return
    }

    if (binaryExpression.right.type === 'BinaryExpression') {
      string += this.concatenateString(binaryExpression.right, string)
    }
    else if (binaryExpression.right.type === 'Literal') {
      string += binaryExpression.right.value
    }
    else {
      return
    }

    return string
  }
}
