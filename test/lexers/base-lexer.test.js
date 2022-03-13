import { assert } from 'chai'
import BaseLexer from '../../src/lexers/base-lexer.js'

describe('BaseLexer', () => {
  it('functionPattern() return a regex pattern', (done) => {
    const Lexer = new BaseLexer({ functions: ['this.t', '__'] })
    assert.equal(Lexer.functionPattern(), '(?:this\\.t|__)')
    done()
  })

  describe('validateString()', () => {
    it('matches double quote strings', (done) => {
      const Lexer = new BaseLexer()
      assert.equal(Lexer.validateString('"args"'), true)
      done()
    })

    it('matches single quote strings', (done) => {
      const Lexer = new BaseLexer()
      assert.equal(Lexer.validateString("'args'"), true)
      done()
    })

    it('does not match variables', (done) => {
      const Lexer = new BaseLexer()
      assert.equal(Lexer.validateString('args'), false)
      done()
    })

    it('does not match null value', (done) => {
      const Lexer = new BaseLexer()
      assert.equal(Lexer.validateString(null), false)
      done()
    })

    it('does not match undefined value', (done) => {
      const Lexer = new BaseLexer()
      assert.equal(Lexer.validateString(undefined), false)
      done()
    })

    it('does not match empty string', (done) => {
      const Lexer = new BaseLexer()
      assert.equal(Lexer.validateString(''), false)
      done()
    })
  })
})
