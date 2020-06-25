import { assert } from 'chai'

import JavascriptLexer from '../../src/lexers/javascript-lexer'

describe('JavascriptLexer', () => {
  it('extracts keys from translation components', (done) => {
    const Lexer = new JavascriptLexer()
    const content = 'i18n.t("first")'
    assert.deepEqual(Lexer.extract(content), [{ key: 'first' }])
    done()
  })

  it('extracts the second argument as defaultValue', (done) => {
    const Lexer = new JavascriptLexer()
    const content = 'i18n.t("first", "bla")'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', defaultValue: 'bla' },
    ])
    done()
  })

  it('extracts the defaultValue/context options', (done) => {
    const Lexer = new JavascriptLexer()
    const content = 'i18n.t("first", {defaultValue: "foo", context: \'bar\'})'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', defaultValue: 'foo', context: 'bar' },
    ])
    done()
  })

  it('extracts the defaultValue/context on multiple lines', (done) => {
    const Lexer = new JavascriptLexer()
    const content =
      'i18n.t("first", {\ndefaultValue: "foo",\n context: \'bar\'})'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', defaultValue: 'foo', context: 'bar' },
    ])
    done()
  })

  it('extracts the defaultValue/context options with quotation marks', (done) => {
    const Lexer = new JavascriptLexer()
    const content = 'i18n.t("first", {context: "foo", "defaultValue": \'bla\'})'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', defaultValue: 'bla', context: 'foo' },
    ])
    done()
  })

  it('extracts the defaultValue/context options with interpolated value', (done) => {
    const Lexer = new JavascriptLexer()
    const content =
      'i18n.t("first", {context: "foo", "defaultValue": \'{{var}} bla\'})'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', defaultValue: '{{var}} bla', context: 'foo' },
    ])
    done()
  })

  it('supports multiline and concatenation', (done) => {
    const Lexer = new JavascriptLexer()
    const content = 'i18n.t("foo" + \n "bar")'
    assert.deepEqual(Lexer.extract(content), [{ key: 'foobar' }])
    done()
  })

  it('supports multiline template literal keys', (done) => {
    const Lexer = new JavascriptLexer()
    const content = 'i18n.t(`foo\nbar`)'
    assert.deepEqual(Lexer.extract(content), [{ key: 'foo\nbar' }])
    done()
  })

  it('extracts keys from single line comments', (done) => {
    const Lexer = new JavascriptLexer()
    const content = `
    // i18n.t('commentKey1')
    // i18n.t('commentKey2')
    i18n.t(\`commentKey\${i}\`)
    // Irrelevant comment
    // i18n.t('commentKey3')
    `
    assert.deepEqual(Lexer.extract(content), [
      { key: 'commentKey1' },
      { key: 'commentKey2' },
      { key: 'commentKey3' },
    ])
    done()
  })

  it('extracts keys from multiline comments', (done) => {
    const Lexer = new JavascriptLexer()
    const content = `
    /*
      i18n.t('commentKey1')
      i18n.t('commentKey2')
    */
    i18n.t(\`commentKey\${i}\`)
    // Irrelevant comment
    /* i18n.t('commentKey3') */
    `
    assert.deepEqual(Lexer.extract(content), [
      { key: 'commentKey1' },
      { key: 'commentKey2' },
      { key: 'commentKey3' },
    ])
    done()
  })

  it("does not parse text with `doesn't` or isolated `t` in it", (done) => {
    const Lexer = new JavascriptLexer()
    const js =
      "// FIX this doesn't work and this t is all alone\nt('first')\nt = () => {}"
    assert.deepEqual(Lexer.extract(js), [{ key: 'first' }])
    done()
  })

  it('ignores functions that ends with a t', (done) => {
    const Lexer = new JavascriptLexer()
    const js = "ttt('first')"
    assert.deepEqual(Lexer.extract(js), [])
    done()
  })

  it('supports a `functions` option', (done) => {
    const Lexer = new JavascriptLexer({ functions: ['tt', '_e'] })
    const content = 'tt("first") + _e("second")'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first' },
      { key: 'second' },
    ])
    done()
  })

  it('supports async/await', (done) => {
    const Lexer = new JavascriptLexer()
    const content = 'const data = async () => await Promise.resolve()'
    Lexer.extract(content)
    done()
  })

  it('supports the spread operator', (done) => {
    const Lexer = new JavascriptLexer()
    const content =
      'const data = { text: t("foo"), ...rest }; const { text, ...more } = data;'
    assert.deepEqual(Lexer.extract(content), [{ key: 'foo' }])
    done()
  })

  it('supports dynamic imports', (done) => {
    const Lexer = new JavascriptLexer()
    const content = 'import("path/to/some/file").then(doSomethingWithData)'
    Lexer.extract(content)
    done()
  })

  it('supports the es7 syntax', (done) => {
    const Lexer = new JavascriptLexer()
    const content = '@decorator() class Test { test() { t("foo") } }'
    assert.deepEqual(Lexer.extract(content), [{ key: 'foo' }])
    done()
  })

  it('supports basic typescript syntax', () => {
    const Lexer = new JavascriptLexer()
    const content = 'i18n.t("first") as potato'
    assert.deepEqual(Lexer.extract(content), [{ key: 'first' }])
  })

  describe('useTranslation', () => {
    it('extracts default namespace', () => {
      const Lexer = new JavascriptLexer()
      const content = 'const {t} = useTranslation("foo"); t("bar");'
      assert.deepEqual(Lexer.extract(content), [
        { namespace: 'foo', key: 'bar' },
      ])
    })

    it('uses namespace from t function with priority', () => {
      const Lexer = new JavascriptLexer()
      const content =
        'const {t} = useTranslation("foo"); t("bar", {ns: "baz"});'
      assert.deepEqual(Lexer.extract(content), [
        { namespace: 'baz', key: 'bar', ns: 'baz' },
      ])
    })
  })

  describe('withTranslation', () => {
    it('extracts default namespace when it is a string', () => {
      const Lexer = new JavascriptLexer()
      const content =
        'const ExtendedComponent = withTranslation("foo")(MyComponent); t("bar");'
      assert.deepEqual(Lexer.extract(content), [
        { namespace: 'foo', key: 'bar' },
      ])
    })

    it('extracts first namespace when it is an array', () => {
      const Lexer = new JavascriptLexer()
      const content =
        'const ExtendedComponent = withTranslation(["foo", "baz"])(MyComponent); t("bar");'
      assert.deepEqual(Lexer.extract(content), [
        { namespace: 'foo', key: 'bar' },
      ])
    })

    it('uses namespace from t function with priority', () => {
      const Lexer = new JavascriptLexer()
      const content =
        'const ExtendedComponent = withTranslation("foo")(MyComponent); t("bar", {ns: "baz"});'
      assert.deepEqual(Lexer.extract(content), [
        { namespace: 'baz', key: 'bar', ns: 'baz' },
      ])
    })
  })

  it('extracts custom options', () => {
    const Lexer = new JavascriptLexer()

    const content = 'i18n.t("headline", {description: "Fantastic key!"});'
    assert.deepEqual(Lexer.extract(content), [
      {
        key: 'headline',
        description: 'Fantastic key!',
      },
    ])
  })
})
