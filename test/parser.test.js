import { assert } from 'chai'
import Vinyl from 'vinyl'
import fs from 'fs'
import i18nTransform from '../src/index'
import path from 'path'

describe('parser', () => {
  it('parses globally on multiple lines', done => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        "asd t('first') t('second') \n asd t('third') ad t('fourth')"
      ),
      path: 'file.js'
    })
    i18nextParser.once('data', file => {
      if (file.relative.endsWith('en/translation.json')) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.on('end', () => {
      assert.deepEqual(result, { first: '', second: '', third: '', fourth: '' })
      done()
    })
    i18nextParser.end(fakeFile)
  })

  it('parses multiline function calls', done => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        "asd t(\n  'first'\n) t('second') \n asd t(\n\n'third')"
      ),
      path: 'file.js'
    })

    i18nextParser.on('data', file => {
      if (file.relative.endsWith('en/translation.json')) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.on('end', () => {
      assert.deepEqual(result, { first: '', second: '', third: '' })
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('creates context keys', done => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: Buffer.from("asd t('first', {context: 'female'})"),
      path: 'file.js'
    })

    i18nextParser.on('data', file => {
      if (file.relative.endsWith('en/translation.json')) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.once('end', () => {
      assert.deepEqual(result, {
        first: '',
        first_female: ''
      })
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('parses html files', done => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: fs.readFileSync(
        path.resolve(__dirname, 'templating/html.html')
      ),
      path: 'file.html'
    })
    const expected = {
      first: '',
      second: '',
      third: '',
      fourth: '',
      fifth: 'bar',
      sixth: ''
    }

    i18nextParser.on('data', file => {
      if (file.relative.endsWith('en/translation.json')) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.on('end', () => {
      assert.deepEqual(result, expected)
      done()
    })
    i18nextParser.end(fakeFile)
  })

  it('parses handlebars files', done => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: fs.readFileSync(
        path.resolve(__dirname, 'templating/handlebars.hbs')
      ),
      path: 'file.hbs'
    })
    const expected = {
      first: '',
      second: 'defaultValue',
      second_male: 'defaultValue',
      third: 'defaultValue',
      third_female: 'defaultValue',
      fourth: 'defaultValue',
      fourth_male: 'defaultValue',
      fifth: '',
      fifth_male: '',
      sixth: '',
      seventh: 'defaultValue'
    }

    i18nextParser.on('data', file => {
      if (file.relative.endsWith('en/translation.json')) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.on('end', () => {
      assert.deepEqual(result, expected)
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('parses javascript files', done => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: fs.readFileSync(
        path.resolve(__dirname, 'templating/javascript.js')
      ),
      path: 'file.js'
    })
    const expected = {
      first: '',
      second: 'defaultValue',
      third: 'defaultValue',
      fourth: ''
    }

    i18nextParser.on('data', file => {
      if (file.relative.endsWith('en/translation.json')) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.on('end', () => {
      assert.deepEqual(result, expected)
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('creates two files per namespace and per locale', done => {
    let results = []
    const i18nextParser = new i18nTransform({
      locales: ['en', 'de', 'fr'],
      defaultNamespace: 'default'
    })
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        "asd t('ns1:first') t('second') \n asd t('ns2:third') ad t('fourth')"
      ),
      path: 'file.js'
    })

    i18nextParser.on('data', file => {
      results.push(file.relative.replace('locales/', ''))
    })
    i18nextParser.on('end', () => {
      const expectedFiles = [
        'en/default.json',
        'en/default_old.json',
        'en/ns1.json',
        'en/ns1_old.json',
        'en/ns2.json',
        'en/ns2_old.json',
        'de/default.json',
        'de/default_old.json',
        'de/ns1.json',
        'de/ns1_old.json',
        'de/ns2.json',
        'de/ns2_old.json',
        'fr/default.json',
        'fr/default_old.json',
        'fr/ns1.json',
        'fr/ns1_old.json',
        'fr/ns2.json',
        'fr/ns2_old.json'
      ]
      let length = expectedFiles.length

      expectedFiles.forEach(filename => {
        assert.include(results, filename)
        if (!--length) done()
      })
    })

    i18nextParser.end(fakeFile)
  })

  it('handles escaped single and double quotes', done => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        'asd t(\'escaped \\\'single quotes\\\'\') t("escaped \\"double quotes\\"")'
      ),
      path: 'file.js'
    })

    i18nextParser.on('data', file => {
      if (file.relative.endsWith('en/translation.json')) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.once('end', () => {
      const keys = Object.keys(result)
      assert.equal(keys[0], "escaped 'single quotes'")
      assert.equal(keys[1], 'escaped "double quotes"')
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('handles escaped characters', done => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        "asd t('escaped backslash\\\\ newline\\n\\r tab\\t')"
      ),
      path: 'file.js'
    })

    i18nextParser.on('data', file => {
      if (file.relative.endsWith('en/translation.json')) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.once('end', () => {
      const keys = Object.keys(result)
      assert.equal(keys[0], 'escaped backslash\\ newline\n\r tab\t')
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('returns buffers', done => {
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        "asd t('first') t('second') \n asd t('third') ad t('fourth')"
      ),
      path: 'file.js'
    })

    i18nextParser.once('data', file => {
      assert(file.isBuffer())
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('retrieves values in existing catalog', done => {
    let result
    const i18nextParser = new i18nTransform({ output: 'test/locales' })
    const fakeFile = new Vinyl({
      contents: Buffer.from("asd t('test_merge:first') t('test_merge:second')"),
      path: 'file.js'
    })

    i18nextParser.on('data', file => {
      if (file.relative.endsWith('en/test_merge.json')) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.once('end', () => {
      assert.deepEqual(result, { first: 'first', second: '' })
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('does not leak values between locales', done => {
    let resultEN
    let resultFR
    const i18nextParser = new i18nTransform({ output: 'test/locales' })
    const fakeFile = new Vinyl({
      contents: Buffer.from("asd t('test_leak:first') t('test_leak:second')"),
      path: 'file.js'
    })

    i18nextParser.on('data', file => {
      if (file.relative.endsWith('en/test_leak.json')) {
        resultEN = JSON.parse(file.contents)
      }
      if (file.relative.endsWith('fr/test_leak.json')) {
        resultFR = JSON.parse(file.contents)
      }
    })
    i18nextParser.once('end', () => {
      assert.deepEqual(resultEN, { first: 'first', second: 'second' })
      assert.deepEqual(resultFR, { first: 'premier', second: '' })
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('retrieves context values in existing catalog', done => {
    let result
    const i18nextParser = new i18nTransform({ output: 'test/locales' })
    const fakeFile = new Vinyl({
      contents: Buffer.from("asd t('test_context:first')"),
      path: 'file.js'
    })

    const expectedResult = {
      first: 'first',
      first_context1: 'first context1',
      first_context2: ''
    }

    i18nextParser.on('data', file => {
      if (file.relative.endsWith('en/test_context.json')) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.once('end', () => {
      assert.deepEqual(result, expectedResult)
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('retrieves plural values in existing catalog', done => {
    let result
    const i18nextParser = new i18nTransform({ output: 'test/locales' })
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        "asd t('test_plural:first') t('test_plural:second')"
      ),
      path: 'file.js'
    })

    const expectedResult = {
      first: 'first',
      first_plural: 'first plural',
      second: 'second',
      second_plural_0: 'second plural 0',
      second_plural_12: 'second plural 12'
    }

    i18nextParser.on('data', file => {
      if (file.relative.endsWith('en/test_plural.json')) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.once('end', () => {
      assert.deepEqual(result, expectedResult)
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('retrieves plural and context values in existing catalog', done => {
    let result
    const i18nextParser = new i18nTransform({ output: 'test/locales' })
    const fakeFile = new Vinyl({
      contents: Buffer.from("asd t('test_context_plural:first')"),
      path: 'file.js'
    })

    const expectedResult = {
      first: 'first',
      first_context1_plural: 'first context1 plural',
      first_context2_plural_2: 'first context2 plural 2'
    }

    i18nextParser.on('data', file => {
      if (file.relative.endsWith('en/test_context_plural.json')) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.once('end', () => {
      assert.deepEqual(result, expectedResult)
      done()
    })

    i18nextParser.end(fakeFile)
  })

  describe('options', () => {
    it('handles filename and extension with $LOCALE and $NAMESPACE var', done => {
      let results = []
      const i18nextParser = new i18nTransform({
        locales: ['en'],
        defaultNamespace: 'default',
        filename: 'p-$LOCALE-$NAMESPACE',
        extension: '.$LOCALE.i18n'
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("asd t('fourth')"),
        path: 'file.js'
      })

      i18nextParser.on('data', file => {
        results.push(file.relative.replace('locales/', ''))
      })
      i18nextParser.on('end', () => {
        const expectedFiles = [
          'en/p-en-default.en.i18n',
          'en/p-en-default_old.en.i18n'
        ]
        let length = expectedFiles.length

        expectedFiles.forEach(filename => {
          assert.include(results, filename)
          if (!--length) done()
        })
      })

      i18nextParser.end(fakeFile)
    })

    it('handles custom namespace and key separators', done => {
      let result
      const i18nextParser = new i18nTransform({
        namespaceSeparator: '?',
        keySeparator: '-'
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from(
          "asd t('test_separators?first') t('test_separators?second-third')"
        ),
        path: 'file.js'
      })

      i18nextParser.on('data', file => {
        if (file.relative.endsWith('en/test_separators.json')) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, { first: '', second: { third: '' } })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('supports a defaultValue', done => {
      let result
      const i18nextParser = new i18nTransform({
        defaultValue: 'NOT_TRANSLATED'
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("asd t('first')"),
        path: 'file.js'
      })

      i18nextParser.on('data', file => {
        if (file.relative.endsWith('en/translation.json')) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, { first: 'NOT_TRANSLATED' })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('supports outputing to yml', done => {
      let result
      const i18nextParser = new i18nTransform({
        extension: '.yml'
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("asd t('first')"),
        path: 'file.js'
      })

      i18nextParser.on('data', file => {
        if (file.relative.endsWith('en/translation.yml')) {
          result = file.contents.toString('utf8')
        }
      })
      i18nextParser.once('end', () => {
        assert.equal(result, 'first: ""\n')
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('supports an indentation option', done => {
      let result
      const i18nextParser = new i18nTransform({
        indentation: 6
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("asd t('first')"),
        path: 'file.js'
      })

      i18nextParser.on('data', file => {
        if (file.relative.endsWith('en/translation.json')) {
          result = file.contents.toString('utf8')
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result.split('\n')[1], '      "first": ""')
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('handles skipping the old catalog with createOldLibraries=false', done => {
      let results = []
      const i18nextParser = new i18nTransform({
        locales: ['en', 'de', 'fr'],
        defaultNamespace: 'default',
        createOldLibraries: false
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from(
          "asd t('ns1:first') t('second') \n asd t('ns2:third') ad t('fourth')"
        ),
        path: 'file.js'
      })

      i18nextParser.on('data', file => {
        results.push(file.relative.replace('locales/', ''))
      })
      i18nextParser.on('end', () => {
        const expectedFiles = [
          'en/default.json',
          'en/ns1.json',
          'en/ns2.json',
          'de/default.json',
          'de/ns1.json',
          'de/ns2.json',
          'fr/default.json',
          'fr/ns1.json',
          'fr/ns2.json'
        ]
        let length = expectedFiles.length

        expectedFiles.forEach(filename => {
          assert.include(results, filename)
          if (!--length) done()
        })
      })

      i18nextParser.end(fakeFile)
    })

    describe('lexers', () => {
      it('support custom lexers options', done => {
        let result
        const i18nextParser = new i18nTransform({
          lexers: {
            js: [
              {
                lexer: 'JavascriptLexer',
                functions: ['bla', '_e']
              }
            ]
          }
        })
        const fakeFile = new Vinyl({
          contents: Buffer.from("asd bla('first') _e('second')"),
          path: 'file.js'
        })

        i18nextParser.on('data', file => {
          if (file.relative.endsWith('en/translation.json')) {
            result = JSON.parse(file.contents)
          }
        })
        i18nextParser.once('end', () => {
          assert.deepEqual(result, { first: '', second: '' })
          done()
        })

        i18nextParser.end(fakeFile)
      })
    })

    describe('sort', () => {
      it('does not sort by default', done => {
        let result
        const i18nextParser = new i18nTransform()
        const fakeFile = new Vinyl({
          contents: Buffer.from(
            "asd t('ccc') t('aaa') t('bbb.bbb') t('bbb.aaa')"
          ),
          path: 'file.js'
        })

        i18nextParser.on('data', file => {
          if (file.relative.endsWith('en/translation.json')) {
            result = JSON.parse(file.contents)
          }
        })
        i18nextParser.once('end', () => {
          assert.sameOrderedMembers(Object.keys(result), ['ccc', 'aaa', 'bbb'])
          assert.sameOrderedMembers(Object.keys(result.bbb), ['bbb', 'aaa'])
          done()
        })

        i18nextParser.end(fakeFile)
      })

      it('supports sort as an option', done => {
        let result
        const i18nextParser = new i18nTransform({
          sort: true
        })
        const fakeFile = new Vinyl({
          contents: Buffer.from(
            "asd t('ccc') t('aaa') t('bbb.bbb') t('bbb.aaa')"
          ),
          path: 'file.js'
        })

        i18nextParser.on('data', file => {
          if (file.relative.endsWith('en/translation.json')) {
            result = JSON.parse(file.contents)
          }
        })
        i18nextParser.once('end', () => {
          assert.sameOrderedMembers(Object.keys(result), ['aaa', 'bbb', 'ccc'])
          assert.sameOrderedMembers(Object.keys(result.bbb), ['aaa', 'bbb'])
          done()
        })

        i18nextParser.end(fakeFile)
      })
    })
  })

  describe('events', () => {
    it('emits a `reading` event', done => {
      let result
      const i18nextParser = new i18nTransform()
      const fakeFile = new Vinyl({
        contents: Buffer.from('content'),
        path: 'file.js'
      })

      i18nextParser.on('reading', file => {
        result = file.path
      })
      i18nextParser.on('finish', () => {
        assert.equal(result, 'file.js')
        done()
      })
      i18nextParser.end(fakeFile)
    })

    it('emits a `error` event if the catalog is not valid json', done => {
      const i18nextParser = new i18nTransform({ output: 'test/locales' })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('test_invalid:content')"),
        path: 'file.js'
      })

      i18nextParser.on('error', error => {
        assert.equal(error.message, 'Unexpected token / in JSON at position 0')
        done()
      })
      i18nextParser.end(fakeFile)
    })

    it('emits an `error` if a lexer does not exist', done => {
      const results = []
      const i18nextParser = new i18nTransform({ lexers: { js: ['fakeLexer'] } })
      const fakeFile = new Vinyl({
        contents: Buffer.from('content'),
        path: 'file.js'
      })

      i18nextParser.on('error', error => {
        assert.equal(error.message, "Lexer 'fakeLexer' does not exist")
        done()
      })
      i18nextParser.end(fakeFile)
    })

    it('emits a `warning` event if a key contains a variable', done => {
      const i18nextParser = new i18nTransform({ output: 'test/locales' })
      const fakeFile = new Vinyl({
        contents: Buffer.from('t(variable)'),
        path: 'file.js'
      })

      i18nextParser.on('warning', message => {
        assert.equal(message, 'Key is not a string litteral: variable')
        done()
      })
      i18nextParser.end(fakeFile)
    })
  })
})
