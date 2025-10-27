import { assert } from 'chai'
import PhpLexer from '../../src/lexers/php-lexer.js'

describe('php-lexer', () => {
  it('extracts keys from translation function', (done) => {
    const Lexer = new PhpLexer()
    const content = 't("first")'
    assert.deepEqual(Lexer.extract(content), [{ key: 'first' }])
    done()
  })

  it('extracts multiple keys', () => {
    const Lexer = new PhpLexer()
    const content = 't("first"); t("second")'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first' },
      { key: 'second' },
    ])
  })

  it('supports custom function names', () => {
    const Lexer = new PhpLexer({ functions: ['__'] })
    const content = '__("custom")'
    assert.deepEqual(Lexer.extract(content), [{ key: 'custom' }])
  })

  it('extracts key when other parameters are present', () => {
    const Lexer = new PhpLexer()
    const content = 't("key", $param1, $param2)'
    assert.deepEqual(Lexer.extract(content), [{ key: 'key' }])
  })

  it('extracts keys from nested functions', () => {
    const Lexer = new PhpLexer()
    const content = 't("key", ["nested" => t("nested_key")])'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'key' },
      { key: 'nested_key' },
    ])
  })

  it('extracts keys with %key or :key syntax', () => {
    const Lexer = new PhpLexer()
    const content = 't("My %key"); t("My :key")'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'My %key' },
      { key: 'My :key' },
    ])
  })

  it('extracts keys with escaped characters', () => {
    const Lexer = new PhpLexer()
    const content =
      't("escaped \\"double quote\\""); t(\'escaped \\\'single quote\\\'\')'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'escaped "double quote"' },
      { key: "escaped 'single quote'" },
    ])
  })

  it('does not throw on invalid PHP', () => {
    const Lexer = new PhpLexer()
    const content = 't("unclosed'
    assert.doesNotThrow(() => Lexer.extract(content))
  })
})
