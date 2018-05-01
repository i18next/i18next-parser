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

    it('extracts keys from Trans elements without an i18nKey', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans count={count}>Yo</Trans>'
      assert.deepEqual(Lexer.extractTrans(content), [
        { key: 'Yo', defaultValue: 'Yo' }
      ])
      done()
    })

    it('doesn\'t add a blank key for self-closing or empty tags', (done) => {
      const Lexer = new JsxLexer()
      
      const emptyTag = '<Trans count={count}></Trans>'
      assert.deepEqual(Lexer.extractTrans(emptyTag), [])

      const selfClosing = '<Trans count={count}/>'
      assert.deepEqual(Lexer.extractTrans(selfClosing), [])

      done()
    })
  })

  describe('eraseTags()', () => {
    it('erases tags from content', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans>a<b test={"</b>"}>c<c>z</c></b>{d}<br stuff={y}/></Trans>'
      assert.equal(Lexer.eraseTags(content), 'a<1>c<1>z</1></1><2>{d}</2><3></3>')
      done()
    })
  })
})
