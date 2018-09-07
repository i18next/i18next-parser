import { assert } from 'chai'
import TypescriptLexer from '../../src/lexers/typescript-lexer'

describe('TypeScript lexer', () => {
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

  describe('<Interpolate>', () => {
    it('extracts keys from i18nKey attributes', (done) => {
      const Lexer = new TypescriptLexer()
      const content = '<Interpolate i18nKey="first" />'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first' }
      ])
      done()
    })
  })

  describe('<Trans>', () => {
    it('extracts keys from i18nKey attributes from closing tags', (done) => {
      const Lexer = new TypescriptLexer()
      const content = '<Trans i18nKey="first" count={count}>Yo</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first', defaultValue: 'Yo' }
      ])
      done()
    })

    it('extracts keys from user-defined key attributes from closing tags', (done) => {
      const Lexer = new TypescriptLexer({ attr: "myIntlKey" })
      const content = '<Trans myIntlKey="first" count={count}>Yo</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first', defaultValue: 'Yo' }
      ])
      done()
    })

    it('extracts keys from i18nKey attributes from self-closing tags', (done) => {
      const Lexer = new TypescriptLexer()
      const content = '<Trans i18nKey="first" count={count} />'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first' }
      ])
      done()
    })

    it('extracts keys from user-defined key attributes from self-closing tags', (done) => {
      const Lexer = new TypescriptLexer({ attr: "myIntlKey" })
      const content = '<Trans myIntlKey="first" count={count} />'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first' }
      ])
      done()
    })

    it('extracts keys from Trans elements without an i18nKey', (done) => {
      const Lexer = new TypescriptLexer()
      const content = '<Trans count={count}>Yo</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'Yo', defaultValue: 'Yo' }
      ])
      done()
    })

    it('extracts keys from Trans elements and ignores values of expressions and spaces', (done) => {
      const Lexer = new TypescriptLexer()
      const content = '<Trans count={count}>{{ key: property }}</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: '<0>{{key}}</0>', defaultValue: '<0>{{key}}</0>' }
      ])
      done()
    })

    it('invalid interpolation gets stripped', (done) => {
      const Lexer = new TypescriptLexer()
      const content = '<Trans count={count}>before{{ key1, key2 }}after</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'beforeafter', defaultValue: 'beforeafter' }
      ])
      done()
    })

    it('doesn\'t add a blank key for self-closing or empty tags', (done) => {
      const Lexer = new TypescriptLexer()

      const emptyTag = '<Trans count={count}></Trans>'
      assert.deepEqual(Lexer.extract(emptyTag), [])

      const selfClosing = '<Trans count={count}/>'
      assert.deepEqual(Lexer.extract(selfClosing), [])

      done()
    })

    it('erases tags from content', (done) => {
      const Lexer = new TypescriptLexer()
      const content = '<Trans>a<b test={"</b>"}>c<c>z</c></b>{d}<br stuff={y}/></Trans>'
      assert.equal(Lexer.extract(content)[0].defaultValue, 'a<1>c<1>z</1></1><2>{d}</2><3></3>')
      done()
    })

    it('erases comment expressions', (done) => {
      const Lexer = new TypescriptLexer()
      const content = '<Trans>{/* some comment */}Some Content</Trans>'
      assert.equal(Lexer.extract(content)[0].defaultValue, 'Some Content')
      done()
    })
  })
  it('extracts keys from translation components', (done) => {
    const Lexer = new TypescriptLexer()
    const content = 'i18n.t("first")'
    assert.deepEqual(Lexer.extract(content), [{ key: 'first' }])
    done()
  })

  it('extracts the second argument as defaultValue', (done) => {
    const Lexer = new TypescriptLexer()
    const content = 'i18n.t("first", "bla")'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', defaultValue: 'bla' }
    ])
    done()
  })

  it('extracts the defaultValue/context options', (done) => {
    const Lexer = new TypescriptLexer()
    const content = 'i18n.t("first", {defaultValue: "foo", context: \'bar\'})'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', defaultValue: 'foo', context: 'bar' }
    ])
    done()
  })

  it('extracts the defaultValue/context on multiple lines', (done) => {
    const Lexer = new TypescriptLexer()
    const content = 'i18n.t("first", {\ndefaultValue: "foo",\n context: \'bar\'})'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', defaultValue: 'foo', context: 'bar' }
    ])
    done()
  })

  it('extracts the defaultValue/context options with quotation marks', (done) => {
    const Lexer = new TypescriptLexer()
    const content = 'i18n.t("first", {context: "foo", "defaultValue": \'bla\'})'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', defaultValue: 'bla', context: 'foo' }
    ])
    done()
  })

  it('extracts the defaultValue/context options with interpolated value', (done) => {
    const Lexer = new TypescriptLexer()
    const content = 'i18n.t("first", {context: "foo", "defaultValue": \'{{var}} bla\'})'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', defaultValue: '{{var}} bla', context: 'foo' }
    ])
    done()
  })

  it('supports multiline and concatenation', (done) => {
    const Lexer = new TypescriptLexer()
    const content = 'i18n.t("foo" + \n "bar")'
    assert.deepEqual(Lexer.extract(content), [{ key: 'foobar' }])
    done()
  })

  it("does not parse text with `doesn't` or isolated `t` in it", (done) => {
    const Lexer = new TypescriptLexer()
    const js = "// FIX this doesn't work and this t is all alone\nt('first')\nt = () => {}"
    assert.deepEqual(Lexer.extract(js), [{ key: 'first' }])
    done()
  })

  it('ignores functions that ends with a t', (done) => {
    const Lexer = new TypescriptLexer()
    const js = "ttt('first')"
    assert.deepEqual(Lexer.extract(js), [])
    done()
  })

  it('supports a `functions` option', (done) => {
    const Lexer = new TypescriptLexer({ functions: ['tt', '_e'] })
    const content = 'tt("first") + _e("second")'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first' },
      { key: 'second' }
    ])
    done()
  })

  it('supports async/await', (done) => {
    const Lexer = new TypescriptLexer({ acorn: { ecmaVersion: 8 } })
    const content = 'const data = async () => await Promise.resolve()'
    Lexer.extract(content)
    done()
  })

  it('supports the acorn-es7 plugin', (done) => {
    const Lexer = new TypescriptLexer({ acorn: { plugins: { es7: true } } })
    const content = '@decorator() class Test { test() { t("foo") } }'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'foo' }
    ])
    done()
  })

  it('supports the spread operator in objects plugin', (done) => {
    const Lexer = new TypescriptLexer({ acorn: { ecmaVersion: 9 } })
    const content = 'const data = { text: t("foo"), ...rest }; const { text, ...more } = data;'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'foo' }
    ])
    done()
  })

  describe('supports the acorn-stage3 plugin', () => {

    it('supports dynamic imports', (done) => {
      const Lexer = new TypescriptLexer({ acorn: { ecmaVersion: 6, plugins: { stage3: true } } })
      const content = 'import("path/to/some/file").then(doSomethingWithData)'
      Lexer.extract(content)
      done()
    })

  })
})
