import BaseLexer from './base-lexer.js'
import ts from 'typescript'

export default class JavascriptLexer extends BaseLexer {
  constructor(options = {}) {
    super(options)

    this.callPattern = '(?<=^|\\s|\\.)' + this.functionPattern() + '\\(.*\\)'
    this.functions = options.functions || ['t']
    this.namespaceFunctions = options.namespaceFunctions || [
      'useTranslation',
      'withTranslation',
    ]
    this.attr = options.attr || 'i18nKey'
    this.parseGenerics = options.parseGenerics || false
    this.typeMap = options.typeMap || {}
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

  setKeyPrefixes(keys) {
    if (this.keyPrefix) {
      return keys.map((key) => ({
        ...key,
        keyPrefix: this.keyPrefix,
      }))
    }

    return keys
  }

  extract(content, filename = '__default.js') {
    const keys = []

    const parseCommentNode = this.createCommentNodeParser()

    const parseTree = (node) => {
      parseCommentNode(keys, node, content)

      if (
        node.kind === ts.SyntaxKind.ArrowFunction ||
        node.kind === ts.SyntaxKind.FunctionDeclaration
      ) {
        this.functionParamExtractor.call(this, node)
      }

      if (node.kind === ts.SyntaxKind.TaggedTemplateExpression) {
        const entry = this.taggedTemplateExpressionExtractor.call(this, node)
        if (entry) {
          keys.push(entry)
        }
      }

      if (node.kind === ts.SyntaxKind.CallExpression) {
        const entries = this.expressionExtractor.call(this, node)
        if (entries) {
          keys.push(...entries)
        }
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

  /** @param {ts.FunctionLikeDeclaration} node */
  functionParamExtractor(node) {
    const tFunctionParam =
      node.parameters &&
      node.parameters.find(
        (param) =>
          param.name &&
          param.name.kind === ts.SyntaxKind.Identifier &&
          this.functions.includes(param.name.text)
      )

    if (
      tFunctionParam &&
      tFunctionParam.type &&
      tFunctionParam.type.typeName &&
      tFunctionParam.type.typeName.text === 'TFunction'
    ) {
      const { typeArguments } = tFunctionParam.type
      if (
        typeArguments &&
        typeArguments.length &&
        typeArguments[0].kind === ts.SyntaxKind.LiteralType
      ) {
        this.defaultNamespace = typeArguments[0].literal.text
      }
    }
  }

  taggedTemplateExpressionExtractor(node) {
    const entry = {}

    const { tag, template } = node

    const isTranslationFunction =
      (tag.text && this.functions.includes(tag.text)) ||
      (tag.name && this.functions.includes(tag.name.text))

    if (!isTranslationFunction) return null

    if (template.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
      entry.key = template.text
    } else if (template.kind === ts.SyntaxKind.TemplateExpression) {
      this.emit(
        'warning',
        'A key that is a template string must not have any interpolations.'
      )
      return null
    }

    return entry
  }

  expressionExtractor(node) {
    const entries = [{}]

    if (
      this.namespaceFunctions.includes(node.expression.escapedText) &&
      node.arguments.length
    ) {
      const namespaceArgument = node.arguments[0]
      const optionsArgument = node.arguments[1]
      // The namespace argument can be either an array of namespaces or a single namespace,
      // so we convert it to an array in the case of a single namespace so that we can use
      // the same code in both cases
      const namespaces = namespaceArgument.elements || [namespaceArgument]

      // Find the first namespace that is a string literal, or is `undefined`. In the case
      // of `undefined`, we do nothing (see below), leaving the default namespace unchanged
      const namespace = namespaces.find(
        (ns) =>
          ns.kind === ts.SyntaxKind.StringLiteral ||
          (ns.kind === ts.SyntaxKind.Identifier && ns.text === 'undefined')
      )

      if (!namespace) {
        // We know that the namespace argument was provided, so if we're unable to find a
        // namespace, emit a warning since this will likely cause issues for the user
        this.emit(
          'warning',
          namespaceArgument.kind === ts.SyntaxKind.Identifier
            ? `Namespace is not a string literal nor an array containing a string literal: ${namespaceArgument.text}`
            : 'Namespace is not a string literal nor an array containing a string literal'
        )
      } else if (namespace.kind === ts.SyntaxKind.StringLiteral) {
        // We found a string literal namespace, so we'll use this instead of the default
        this.defaultNamespace = namespace.text
      }

      if (
        optionsArgument &&
        optionsArgument.kind === ts.SyntaxKind.ObjectLiteralExpression
      ) {
        const keyPrefixNode = optionsArgument.properties.find(
          (p) => p.name.escapedText === 'keyPrefix'
        )
        if (keyPrefixNode != null) {
          this.keyPrefix = keyPrefixNode.initializer.text
        }
      }
    }

    const isTranslationFunction =
      // If the expression is a string literal, we can just check if it's in the
      // list of functions
      (node.expression.text && this.functions.includes(node.expression.text)) ||
      // Support the case where the function is contained in a namespace, i.e.
      // match `i18n.t()` when this.functions = ['t'].
      (node.expression.name &&
        this.functions.includes(node.expression.name.text)) ||
      // Support matching the namespace as well, i.e. match `i18n.t()` but _not_
      // `l10n.t()` when this.functions = ['i18n.t']
      this.functions.includes(this.expressionToName(node.expression))

    if (isTranslationFunction) {
      const keyArgument = node.arguments.shift()

      if (!keyArgument) {
        return null
      }

      if (
        keyArgument.kind === ts.SyntaxKind.StringLiteral ||
        keyArgument.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral
      ) {
        entries[0].key = keyArgument.text
      } else if (keyArgument.kind === ts.SyntaxKind.BinaryExpression) {
        const concatenatedString = this.concatenateString(keyArgument)
        if (!concatenatedString) {
          this.emit(
            'warning',
            `Key is not a string literal: ${keyArgument.text}`
          )
          return null
        }
        entries[0].key = concatenatedString
      } else {
        this.emit(
          'warning',
          keyArgument.kind === ts.SyntaxKind.Identifier
            ? `Key is not a string literal: ${keyArgument.text}`
            : 'Key is not a string literal'
        )
        return null
      }

      if (this.parseGenerics && node.typeArguments) {
        let typeArgument = node.typeArguments.shift()

        const parseTypeArgument = (typeArg) => {
          if (!typeArg) {
            return
          }
          if (typeArg.kind === ts.SyntaxKind.TypeLiteral) {
            for (const member of typeArg.members) {
              entries[0][member.name.text] = ''
            }
          } else if (
            typeArg.kind === ts.SyntaxKind.TypeReference &&
            typeArg.typeName.kind === ts.SyntaxKind.Identifier
          ) {
            const typeName = typeArg.typeName.text
            if (typeName in this.typeMap) {
              Object.assign(entries[0], this.typeMap[typeName])
            }
          } else if (Array.isArray(typeArg.types)) {
            typeArgument.types.forEach((tp) => parseTypeArgument(tp))
          }
        }

        parseTypeArgument(typeArgument)
      }

      let optionsArgument = node.arguments.shift()

      // Second argument could be a (concatenated) string default value
      if (
        optionsArgument &&
        (optionsArgument.kind === ts.SyntaxKind.StringLiteral ||
          optionsArgument.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral)
      ) {
        entries[0].defaultValue = optionsArgument.text
        optionsArgument = node.arguments.shift()
      } else if (
        optionsArgument &&
        optionsArgument.kind === ts.SyntaxKind.BinaryExpression
      ) {
        const concatenatedString = this.concatenateString(optionsArgument)
        if (!concatenatedString) {
          this.emit(
            'warning',
            `Default value is not a string literal: ${optionsArgument.text}`
          )
          return null
        }
        entries[0].defaultValue = concatenatedString
        optionsArgument = node.arguments.shift()
      }

      if (
        optionsArgument &&
        optionsArgument.kind === ts.SyntaxKind.ObjectLiteralExpression
      ) {
        for (const p of optionsArgument.properties) {
          if (p.kind === ts.SyntaxKind.SpreadAssignment) {
            this.emit(
              'warning',
              `Options argument is a spread operator : ${p.expression.text}`
            )
          } else if (p.initializer) {
            if (p.initializer.kind === ts.SyntaxKind.TrueKeyword) {
              entries[0][p.name.text] = true
            } else if (p.initializer.kind === ts.SyntaxKind.FalseKeyword) {
              entries[0][p.name.text] = false
            } else if (p.initializer.kind === ts.SyntaxKind.CallExpression) {
              const nestedEntries = this.expressionExtractor(p.initializer)
              if (nestedEntries) {
                entries.push(...nestedEntries)
              }
            } else {
              entries[0][p.name.text] = p.initializer.text || ''
            }
          } else {
            entries[0][p.name.text] = ''
          }
        }
      }

      if (entries[0].ns) {
        if (typeof entries[0].ns === 'string') {
          entries[0].namespace = entries[0].ns
        } else if (typeof entries.ns === 'object' && entries.ns.length) {
          entries[0].namespace = entries[0].ns[0]
        }
      }

      return entries
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

  /**
   * Recursively computes the name of a dot-separated expression, e.g. `t` or `t.ns`
   * @type {(expression: ts.LeftHandSideExpression | ts.JsxTagNameExpression) => string}
   */
  expressionToName(expression) {
    if (expression) {
      if (expression.text) {
        return expression.text
      } else if (expression.name) {
        return [
          this.expressionToName(expression.expression),
          this.expressionToName(expression.name),
        ]
          .filter((s) => s && s.length > 0)
          .join('.')
      }
    }
    return undefined
  }
}
