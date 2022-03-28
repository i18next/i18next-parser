import { assert } from 'chai'
import JavascriptLexer from '../../src/lexers/javascript-lexer.js'

describe('JavascriptLexer', () => {
  it('extracts keys from translation components', (done) => {
    const Lexer = new JavascriptLexer()
    const content = 'i18n.t("first")'
    assert.deepEqual(Lexer.extract(content), [{ key: 'first' }])
    done()
  })

  it('extracts the second argument string literal as defaultValue', (done) => {
    const Lexer = new JavascriptLexer()
    const content = 'i18n.t("first", "bla")'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', defaultValue: 'bla' },
    ])
    done()
  })

  it('extracts the second argument template literal as defaultValue', (done) => {
    const Lexer = new JavascriptLexer()
    const content = 'i18n.t("first", `bla`)'
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

  it('emits a `warning` event if the option argument contains a spread operator', (done) => {
    const Lexer = new JavascriptLexer()
    const content = `{t('foo', { defaultValue: 'bar', ...spread })}`
    Lexer.on('warning', (message) => {
      assert.equal(message, 'Options argument is a spread operator : spread')
      done()
    })
    assert.deepEqual(Lexer.extract(content), [
      { key: 'foo', defaultValue: 'bar' },
    ])
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
    i18n.t('commentKey' + i)
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

    it('extracts first namespace when it is an array', () => {
      const Lexer = new JavascriptLexer()
      const content =
        'const ExtendedComponent = useTranslation(["foo", "baz"]); t("bar");'
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

    it('extracts namespace with a custom hook', () => {
      const Lexer = new JavascriptLexer({
        namespaceFunctions: ['useCustomTranslationHook'],
      })
      const content = 'const {t} = useCustomTranslationHook("foo"); t("bar");'
      assert.deepEqual(Lexer.extract(content), [
        { namespace: 'foo', key: 'bar' },
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

  it('extracts boolean options', () => {
    const Lexer = new JavascriptLexer()

    const content = 'i18n.t("headline", {ordinal: true, custom: false});'
    assert.deepEqual(Lexer.extract(content), [
      {
        key: 'headline',
        ordinal: true,
        custom: false,
      },
    ])
  })

  it('emits warnings on dynamic keys', () => {
    const Lexer = new JavascriptLexer()
    const content =
      'const bar = "bar"; i18n.t("foo"); i18n.t(bar); i18n.t(`foo.${bar}`); i18n.t(`babar`);'

    let warningCount = 0
    Lexer.on('warning', (warning) => {
      if (warning.indexOf('Key is not a string literal') === 0) {
        warningCount++
      }
    })

    assert.deepEqual(Lexer.extract(content), [
      {
        key: 'foo',
      },
      {
        key: 'babar',
      },
    ])
    assert.strictEqual(warningCount, 2)
  })

  it('extracts non-interpolated tagged templates', () => {
    const Lexer = new JavascriptLexer()
    const content = 'i18n.t`some-key`'
    assert.deepEqual(Lexer.extract(content), [
      {
        key: 'some-key',
      },
    ])
  })

  it('emits warnings on interpolated tagged templates', () => {
    const Lexer = new JavascriptLexer()
    const content = 'i18n.t`some-key${someVar}keykey`'

    let warningCount = 0
    Lexer.on('warning', (warning) => {
      if (
        warning.indexOf(
          'A key that is a template string must not have any interpolations.'
        ) === 0
      ) {
        warningCount++
      }
    })

    Lexer.extract(content)

    assert.equal(warningCount, 1)
  })

  it('extracts count options', () => {
    const Lexer = new JavascriptLexer({
      typeMap: { CountType: { count: '' } },
      parseGenerics: true,
    })

    const content = 'i18n.t<{count: number}>("key_count");'
    assert.deepEqual(Lexer.extract(content, 'file.ts'), [
      {
        key: 'key_count',
        count: '',
      },
    ])

    const content2 = `type CountType = {count : number};
  i18n.t<CountType>("key_count");`
    assert.deepEqual(Lexer.extract(content2, 'file.ts'), [
      {
        count: '',
        key: 'key_count',
      },
    ])

    const content3 = `type CountType = {count : number};
     i18n.t<CountType & {my_custom: number}>("key_count");`
    assert.deepEqual(Lexer.extract(content3, 'file.ts'), [
      {
        key: 'key_count',
        count: '',
        my_custom: '',
      },
    ])

    const content4 = `type CountType = {count : number};
     i18n.t<CountType | {my_custom: number}>("key_count");`
    assert.deepEqual(Lexer.extract(content4, 'file.ts'), [
      {
        key: 'key_count',
        count: '',
        my_custom: '',
      },
    ])
  })
})
