import { assert } from 'chai'
import JavascriptLexer from '../../src/lexers/javascript-lexer'

describe('JavascriptLexer', function () {
  it('extracts keys from translation components', function (done) {
    const Lexer = new JavascriptLexer()
    const content = 'i18n.t("first")'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'first' }
      ]
    )
    done()
  })

  it('extracts the second argument as defaultValue', function (done) {
    const Lexer = new JavascriptLexer()
    const content = 'i18n.t("first" "bla")'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'first', defaultValue: 'bla' }
      ]
    )
    done()
  })

  it('extracts the defaultValue/context options', function (done) {
    const Lexer = new JavascriptLexer()
    const content = 'i18n.t("first", {defaultValue: "foo", context: \'bar\'})'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'first', defaultValue: 'foo', context: 'bar' }
      ]
    )
    done()
  })

  it('extracts the defaultValue/context options with quotation marks', function (done) {
    const Lexer = new JavascriptLexer()
    const content = 'i18n.t("first", {context: "foo", "defaultValue": \'bla\'})'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'first', defaultValue: 'bla', context: 'foo' }
      ]
    )
    done()
  })

  it('supports multiline and concatenation', function (done) {
    const Lexer = new JavascriptLexer()
    const content = 'i18n.t("foo" + \n "bar")'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'foobar' }
      ]
    )
    done()
  })

  it('does not parse text with `doesn\'t` or isolated `t` in it', function (done) {
    const Lexer = new JavascriptLexer()
    const js = "// FIX this doesn't work and this t is all alone\nt('first')\nt = function() {}"
    assert.deepEqual(
      Lexer.extract(js),
      [
        { key: 'first' }
      ]
    )
    done()
  })

  it('ignores functions that ends with a t', function (done) {
    const Lexer = new JavascriptLexer()
    const js = 'import \'./yolo.js\' t(\'first\')'
    assert.deepEqual(
      Lexer.extract(js),
      [
        { key: 'first' }
      ]
    )
    done()
  })

  it('supports a `functions` option', function (done) {
    const Lexer = new JavascriptLexer({functions: ['tt', '_e']})
    const content = 'tt("first") + _e("second")'
    assert.deepEqual(
      Lexer.extract(content),
      [
        { key: 'first' },
        { key: 'second' }
      ]
    )
    done()
  })

  describe('concatenateString()', function () {
    it('concatenates strings', function (done) {
      const Lexer = new JavascriptLexer()
      assert.equal(
        Lexer.concatenateString('"foo" + \'bar\''),
        '"foobar"'
      )
      done()
    })

    it('returns the original string if it contains variables', function (done) {
      const Lexer = new JavascriptLexer()
      assert.equal(
        Lexer.concatenateString('"foo" + bar'),
        '"foo" + bar'
      )
      done()
    })

    it('returns the original string if it contains backquote string', function (done) {
      const Lexer = new JavascriptLexer()
      assert.equal(
        Lexer.concatenateString('"foo" + `bar`'),
        '"foo" + `bar`'
      )
      done()
    })
  })

  describe('parseArguments()', function () {
    it('matches string arguments', function (done) {
      const Lexer = new JavascriptLexer()
      const args = '"first", "bla"'
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
      const Lexer = new JavascriptLexer()
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

    it('matches concatenated arguments and concatenate when possible', function (done) {
      const Lexer = new JavascriptLexer()
      const args = "'first' + asd, 'bla' + 'asd', foo+bar+baz"
      assert.deepEqual(
        Lexer.parseArguments(args),
        {
          arguments: [
            "'first' + asd",
            "'blaasd'", // string got concatenated!
            "foo+bar+baz"
          ],
          options: {}
        }
      )
      done()
    })
  })
})
