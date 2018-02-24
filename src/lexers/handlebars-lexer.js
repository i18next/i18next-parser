import BaseLexer from './base-lexer'

export default class HandlebarsLexer extends BaseLexer {
  constructor(options = {}) {
    super(options)

    this.functions = options.functions || ['t']

    this.createFunctionRegex()
    this.createArgumentsRegex()
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
      const arg = matches[1]
      const parts = arg.split('=')
      result.arguments.push(arg)
      if (parts.length === 2 && this.validateString(parts[1])) {
        result.options[parts[0]] = parts[1].slice(1, -1)
      }
    }
    return result
  }

  createFunctionRegex() {
    const functionPattern = this.functionPattern()
    const curlyPattern = '(?:{{)' + functionPattern + '\\s+(.*)(?:}})'
    const parenthesisPattern = '(?:\\()' + functionPattern + '\\s+(.*)(?:\\))'
    const pattern = curlyPattern + '|' + parenthesisPattern
    this.functionRegex = new RegExp(pattern, 'gi')
    return this.functionRegex
  }

  createArgumentsRegex() {
    const pattern =
      '(?:\\s+|^)' +
      '(' +
        '(?:' +
          BaseLexer.variablePattern +
          '(?:=' + BaseLexer.stringOrVariablePattern + ')?' +
        ')' +
        '|' +
        BaseLexer.stringPattern +
      ')'
    this.argumentsRegex = new RegExp(pattern, 'gi')
    return this.argumentsRegex
  }
}
