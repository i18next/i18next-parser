import { assert } from 'chai'
import JsxLexer from '../../src/lexers/jsx-lexer'

describe('JsxLexer', () => {
  describe('extractInterpolate', () => {
    it('extracts keys from i18nKey attributes', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Interpolate i18nKey="first" />'
      assert.deepEqual(Lexer.extractInterpolate(content), [
        { key: 'first' }
      ])
      done()
    })
  })

  describe('Trans', () => {
    it('extracts keys from i18nKey attributes from closing tags', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans i18nKey="first" count={count}>Yo</Trans>'
      assert.deepEqual(Lexer.extractTrans(content), [
        { key: 'first', defaultValue: 'Yo' }
      ])
      done()
    })

    it('extracts keys from i18nKey attributes from self-closing tags', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans i18nKey="first" count={count} />'
      assert.deepEqual(Lexer.extractTrans(content), [
        { key: 'first' }
      ])
      done()
    })
  })
})
