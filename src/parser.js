import EventEmitter from 'events'
import HandlebarsLexer from './lexers/handlebars-lexer'
import HTMLLexer from './lexers/html-lexer'
import JavascriptLexer from './lexers/javascript-lexer'
import path from 'path'

const lexers = {
  hbs: ['HandlebarsLexer'],
  handlebars: ['HandlebarsLexer'],

  htm: ['HTMLLexer'],
  html: ['HTMLLexer'],

  js: ['JavascriptLexer'],
  mjs: ['JavascriptLexer'],

  default: ['JavascriptLexer']
}

const lexersMap = {
  HandlebarsLexer,
  HTMLLexer,
  JavascriptLexer
}

export default class Parser extends EventEmitter {
  constructor(options = {}) {
    super(options)
    this.lexers = { ...lexers, ...options }
  }

  parse(content, extension) {
    let keys = []
    const lexers = this.lexers[extension] || this.lexers.default

    lexers.forEach(lexerConfig => {
      let lexerName
      let lexerOptions

      if (typeof lexerConfig === 'string') {
        lexerName = lexerConfig
        lexerOptions = {}
      }
      else {
        lexerName = lexerConfig.lexer
        delete lexerConfig.lexer
        lexerOptions = lexerConfig
      }

      if (!lexersMap[lexerName]) {
        this.emit('error', new Error(`Lexer '${lexerName}' does not exist`))
      }

      const Lexer = new lexersMap[lexerName](lexerOptions)
      Lexer.on('warning', warning => this.emit('warning', warning))
      keys = keys.concat(Lexer.extract(content))
    })

    return keys
  }
}
