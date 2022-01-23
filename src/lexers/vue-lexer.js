import VueTemplateCompiler from 'vue-template-compiler'
import BaseLexer from './base-lexer.js'
import JavascriptLexer from './javascript-lexer.js'

export default class VueLexer extends BaseLexer {
  constructor(options = {}) {
    super(options)

    this.functions = options.functions || ['$t']
  }

  extract(content, filename) {
    let keys = []

    const Lexer = new JavascriptLexer()
    Lexer.on('warning', (warning) => this.emit('warning', warning))
    keys = keys.concat(Lexer.extract(content))

    const compiledTemplate = VueTemplateCompiler.compile(content).render
    const Lexer2 = new JavascriptLexer({ functions: this.functions })
    Lexer2.on('warning', (warning) => this.emit('warning', warning))
    keys = keys.concat(Lexer2.extract(compiledTemplate))

    return keys
  }
}
