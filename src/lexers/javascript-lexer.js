import * as acorn from 'acorn'
import injectAcornStage3 from "acorn-stage3/inject"
import injectAcornEs7 from "acorn-es7"
import injectAcornObjectRestSpread from "acorn-object-rest-spread/inject"
import * as walk from 'acorn/dist/walk'
import BaseLexer from './base-lexer'

const WalkerBase = Object.assign({}, walk.base, {
  Import(node, st, c) {
    // We need this catch, but we don't need the catch to do anything.
  }
})

export default class JavascriptLexer extends BaseLexer {
  constructor(options = {}) {
    super(options)

    this.acornOptions = {
      sourceType: 'module',
      ecmaVersion: 9,
      ...options.acorn,
      plugins: {
        stage3: true,
        es7: true,
        ...(options.acorn ? options.acorn.plugins : {})
      }
    }

    this.functions = options.functions || ['t']
    this.attr = options.attr || 'i18nKey'

    this.acorn = acorn
    this.WalkerBase = WalkerBase

    if (this.acornOptions.plugins) {
      if (this.acornOptions.plugins.stage3) {
        this.acorn = injectAcornStage3(this.acorn)
      }
      if (this.acornOptions.plugins.es7) {
        injectAcornEs7(this.acorn)
      }
      if (this.acornOptions.plugins.objectRestSpread) {
        injectAcornObjectRestSpread(this.acorn)
      }
    }
  }

  extract(content) {
    const that = this

    walk.simple(
      this.acorn.parse(content, this.acornOptions),
      {
        CallExpression(node) {
          that.expressionExtractor.call(that, node)
        }
      },
      this.WalkerBase
    )

    return this.keys
  }

  expressionExtractor(node) {
    const entry = {}
    const isTranslationFunction = (
      node.callee && (
        this.functions.includes(node.callee.name) ||
        node.callee.property && this.functions.includes(node.callee.property.name)
      )
    )
    if (isTranslationFunction) {
      const keyArgument = node.arguments.shift()

      if (keyArgument && keyArgument.type === 'Literal') {
        entry.key = keyArgument.value
      }
      else if (keyArgument && keyArgument.type === 'BinaryExpression') {
        const concatenatedString = this.concatenateString(keyArgument)
        if (!concatenatedString) {
          this.emit('warning', `Key is not a string literal: ${keyArgument.name}`)
          return
        }
        entry.key = concatenatedString
      }
      else {
        if (keyArgument.type === 'Identifier') {
          this.emit('warning', `Key is not a string literal: ${keyArgument.name}`)
        }

        return
      }


      const optionsArgument = node.arguments.shift()

      if (optionsArgument && optionsArgument.type === 'Literal') {
        entry.defaultValue = optionsArgument.value
      }
      else if (optionsArgument && optionsArgument.type === 'ObjectExpression') {
        for (const p of optionsArgument.properties) {
          entry[p.key.name || p.key.value] = p.value.value
        }
      }

      this.keys.push(entry)
    }
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
