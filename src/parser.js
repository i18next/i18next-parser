import path from 'path'
import EventEmitter from 'events'
import HandlebarsLexer from './lexers/handlebars-lexer.js'
import HTMLLexer from './lexers/html-lexer.js'
import JavascriptLexer from './lexers/javascript-lexer.js'
import JsxLexer from './lexers/jsx-lexer.js'
import VueLexer from './lexers/vue-lexer.js'

const lexers = {
  hbs: ['HandlebarsLexer'],
  handlebars: ['HandlebarsLexer'],

  htm: ['HTMLLexer'],
  html: ['HTMLLexer'],

  mjs: ['JavascriptLexer'],
  js: ['JavascriptLexer'],
  ts: ['JavascriptLexer'],
  jsx: ['JsxLexer'],
  tsx: ['JsxLexer'],

  vue: ['VueLexer'],

  default: ['JavascriptLexer'],
}

const lexersMap = {
  HandlebarsLexer,
  HTMLLexer,
  JavascriptLexer,
  JsxLexer,
  VueLexer,
}

export default class Parser extends EventEmitter {
  constructor(options = {}) {
    super(options)
    this.options = options
    this.lexers = { ...lexers, ...options.lexers }
  }

  parse(content, filename) {
    let keys = []
    const extension = path.extname(filename).substr(1)
    const lexers = this.lexers[extension] || this.lexers.default

    for (const lexerConfig of lexers) {
      let lexerName
      let lexerOptions

      if (
        typeof lexerConfig === 'string' ||
        typeof lexerConfig === 'function'
      ) {
        lexerName = lexerConfig
        lexerOptions = {}
      } else {
        lexerName = lexerConfig.lexer
        lexerOptions = lexerConfig
      }

      let Lexer
      if (typeof lexerName === 'function') {
        Lexer = lexerName
      } else {
        if (!lexersMap[lexerName]) {
          this.emit('error', new Error(`Lexer '${lexerName}' does not exist`))
        }

        Lexer = lexersMap[lexerName]
      }

      const lexer = new Lexer(lexerOptions)
      lexer.on('warning', (warning) => this.emit('warning', warning))
      keys = keys.concat(lexer.extract(content, filename))
    }

    return keys
  }
}
