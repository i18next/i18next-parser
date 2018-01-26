import { assert } from 'chai'
import HTMLLexer from '../../src/lexers/html-lexer'

describe('HTMLLexer', function () {
  it('extracts keys from html attributes', function (done) {
    const Lexer = new HTMLLexer()
    const content = '<p data-i18n="first;second"></p>'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'first' },
        { key: 'second' }
      ]
    )
    done()
  })

  it('ignores leading [] of the key', function (done) {
    const Lexer = new HTMLLexer()
    const content = '<p data-i18n="[title]first;[prepend]second"></p>'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'first' },
        { key: 'second' }
      ]
    )
    done()
  })

  it('supports the defaultValue option', function (done) {
    const Lexer = new HTMLLexer()
    const content = '<p data-i18n="first" data-i18n-options=\'{"defaultValue": "bla"}\'>first</p>'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'first', defaultValue: 'bla' }
      ]
    )
    done()
  })

  it('grabs the default from innerHTML if missing', function (done) {
    const Lexer = new HTMLLexer()
    const content = '<p data-i18n>first</p>'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'first' }
      ]
    )
    done()
  })

  it('supports multiline', function (done) {
    const Lexer = new HTMLLexer()
    const content =
      '<p data-i18n="[title]third;fourth">Fourth</p>' +
      '<p\n title=""\n bla\n data-i18n="first"\n data-i18n-options=\'{"defaultValue": "bar"}\'></p>'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'third' },
        { key: 'fourth' },
        { key: 'first', defaultValue: 'bar' }
      ]
    )
    done()
  })

  it('skip if no key is found', function (done) {
    const Lexer = new HTMLLexer()
    const content = '<p data-i18n></p>'
    assert.deepEqual(
      Lexer.extract(content),
      []
    )
    done()
  })

  it('supports a `attr` option', function (done) {
    const Lexer = new HTMLLexer({attr: 'data-other'})
    const content = '<p data-other="first;second"></p>'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'first' },
        { key: 'second' }
      ]
    )
    done()
  })

  it('supports a `optionAttr` option', function (done) {
    const Lexer = new HTMLLexer({optionAttr: 'data-other-options'})
    const content = '<p data-i18n="first" data-other-options=\'{"defaultValue": "bar"}\'></p>'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'first', defaultValue: 'bar' }
      ]
    )
    done()
  })

  describe('parseAttributes()', function () {
    it('extracts attribute value from string', function (done) {
      const Lexer = new HTMLLexer()
      assert.deepEqual(
        Lexer.parseAttributes('title="" bla data-i18n="key1"', 'data-i18n'),
        {
          keys: 'key1',
          options: {}
        }
      )
      done()
    })

    it('extracts json strings too', function (done) {
      const Lexer = new HTMLLexer()
      assert.deepEqual(
        Lexer.parseAttributes('data-i18n="key1;key2" data-i18n-options=\'{"defaultValue": "bla"}\'', 'data-i18n-options'),
        {
          keys: 'key1;key2',
          options: {
            defaultValue: 'bla'
          }
        }
      )
      done()
    })

    it('supports multiline', function (done) {
      const Lexer = new HTMLLexer()
      assert.deepEqual(
        Lexer.parseAttributes('title=""\n bla\n data-i18n="first"\n data-i18n-options=\'{"defaultValue": "bar"}\''),
        {
          keys: 'first',
          options: {
            defaultValue: 'bar'
          }
        }
      )
      done()
    })
  })
})
