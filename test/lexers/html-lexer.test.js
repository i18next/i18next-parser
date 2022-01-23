import { assert } from 'chai'
import HTMLLexer from '../../src/lexers/html-lexer.js'

describe('HTMLLexer', () => {
  it('extracts keys from html attributes', (done) => {
    const Lexer = new HTMLLexer()
    const content = '<p data-i18n="first;second"></p>'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first' },
      { key: 'second' },
    ])
    done()
  })

  it('ignores leading [] of the key', (done) => {
    const Lexer = new HTMLLexer()
    const content = '<p data-i18n="[title]first;[prepend]second"></p>'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first' },
      { key: 'second' },
    ])
    done()
  })

  it('supports the defaultValue option', (done) => {
    const Lexer = new HTMLLexer()
    const content =
      '<p data-i18n="first" data-i18n-options=\'{"defaultValue": "bla"}\'>first</p>'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', defaultValue: 'bla' },
    ])
    done()
  })

  it('grabs the default from innerHTML if missing', (done) => {
    const Lexer = new HTMLLexer()
    const content = '<p data-i18n>first</p>'
    assert.deepEqual(Lexer.extract(content), [{ key: 'first' }])
    done()
  })

  it('supports multiline', (done) => {
    const Lexer = new HTMLLexer()
    const content =
      '<p data-i18n="[title]third;fourth">Fourth</p>' +
      '<p\n title=""\n bla\n data-i18n="first"\n data-i18n-options=\'{"defaultValue": "bar"}\'></p>'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'third' },
      { key: 'fourth' },
      { key: 'first', defaultValue: 'bar' },
    ])
    done()
  })

  it('skip if no key is found', (done) => {
    const Lexer = new HTMLLexer()
    const content = '<p data-i18n></p>'
    assert.deepEqual(Lexer.extract(content), [])
    done()
  })

  it('supports a `attr` option', (done) => {
    const Lexer = new HTMLLexer({ attr: 'data-other' })
    const content = '<p data-other="first;second"></p>'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first' },
      { key: 'second' },
    ])
    done()
  })

  it('supports a `optionAttr` option', (done) => {
    const Lexer = new HTMLLexer({ optionAttr: 'data-other-options' })
    const content =
      '<p data-i18n="first" data-other-options=\'{"defaultValue": "bar"}\'></p>'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', defaultValue: 'bar' },
    ])
    done()
  })

  it('extracts custom options', (done) => {
    const Lexer = new HTMLLexer()
    const content =
      '<p data-i18n="first" data-i18n-options=\'{"description": "bla"}\'>first</p>'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', description: 'bla' },
    ])
    done()
  })

  it('extracts boolean options', (done) => {
    const Lexer = new HTMLLexer()
    const content =
      '<p data-i18n="first" data-i18n-options=\'{"ordinal": true, "custom": false}\'>first</p>'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', ordinal: true, custom: false },
    ])
    done()
  })
})
