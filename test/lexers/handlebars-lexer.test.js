import { assert } from 'chai'
import HandlebarsLexer from '../../src/lexers/handlebars-lexer.js'

describe('HandlebarsLexer', () => {
  it('extracts keys from translation components', (done) => {
    const Lexer = new HandlebarsLexer()
    const content = '<p>{{t "first"}}</p>'
    assert.deepEqual(Lexer.extract(content), [{ key: 'first' }])
    done()
  })

  it('extracts multiple keys on a single line', (done) => {
    const Lexer = new HandlebarsLexer()
    const content = '<p>{{t "first"}} {{t "second"}}</p>'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first' },
      { key: 'second' },
    ])
    done()
  })

  it('extracts the second argument as defaultValue', (done) => {
    const Lexer = new HandlebarsLexer()
    const content = '<p>{{t "first" "bla"}}</p>'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', defaultValue: 'bla' },
    ])
    done()
  })

  it('extracts the defaultValue arguments', (done) => {
    const Lexer = new HandlebarsLexer()
    const content = '<p>{{t "first" defaultValue="bla"}}</p>'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', defaultValue: 'bla' },
    ])
    done()
  })

  it('extracts the context arguments', (done) => {
    const Lexer = new HandlebarsLexer()
    const content = '<p>{{t "first" context="bla"}}</p>'
    assert.deepEqual(Lexer.extract(content), [{ key: 'first', context: 'bla' }])
    done()
  })

  it('extracts keys from translation functions', (done) => {
    const Lexer = new HandlebarsLexer()
    const content = '<p>{{link-to (t "first") "foo"}}</p>'
    assert.deepEqual(Lexer.extract(content), [{ key: 'first' }])
    done()
  })

  it('supports a `functions` option', (done) => {
    const Lexer = new HandlebarsLexer({ functions: ['tt', '_e'] })
    const content = '<p>{{link-to (tt "first") "foo"}}: {{_e "second"}}</p>'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first' },
      { key: 'second' },
    ])
    done()
  })

  it('extracts custom options', (done) => {
    const Lexer = new HandlebarsLexer()
    const content = '<p>{{t "first" description="bla"}}</p>'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', description: 'bla' },
    ])
    done()
  })

  it('extracts boolean options', (done) => {
    const Lexer = new HandlebarsLexer()
    const content = '<p>{{t "first" ordinal="true" custom="false"}}</p>'
    assert.deepEqual(Lexer.extract(content), [
      { key: 'first', ordinal: true, custom: false },
    ])
    done()
  })

  describe('parseArguments()', () => {
    it('matches string arguments', (done) => {
      const Lexer = new HandlebarsLexer()
      const args = '"first" "bla"'
      assert.deepEqual(Lexer.parseArguments(args), {
        arguments: ['"first"', '"bla"'],
        options: {},
      })
      done()
    })

    it('matches variable arguments', (done) => {
      const Lexer = new HandlebarsLexer()
      const args = 'first bla'
      assert.deepEqual(Lexer.parseArguments(args), {
        arguments: ['first', 'bla'],
        options: {},
      })
      done()
    })

    it('matches key-value arguments', (done) => {
      const Lexer = new HandlebarsLexer()
      const args = 'first="bla"'
      assert.deepEqual(Lexer.parseArguments(args), {
        arguments: ['first="bla"'],
        options: {
          first: 'bla',
        },
      })
      done()
    })

    it('skips key-value arguments that are variables', (done) => {
      const Lexer = new HandlebarsLexer()
      const args = 'second=bla'
      assert.deepEqual(Lexer.parseArguments(args), {
        arguments: ['second=bla'],
        options: {
          // empty!
        },
      })
      done()
    })

    it('matches combinations', (done) => {
      const Lexer = new HandlebarsLexer()
      const args =
        '"first" second third-one="bla bla" fourth fifth=\'bla\' "sixth"'
      assert.deepEqual(Lexer.parseArguments(args), {
        arguments: [
          '"first"',
          'second',
          'third-one="bla bla"',
          'fourth',
          "fifth='bla'",
          '"sixth"',
        ],
        options: {
          'third-one': 'bla bla',
          fifth: 'bla',
        },
      })
      done()
    })
  })
})
