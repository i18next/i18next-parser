import { assert } from 'chai'
import BaseLexer from '../../src/lexers/base-lexer'

describe('BaseLexer', function () {
  it('functionPattern() return a regex pattern', function (done) {
    const Lexer = new BaseLexer({functions: ['this.t', '__']})
    assert.equal( Lexer.functionPattern(), '(?:this\\.t|__)' )
    done()
  })

  describe('validateString()', function () {
    it('matches double quote strings', function (done) {
      const Lexer = new BaseLexer()
      assert.equal(
        Lexer.validateString('"args"'),
        true
      )
      done()
    })

    it('matches single quote strings', function (done) {
      const Lexer = new BaseLexer()
      assert.equal(
        Lexer.validateString("'args'"),
        true
      )
      done()
    })

    it('does not match variables', function (done) {
      const Lexer = new BaseLexer()
      assert.equal(
        Lexer.validateString('args'),
        false
      )
      done()
    })

    it('does not match null value', function (done) {
      const Lexer = new BaseLexer()
      assert.equal(
        Lexer.validateString(null),
        false
      )
      done()
    })

    it('does not match undefined value', function (done) {
      const Lexer = new BaseLexer()
      assert.equal(
        Lexer.validateString(undefined),
        false
      )
      done()
    })

    it('does not match empty string', function (done) {
      const Lexer = new BaseLexer()
      assert.equal(
        Lexer.validateString(''),
        false
      )
      done()
    })
  })
})
