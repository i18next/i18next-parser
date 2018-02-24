import EventEmitter from 'events'

export default class BaseLexer extends EventEmitter {
  constructor(options = {}) {
    super()
    this.keys = []
    this.functions = options.functions || ['t']
  }

  populateKeysFromArguments(args) {
    const firstArgument = args.arguments[0]
    const secondArgument = args.arguments[1]
    const isKeyString = this.validateString(firstArgument)
    const isDefaultValueString = this.validateString(secondArgument)

    if (!isKeyString) {
      this.emit('warning', `Key is not a string litteral: ${firstArgument}`)
    }
    else {
      const result = {
        ...args.options,
        key: firstArgument.slice(1, -1)
      }
      if (isDefaultValueString) {
        result.defaultValue = secondArgument.slice(1, -1)
      }
      this.keys.push(result)
    }
  }

  validateString(string) {
    const regex = new RegExp('^' + BaseLexer.stringPattern + '$', 'i')
    return regex.test(string)
  }

  functionPattern() {
    return '(?:' + this.functions.join('|').replace('.', '\\.') + ')'
  }

  static get singleQuotePattern() {
    return "'(?:[^'].*?[^\\\\])?'"
  }

  static get doubleQuotePattern() {
    return '"(?:[^"].*?[^\\\\])?"'
  }

  static get backQuotePattern() {
    return '`(?:[^`].*?[^\\\\])?`'
  }

  static get variablePattern() {
    return '(?:[A-Z0-9_.-]+)'
  }

  static get stringPattern() {
    return (
      '(?:' +
      [
        BaseLexer.singleQuotePattern,
        BaseLexer.doubleQuotePattern
      ].join('|') +
      ')'
    )
  }

  static get stringOrVariablePattern() {
    return (
      '(?:' +
      [
        BaseLexer.singleQuotePattern,
        BaseLexer.doubleQuotePattern,
        BaseLexer.variablePattern
      ].join('|') +
      ')'
    )
  }
}
