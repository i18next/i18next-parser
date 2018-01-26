import BaseLexer from './base-lexer'

export default class JavascriptLexer extends BaseLexer {

  constructor(options = {}) {
    super(options)

    this.functions = options.functions || ['t']

    this.createFunctionRegex()
    this.createArgumentsRegex()
    this.createHashRegex()
  }

  extract(content) {
    let matches

    while (matches = this.functionRegex.exec(content)) {
      const args = this.parseArguments(matches[1] || matches[2])
      this.populateKeysFromArguments(args)
    }

    return this.keys
  }

  parseArguments(args) {
    let matches
    const result = {
      arguments: [],
      options: {}
    }
    while (matches = this.argumentsRegex.exec(args)) {
      let arg = matches[1]

      if (arg.startsWith('{')) {
        let optionMatches
        while (optionMatches = this.hashRegex.exec(args)) {
          const key = optionMatches[2]
          let value = optionMatches[3]
          if (this.validateString(value)) {
            result.options[key] = value.slice(1, -1)
          }
        }
      }
      else {
        arg = this.concatenateString(arg)
      }
      result.arguments.push(arg)
    }
    return result
  }

  concatenateString(string) {
    string = string.trim()
    let matches
    let containsVariable = false
    const parts = []
    const quotationMark = string.charAt(0) === '"' ? '"' : '\''

    const regex = new RegExp(JavascriptLexer.concatenatedSegmentPattern, 'gi')
    while(matches = regex.exec(string)) {
      const match = matches[0].trim()
      if (match !== '+') {
        parts.push(match)
      }
    }

    const result = parts.reduce(
      (concatenatedString, x) => {
        x = x && x.trim()
        if (this.validateString(x)) {
          concatenatedString += x.slice(1, -1)
        }
        else {
          containsVariable = true
        }
        return concatenatedString
      },
      ''
    )
    if (!result || containsVariable) {
      return string
    }
    else {
      return quotationMark + result + quotationMark
    }
  }

  static get concatenatedSegmentPattern() {
    return (
      [
        BaseLexer.singleQuotePattern,
        BaseLexer.doubleQuotePattern,
        BaseLexer.backQuotePattern,
        BaseLexer.variablePattern,
        '(?:\\s*\\+\\s*)' // support for concatenation via +
      ].join('|')
    )
  }

  static get concatenatedArgumentPattern() {
    return (
      '(' +
      '(?:' +
      JavascriptLexer.concatenatedSegmentPattern +
      ')+' +
      ')'
    )
  }

  static get hashPattern() {
    return '(\\{[^}]*\\})'
  }

  static get stringOrVariableOrHashPattern() {
    return (
      '(' +
      '(' +
      '(?:' +
      [
        JavascriptLexer.concatenatedArgumentPattern,
        JavascriptLexer.hashPattern,
      ].join('|') +
      ')' +
      '(?:\\s*,\\s*)?' +
      ')+' +
      ')'
    )
  }

  createFunctionRegex() {
    const pattern = (
      '(?:\\W|^)' +
      this.functionPattern() + '\\s*\\(\\s*' +
        JavascriptLexer.stringOrVariableOrHashPattern +
      '\\s*\\)'
    )
    this.functionRegex = new RegExp(pattern, 'gi')
    return this.functionRegex
  }

  createArgumentsRegex() {
    const pattern = (
      '(' +
      [
        JavascriptLexer.concatenatedArgumentPattern,
        JavascriptLexer.hashPattern,
      ].join('|') +
      ')' +
      '(?:\\s*,\\s*)?'
    )
    this.argumentsRegex = new RegExp(pattern, 'gi')
    return this.argumentsRegex
  }

  createHashRegex() {
    const pattern = (
      '(?:(\'|")?(' +
      [
        'context',
        'defaultValue'
      ].join('|') +
      ')\\1)' +
      '(?:\\s*:\\s*)' +
      '(' + BaseLexer.stringPattern + ')'
    )
    this.hashRegex = new RegExp(pattern, 'gi')
    return this.hashRegex
  }
}
