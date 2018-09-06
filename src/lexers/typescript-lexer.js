import JsxLexer from './jsx-lexer'
import { readFileSync } from 'fs'
import { join } from 'path'

let loadedTs = null
function loadTypeScript() {
  if (loadedTs) {
    return loadedTs;
  }

  try {
    loadedTs = require('typescript')
  } catch (e) {
    throw new ParsingError(`You must install typescript to parse TypeScript files. Try running "yarn install typescript"`)
  }

  return loadedTs
}

export default class TypescriptLexer extends JsxLexer {
  constructor(options = {}) {
    super(options);
    this.tsOptions = options.tsOptions
  }

  extract(content, extension) {
    const transpiled = loadTypeScript().transpileModule(content, {
      compilerOptions: {
        ...this.tsOptions,
        jsx: 'Preserve'
      }
    })

    return super.extract(transpiled.outputText)
  }
}
