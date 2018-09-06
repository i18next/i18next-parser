import { assert } from 'chai'
import { testJavaScriptLexer } from './javascript-lexer.test'
import { testJsxLexer } from './jsx-lexer.test'
import TypescriptLexer from '../../src/lexers/typescript-lexer'

describe('TypeScript lexer', () => {
  testJavaScriptLexer(TypescriptLexer)
  testJsxLexer(TypescriptLexer)

  it('supports typescript syntax', () => {
    const Lexer = new TypescriptLexer()
    const content = 'i18n.t("first") as potato'
    assert.deepEqual(Lexer.extract(content), [{ key: 'first' }])
  })

  it('supports tsx syntax', () => {
    const Lexer = new TypescriptLexer()
    const content = '<Interpolate i18nKey="first" someVar={foo() as bar} />'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first' }
    ])
  })
})
