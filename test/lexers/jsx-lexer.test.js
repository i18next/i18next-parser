import { assert } from 'chai'
import JsxLexer from '../../src/lexers/jsx-lexer'

export function testJsxLexer(JsxLexer) {
  describe('<Interpolate>', () => {
    it('extracts keys from i18nKey attributes', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Interpolate i18nKey="first" />'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first' }
      ])
      done()
    })
  })

  describe('<Trans>', () => {
    it('extracts keys from i18nKey attributes from closing tags', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans i18nKey="first" count={count}>Yo</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first', defaultValue: 'Yo' }
      ])
      done()
    })

    it('extracts keys from user-defined key attributes from closing tags', (done) => {
      const Lexer = new JsxLexer({ attr: "myIntlKey" })
      const content = '<Trans myIntlKey="first" count={count}>Yo</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first', defaultValue: 'Yo' }
      ])
      done()
    })

    it('extracts keys from i18nKey attributes from self-closing tags', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans i18nKey="first" count={count} />'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first' }
      ])
      done()
    })

    it('extracts keys from user-defined key attributes from self-closing tags', (done) => {
      const Lexer = new JsxLexer({ attr: "myIntlKey" })
      const content = '<Trans myIntlKey="first" count={count} />'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first' }
      ])
      done()
    })

    it('extracts keys from Trans elements without an i18nKey', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans count={count}>Yo</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'Yo', defaultValue: 'Yo' }
      ])
      done()
    })

    it('extracts keys from Trans elements and ignores values of expressions and spaces', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans count={count}>{{ key: property }}</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: '<0>{{key}}</0>', defaultValue: '<0>{{key}}</0>' }
      ])
      done()
    })

    it('invalid interpolation gets stripped', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans count={count}>before{{ key1, key2 }}after</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'beforeafter', defaultValue: 'beforeafter' }
      ])
      done()
    })

    it('doesn\'t add a blank key for self-closing or empty tags', (done) => {
      const Lexer = new JsxLexer()

      const emptyTag = '<Trans count={count}></Trans>'
      assert.deepEqual(Lexer.extract(emptyTag), [])

      const selfClosing = '<Trans count={count}/>'
      assert.deepEqual(Lexer.extract(selfClosing), [])

      done()
    })

    it('erases tags from content', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans>a<b test={"</b>"}>c<c>z</c></b>{d}<br stuff={y}/></Trans>'
      assert.equal(Lexer.extract(content)[0].defaultValue, 'a<1>c<1>z</1></1><2>{d}</2><3></3>')
      done()
    })

    it('erases comment expressions', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans>{/* some comment */}Some Content</Trans>'
      assert.equal(Lexer.extract(content)[0].defaultValue, 'Some Content')
      done()
    })
  })
}

describe('JsxLexer', () => {
  testJsxLexer(JsxLexer)
})
