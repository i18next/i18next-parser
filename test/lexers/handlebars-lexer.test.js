import { assert } from 'chai'
import HandlebarsLexer from '../../src/lexers/handlebars-lexer'

describe('HandlebarsLexer', function () {
  it('extracts keys from translation components', function (done) {
    const Lexer = new HandlebarsLexer()
    const content = '<p>{{t "first"}}</p>'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'first' }
      ]
    )
    done()
  })

  it('extracts the second argument as defaultValue', function (done) {
    const Lexer = new HandlebarsLexer()
    const content = '<p>{{t "first" "bla"}}</p>'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'first', defaultValue: 'bla' }
      ]
    )
    done()
  })

  it('extracts the defaultValue arguments', function (done) {
    const Lexer = new HandlebarsLexer()
    const content = '<p>{{t "first" defaultValue="bla"}}</p>'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'first', defaultValue: 'bla' }
      ]
    )
    done()
  })

  it('extracts the context arguments', function (done) {
    const Lexer = new HandlebarsLexer()
    const content = '<p>{{t "first" context="bla"}}</p>'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'first', context: 'bla' }
      ]
    )
    done()
  })

  it('extracts keys from translation functions', function (done) {
    const Lexer = new HandlebarsLexer()
    const content = '<p>{{link-to (t "first") "foo"}}</p>'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'first' }
      ]
    )
    done()
  })

  it('supports a `functions` option', function (done) {
    const Lexer = new HandlebarsLexer({functions: ['tt', '_e']})
    const content = '<p>{{link-to (tt "first") "foo"}}: {{_e "second"}}</p>'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'first' },
        { key: 'second' }
      ]
    )
    done()
  })

  describe('parseArguments()', function () {
    it('matches string arguments', function (done) {
      const Lexer = new HandlebarsLexer()
      const args = '"first" "bla"'
      assert.deepEqual(
        Lexer.parseArguments(args),
        {
          arguments: [
            '"first"',
            '"bla"'
          ],
          options: {}
        }
      )
      done()
    })

    it('matches variable arguments', function (done) {
      const Lexer = new HandlebarsLexer()
      const args = 'first bla'
      assert.deepEqual(
        Lexer.parseArguments(args),
        {
          arguments: [
            'first',
            'bla'
          ],
          options: {}
        }
      )
      done()
    })

    it('matches key-value arguments', function (done) {
      const Lexer = new HandlebarsLexer()
      const args = 'first="bla"'
      assert.deepEqual(
        Lexer.parseArguments(args),
        {
          arguments: [
            'first="bla"'
          ],
          options: {
            first: 'bla'
          }
        }
      )
      done()
    })

    it('skips key-value arguments that are variables', function (done) {
      const Lexer = new HandlebarsLexer()
      const args = 'second=bla'
      assert.deepEqual(
        Lexer.parseArguments(args),
        {
          arguments: [
            'second=bla'
          ],
          options: {
            // empty!
          }
        }
      )
      done()
    })

    it('matches combinations', function (done) {
      const Lexer = new HandlebarsLexer()
      const args = '"first" second third-one="bla bla" fourth fifth=\'bla\' "sixth"'
      assert.deepEqual(
        Lexer.parseArguments(args),
        {
          arguments: [
            '"first"',
            'second',
            'third-one="bla bla"',
            'fourth',
            'fifth=\'bla\'',
            '"sixth"'
          ],
          options: {
            'third-one': 'bla bla',
            'fifth': 'bla'
          }
        }

      )
      done()
    })
  })
})
