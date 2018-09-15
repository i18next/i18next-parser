import EventEmitter from 'events'
import HandlebarsLexer from './lexers/handlebars-lexer'
import HTMLLexer from './lexers/html-lexer'
import JavascriptLexer from './lexers/javascript-lexer'
import JsxLexer from './lexers/jsx-lexer'
import TypescriptLexer from './lexers/typescript-lexer'

const lexers = {
  hbs: ['HandlebarsLexer'],
  handlebars: ['HandlebarsLexer'],

  htm: ['HTMLLexer'],
  html: ['HTMLLexer'],

  js: ['JavascriptLexer'],
  jsx: ['JsxLexer'],
  mjs: ['JavascriptLexer'],

  ts: ['TypescriptLexer'],
  tsx: ['TypescriptLexer'],

  default: ['JavascriptLexer']
}

const lexersMap = {
  HandlebarsLexer,
  HTMLLexer,
  JavascriptLexer,
  JsxLexer,
  TypescriptLexer
}

export default class Parser extends EventEmitter {
  constructor(options = {}) {
    super(options)
    this.options = options

    if (options.reactNamespace) {
      lexers.js = lexers.jsx
    }

    this.lexers = { ...lexers, ...options.lexers }
  }

  parse(content, extension) {
    let keys = []
    const lexers = this.lexers[extension] || this.lexers.default

    for (const lexerConfig of lexers) {
      let lexerName
      let lexerOptions

      if (typeof lexerConfig === 'string') {
        lexerName = lexerConfig
        lexerOptions = {}
      }
      else {
        lexerName = lexerConfig.lexer
        lexerOptions = lexerConfig
      }

      if (!lexersMap[lexerName]) {
        this.emit('error', new Error(`Lexer '${lexerName}' does not exist`))
      }

      const Lexer = new lexersMap[lexerName](lexerOptions)
      Lexer.on('warning', warning => this.emit('warning', warning))
      keys = keys.concat(Lexer.extract(content))
    }

    return keys
  }
}
