import { assert } from 'chai'
import sinon from 'sinon'
import JsxLexer from '../../src/lexers/jsx-lexer.js'

describe('JsxLexer', () => {
  describe('<Interpolate>', () => {
    it('extracts keys from i18nKey attributes', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Interpolate i18nKey="first" />'
      assert.deepEqual(Lexer.extract(content), [{ key: 'first' }])
      done()
    })
  })

  describe('<Translation>', () => {
    it('extracts keys from render prop', (done) => {
      const Lexer = new JsxLexer()
      const content = `<Translation>{(t) => <>{t("first", "Main")}{t("second")}</>}</Translation>`
      assert.deepEqual(Lexer.extract(content), [
        { defaultValue: 'Main', key: 'first' },
        { key: 'second' },
      ])
      done()
    })

    it('sets ns (namespace) for expressions within render prop', (done) => {
      const Lexer = new JsxLexer()
      const content = `<Translation ns="foo">{(t) => t("first")}</Translation>`
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first', namespace: 'foo' },
      ])
      done()
    })
  })

  describe('<Trans>', () => {
    it('extracts keys from i18nKey attributes from closing tags', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans i18nKey="first" count={count}>Yo</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first', defaultValue: 'Yo', count: '{count}' },
      ])
      done()
    })

    it('extracts default value from string literal `defaults` prop', (done) => {
      const Lexer = new JsxLexer()
      const content =
        '<Trans i18nKey="first" defaults="test-value">should be ignored</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first', defaultValue: 'test-value' },
      ])
      done()
    })

    it('extracts default value from interpolated expression statement `defaults` prop', (done) => {
      const Lexer = new JsxLexer()
      const content =
        '<Trans i18nKey="first" defaults={"test-value"}>should be ignored</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first', defaultValue: 'test-value' },
      ])
      done()
    })

    it('extracts keys from user-defined key attributes from closing tags', (done) => {
      const Lexer = new JsxLexer({ attr: 'myIntlKey' })
      const content = '<Trans myIntlKey="first" count={count}>Yo</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first', defaultValue: 'Yo', count: '{count}' },
      ])
      done()
    })

    it('extracts keys from i18nKey attributes from self-closing tags', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans i18nKey="first" count={count} />'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first', count: '{count}' },
      ])
      done()
    })

    it('extracts keys from user-defined key attributes from self-closing tags', (done) => {
      const Lexer = new JsxLexer({ attr: 'myIntlKey' })
      const content = '<Trans myIntlKey="first" count={count} />'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first', count: '{count}' },
      ])
      done()
    })

    it('extracts custom attributes', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans customAttribute="Youpi">Yo</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'Yo', defaultValue: 'Yo', customAttribute: 'Youpi' },
      ])
      done()
    })

    it('extracts boolean attributes', (done) => {
      const Lexer = new JsxLexer()
      const content =
        '<Trans ordinal customTrue={true} customFalse={false}>Yo</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        {
          key: 'Yo',
          defaultValue: 'Yo',
          ordinal: true,
          customTrue: true,
          customFalse: false,
        },
      ])
      done()
    })

    it('extracts keys from Trans elements without an i18nKey', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans count={count}>Yo</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'Yo', defaultValue: 'Yo', count: '{count}' },
      ])
      done()
    })

    it('extracts keys from Trans elements without an i18nKey, but with a defaults prop', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans defaults="Steve">{{ name }}</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: '{{name}}', defaultValue: 'Steve' },
      ])
      done()
    })

    it('extracts keys from Trans elements without an i18nKey, with defaults, and without children', (done) => {
      const Lexer = new JsxLexer()
      // Based on https://react.i18next.com/latest/trans-component#alternative-usage-components-array
      const content = `
<Trans
  defaults="hello <0>{{what}}</0>"
  values={{
    what: "world"
  }}
  components={[<strong />]}
/>
`.trim()
      assert.deepEqual(Lexer.extract(content), [
        {
          key: 'hello <0>{{what}}</0>',
          defaultValue: 'hello <0>{{what}}</0>',
          components: '{[<strong />]}',
          values: '{{ what: "world" }}',
        },
      ])
      done()
    })

    it('extracts keys from Trans elements and ignores values of expressions and spaces', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans count={count}>{{ key: property }}</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: '{{key}}', defaultValue: '{{key}}', count: '{count}' },
      ])
      done()
    })

    it('extracts formatted interpolations correctly', (done) => {
      const Lexer = new JsxLexer()
      const content =
        '<Trans count={count}>{{ key: property, format: "number" }}</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        {
          key: '{{key, number}}',
          defaultValue: '{{key, number}}',
          count: '{count}',
        },
      ])
      done()
    })

    it('extracts keys from user-defined components', (done) => {
      const Lexer = new JsxLexer({
        componentFunctions: [
          'Translate',
          'FooBar',
          'Namespace.A',
          'Double.Namespace.B',
        ],
      })
      const content = `<div>
      <Translate i18nKey="something">Something to translate.</Translate>
      <NotSupported i18nKey="jkl">asdf</NotSupported>
      <NotSupported.Translate i18nKey="jkl">asdf</NotSupported.Translate>
      <FooBar i18nKey="asdf">Lorum Ipsum</FooBar>
      <Namespace.A i18nKey="namespaced">Namespaced</Namespace.A>
      <Double.Namespace.B i18nKey="namespaced2">Namespaced2</Double.Namespace.B>
      </div>
      `
      assert.deepEqual(Lexer.extract(content), [
        { key: 'something', defaultValue: 'Something to translate.' },
        { key: 'asdf', defaultValue: 'Lorum Ipsum' },
        { key: 'namespaced', defaultValue: 'Namespaced' },
        { key: 'namespaced2', defaultValue: 'Namespaced2' },
      ])
      done()
    })

    it('extracts keys from single line comments', (done) => {
      const Lexer = new JsxLexer()
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
      const Lexer = new JsxLexer()
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

    it('invalid interpolation gets stripped', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans count={count}>before{{ key1, key2 }}after</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'beforeafter', defaultValue: 'beforeafter', count: '{count}' },
      ])
      done()
    })

    it("doesn't add a blank key for self-closing or empty tags", (done) => {
      const Lexer = new JsxLexer()

      const emptyTag = '<Trans count={count}></Trans>'
      assert.deepEqual(Lexer.extract(emptyTag), [])

      const selfClosing = '<Trans count={count}/>'
      assert.deepEqual(Lexer.extract(selfClosing), [])

      done()
    })

    it('erases tags from content', (done) => {
      const Lexer = new JsxLexer()
      const content =
        '<Trans>a<b test={"</b>"}>c<c>z</c></b>{d}<br stuff={y}/></Trans>'
      assert.equal(
        Lexer.extract(content)[0].defaultValue,
        'a<1>c<1>z</1></1>{d}<3></3>'
      )
      done()
    })

    it('skips dynamic children', (done) => {
      const Lexer = new JsxLexer()
      const content =
        '<Trans>My dogs are named: <ul i18nIsDynamicList>{["rupert", "max"].map(dog => (<li>{dog}</li>))}</ul></Trans>'
      assert.equal(
        Lexer.extract(content)[0].defaultValue,
        'My dogs are named: <1></1>'
      )
      done()
    })

    it('handles spread attributes', (done) => {
      const Lexer = new JsxLexer()
      const content =
        '<Trans>My dog is named: <span {...styles}>Spot</span></Trans>'
      assert.equal(
        Lexer.extract(content)[0].defaultValue,
        'My dog is named: <1>Spot</1>'
      )
      done()
    })

    it('erases comment expressions', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans>{/* some comment */}Some Content</Trans>'
      assert.equal(Lexer.extract(content)[0].defaultValue, 'Some Content')
      done()
    })

    it('handles jsx fragments', (done) => {
      const Lexer = new JsxLexer()
      const content = '<><Trans i18nKey="first" /></>'
      assert.deepEqual(Lexer.extract(content), [{ key: 'first' }])
      done()
    })

    it('interpolates literal string values', (done) => {
      const Lexer = new JsxLexer()
      const content = `<Trans>Some{' '}Interpolated {'Content'}</Trans>`
      assert.equal(
        Lexer.extract(content)[0].defaultValue,
        'Some Interpolated Content'
      )
      done()
    })

    it('uses the ns (namespace) prop', (done) => {
      const Lexer = new JsxLexer()
      const content = `<Trans ns="foo">bar</Trans>`
      assert.deepEqual(Lexer.extract(content), [
        { key: 'bar', defaultValue: 'bar', namespace: 'foo' },
      ])
      done()
    })

    it('uses the ns (namespace) prop with curly braces syntax', (done) => {
      const Lexer = new JsxLexer()
      const content = `<Trans ns={'foo'}>bar</Trans>`
      assert.deepEqual(Lexer.extract(content), [
        { key: 'bar', defaultValue: 'bar', namespace: 'foo' },
      ])
      done()
    })

    it('emits a `warning` event if the component attribute is a JSX spread attribute', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans defaults="bar" {...spread} />'
      Lexer.on('warning', (message) => {
        assert.equal(
          message,
          'Component attribute is a JSX spread attribute : spread'
        )
        done()
      })
      assert.deepEqual(Lexer.extract(content), [{ defaultValue: 'bar' }])
    })
  })

  describe('supports TypeScript', () => {
    it('supports basic tsx syntax', () => {
      const Lexer = new JsxLexer()
      const content = '<Interpolate i18nKey="first" someVar={foo() as bar} />'
      assert.deepEqual(Lexer.extract(content), [{ key: 'first' }])
    })

    describe('<Interpolate>', () => {
      it('extracts keys from i18nKey attributes', (done) => {
        const Lexer = new JsxLexer()
        const content = '<Interpolate i18nKey="first" />'
        assert.deepEqual(Lexer.extract(content), [{ key: 'first' }])
        done()
      })
    })

    describe('<Trans>', () => {
      it('extracts keys from i18nKey attributes from closing tags', (done) => {
        const Lexer = new JsxLexer()
        const content = '<Trans i18nKey="first" count={count}>Yo</Trans>'
        assert.deepEqual(Lexer.extract(content), [
          { key: 'first', defaultValue: 'Yo', count: '{count}' },
        ])
        done()
      })

      it('extracts keys from user-defined key attributes from closing tags', (done) => {
        const Lexer = new JsxLexer({ attr: 'myIntlKey' })
        const content = '<Trans myIntlKey="first" count={count}>Yo</Trans>'
        assert.deepEqual(Lexer.extract(content), [
          { key: 'first', defaultValue: 'Yo', count: '{count}' },
        ])
        done()
      })

      it('extracts keys from i18nKey attributes from self-closing tags', (done) => {
        const Lexer = new JsxLexer()
        const content = '<Trans i18nKey="first" count={count} />'
        assert.deepEqual(Lexer.extract(content), [
          { key: 'first', count: '{count}' },
        ])
        done()
      })

      it('does not extract variable identifier from i18nKey as key', (done) => {
        const Lexer = new JsxLexer()
        const content = '<Trans i18nKey={variable} />'
        assert.deepEqual(Lexer.extract(content), [])
        done()
      })

      it('extracts keys from user-defined key attributes from self-closing tags', (done) => {
        const Lexer = new JsxLexer({ attr: 'myIntlKey' })
        const content = '<Trans myIntlKey="first" count={count} />'
        assert.deepEqual(Lexer.extract(content), [
          { key: 'first', count: '{count}' },
        ])
        done()
      })

      it('extracts keys from Trans elements without an i18nKey', (done) => {
        const Lexer = new JsxLexer()
        const content = '<Trans count={count}>Yo</Trans>'
        assert.deepEqual(Lexer.extract(content), [
          { key: 'Yo', defaultValue: 'Yo', count: '{count}' },
        ])
        done()
      })

      it('extracts keys from Trans elements and ignores values of expressions and spaces', (done) => {
        const Lexer = new JsxLexer()
        const content = '<Trans count={count}>{{ key: property }}</Trans>'
        assert.deepEqual(Lexer.extract(content), [
          { key: '{{key}}', defaultValue: '{{key}}', count: '{count}' },
        ])
        done()
      })

      it('strips invalid interpolation', (done) => {
        const Lexer = new JsxLexer()
        const content =
          '<Trans count={count}>before{{ key1, key2 }}after</Trans>'
        assert.deepEqual(Lexer.extract(content), [
          { key: 'beforeafter', defaultValue: 'beforeafter', count: '{count}' },
        ])
        done()
      })

      it("doesn't add a blank key for self-closing or empty tags", (done) => {
        const Lexer = new JsxLexer()

        const emptyTag = '<Trans count={count}></Trans>'
        assert.deepEqual(Lexer.extract(emptyTag), [])

        const selfClosing = '<Trans count={count}/>'
        assert.deepEqual(Lexer.extract(selfClosing), [])

        done()
      })

      it('erases tags from content', (done) => {
        const Lexer = new JsxLexer()
        const content =
          '<Trans>a<b test={"</b>"}>c<c>z</c></b>{d}<br stuff={y}/></Trans>'
        assert.equal(
          Lexer.extract(content)[0].defaultValue,
          'a<1>c<1>z</1></1>{d}<3></3>'
        )
        done()
      })

      it('erases comment expressions', (done) => {
        const Lexer = new JsxLexer()
        const content = '<Trans>{/* some comment */}Some Content</Trans>'
        assert.equal(Lexer.extract(content)[0].defaultValue, 'Some Content')
        done()
      })

      it('erases typecasts', (done) => {
        const Lexer = new JsxLexer()
        const content = '<Trans>{{ key: property } as any}</Trans>'
        assert.deepEqual(Lexer.extract(content), [
          { key: '{{key}}', defaultValue: '{{key}}' },
        ])
        done()
      })

      it('keeps self-closing tags untouched when transSupportBasicHtmlNodes is true', (done) => {
        const Lexer = new JsxLexer({ transSupportBasicHtmlNodes: true })
        const content = '<Trans>a<br />b</Trans>'
        assert.equal(Lexer.extract(content)[0].defaultValue, 'a<br/>b')
        done()
      })

      it('keeps empty tag untouched when transSupportBasicHtmlNodes is true', (done) => {
        const Lexer = new JsxLexer({ transSupportBasicHtmlNodes: true })
        const content = '<Trans>a<strong></strong>b</Trans>'
        assert.equal(
          Lexer.extract(content)[0].defaultValue,
          'a<strong></strong>b'
        )
        done()
      })

      it('does not unescape i18nKey', (done) => {
        const Lexer = new JsxLexer()
        const content =
          '<Trans i18nKey="I&apos;m testing">I&apos;m Cielquan</Trans>'
        assert.equal(Lexer.extract(content)[0].key, 'I&apos;m testing')
        done()
      })

      it('unescapes key when i18nKey is not provided', (done) => {
        const Lexer = new JsxLexer()
        const content = '<Trans>I&apos;m Cielquan</Trans>'
        assert.equal(Lexer.extract(content)[0].key, "I'm Cielquan")
        done()
      })

      it('supports the shouldUnescape options', (done) => {
        const Lexer = new JsxLexer()
        const content = '<Trans shouldUnescape>I&apos;m Cielquan</Trans>'
        assert.equal(Lexer.extract(content)[0].key, "I'm Cielquan")
        assert.equal(
          Lexer.extract(content)[0].defaultValue,
          'I&apos;m Cielquan'
        )
        done()
      })

      it('supports multi-step casts', (done) => {
        const Lexer = new JsxLexer()
        const content =
          '<Trans>Hi, {{ name: "John" } as unknown as string}</Trans>'
        assert.equal(Lexer.extract(content)[0].defaultValue, 'Hi, {{name}}')
        done()
      })

      it('supports variables in identity functions', (done) => {
        const Lexer = new JsxLexer({
          transIdentityFunctionsToIgnore: ['funcCall'],
        })
        const content = '<Trans>Hi, {funcCall({ name: "John" })}</Trans>'
        assert.equal(Lexer.extract(content)[0].defaultValue, 'Hi, {{name}}')
        done()
      })

      it('emits warning on non-literal child', (done) => {
        const Lexer = new JsxLexer({
          transIdentityFunctionsToIgnore: ['funcCall'],
        })
        const content = '<Trans>Hi, {anotherFuncCall({ name: "John" })}</Trans>'
        Lexer.on('warning', (message) => {
          assert.equal(
            message,
            'Child is not literal: anotherFuncCall({ name: "John" })'
          )
        })
        assert.equal(
          Lexer.extract(content)[0].defaultValue,
          'Hi, {anotherFuncCall({ name: "John" })}'
        )
        done()
      })

      it('does not emit a warning about non-literal child when defaults and i18nKey are specified', (done) => {
        const Lexer = new JsxLexer({
          transIdentityFunctionsToIgnore: ['funcCall'],
        })
        const content =
          '<Trans i18nKey="testkey" defaults="test">{anotherFuncCall({ name: "John" })}</Trans>'
        const spy = sinon.spy()
        Lexer.on('warning', spy)
        assert.equal(Lexer.extract(content)[0].defaultValue, 'test')
        assert.isFalse(spy.called)
        done()
      })
    })
  })
})
