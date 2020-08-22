import BaseLexer from './base-lexer'
import * as ts from 'typescript'

export default class JavascriptLexer extends BaseLexer {
  constructor(options = {}) {
    super(options)

    this.callPattern = '(?<=^|\\s|\\.)' + this.functionPattern() + '\\(.*\\)'
    this.functions = options.functions || ['t']
    this.attr = options.attr || 'i18nKey'
  }

  createCommentNodeParser() {
    const visitedComments = new Set()

    return (keys, node, content) => {
      ts.forEachLeadingCommentRange(
        content,
        node.getFullStart(),
        (pos, end, kind) => {
          const commentId = `${pos}_${end}`
          if (
            (kind === ts.SyntaxKind.MultiLineCommentTrivia ||
              kind === ts.SyntaxKind.SingleLineCommentTrivia) &&
            !visitedComments.has(commentId)
          ) {
            visitedComments.add(commentId)
            const text = content.slice(pos, end)
            const commentKeys = this.commentExtractor.call(this, text)
            if (commentKeys) {
              keys.push(...commentKeys)
            }
          }
        }
      )
    }
  }

  setNamespaces(keys) {
    if (this.defaultNamespace) {
      return keys.map((entry) => ({
        ...entry,
        namespace: entry.namespace || this.defaultNamespace,
      }))
    }

    return keys
  }

  extract(content, filename = '__default.js') {
    const keys = []

    const parseCommentNode = this.createCommentNodeParser()

    const parseTree = (node) => {
      let entry

      parseCommentNode(keys, node, content)

      if (node.kind === ts.SyntaxKind.CallExpression) {
        entry = this.expressionExtractor.call(this, node)
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

    return this.setNamespaces(keys)
  }

  expressionExtractor(node) {
    const entry = {}

    if (
      node.expression.escapedText === 'useTranslation' &&
      node.arguments.length
    ) {
      this.defaultNamespace = node.arguments[0].text
    }

    if (
      node.expression.escapedText === 'withTranslation' &&
      node.arguments.length
    ) {
      const { text, elements } = node.arguments[0]
      if (text) {
        this.defaultNamespace = text
      } else if (elements && elements.length) {
        this.defaultNamespace = elements[0].text
      }
    }

    const isTranslationFunction =
      (node.expression.text && this.functions.includes(node.expression.text)) ||
      (node.expression.name &&
        this.functions.includes(node.expression.name.text))

    if (isTranslationFunction) {
      const keyArgument = node.arguments.shift()

      if (!keyArgument) {
        return null
      }

      if (
        keyArgument.kind === ts.SyntaxKind.StringLiteral ||
        keyArgument.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral
      ) {
        entry.key = keyArgument.text
      } else if (keyArgument.kind === ts.SyntaxKind.BinaryExpression) {
        const concatenatedString = this.concatenateString(keyArgument)
        if (!concatenatedString) {
          this.emit(
            'warning',
            `Key is not a string literal: ${keyArgument.text}`
          )
          return null
        }
        entry.key = concatenatedString
      } else {
        if (keyArgument.kind === ts.SyntaxKind.Identifier) {
          this.emit(
            'warning',
            `Key is not a string literal: ${keyArgument.text}`
          )
        }
        return null
      }

      let optionsArgument = node.arguments.shift()

      // Second argument could be a string default value
      if (
        optionsArgument &&
        optionsArgument.kind === ts.SyntaxKind.StringLiteral
      ) {
        entry.defaultValue = optionsArgument.text
        optionsArgument = node.arguments.shift()
      }

      if (
        optionsArgument &&
        optionsArgument.kind === ts.SyntaxKind.ObjectLiteralExpression
      ) {
        for (const p of optionsArgument.properties) {
          entry[p.name.text] = (p.initializer && p.initializer.text) || ''
        }
      }

      if (entry.ns) {
        if (typeof entry.ns === 'string') {
          entry.namespace = entry.ns
        } else if (typeof entry.ns === 'object' && entry.ns.length) {
          entry.namespace = entry.ns[0]
        }
      }

      return entry
    }

    return null
  }

  commentExtractor(commentText) {
    const regexp = new RegExp(this.callPattern, 'g')
    const expressions = commentText.match(regexp)

    if (!expressions) {
      return null
    }

    const keys = []
    expressions.forEach((expression) => {
      const expressionKeys = this.extract(expression)
      if (expressionKeys) {
        keys.push(...expressionKeys)
      }
    })
    return keys
  }

  concatenateString(binaryExpression, string = '') {
    if (binaryExpression.operatorToken.kind !== ts.SyntaxKind.PlusToken) {
      return
    }

    if (binaryExpression.left.kind === ts.SyntaxKind.BinaryExpression) {
      string += this.concatenateString(binaryExpression.left, string)
    } else if (binaryExpression.left.kind === ts.SyntaxKind.StringLiteral) {
      string += binaryExpression.left.text
    } else {
      return
    }

    if (binaryExpression.right.kind === ts.SyntaxKind.BinaryExpression) {
      string += this.concatenateString(binaryExpression.right, string)
    } else if (binaryExpression.right.kind === ts.SyntaxKind.StringLiteral) {
      string += binaryExpression.right.text
    } else {
      return
    }

    return string
  }
}
