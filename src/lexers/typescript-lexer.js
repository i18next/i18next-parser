import JsxLexer from './jsx-lexer'
import { readFileSync } from 'fs'
import { join } from 'path'

export default class TypescriptLexer extends JsxLexer {
  constructor(options = {}) {
    super(options)
    this.tsOptions = options.tsOptions
    try {
      this.typescript = require('typescript')
    } catch (e) {
      throw new Error(
        'You must install typescript to parse TypeScript files. ' +
        'Try running "yarn add typescript" or "npm install typescript"'
      )
    }
  }

  extract(content, extension) {
    const transpiled = this.typescript.transpileModule(content, {
      compilerOptions: {
        ...this.tsOptions,
        jsx: 'Preserve',
        target: 'esnext'
      }
    })

    return super.extract(transpiled.outputText)
  }
}
