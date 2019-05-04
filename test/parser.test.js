import { assert } from 'chai'
import Vinyl from 'vinyl'
import fs from 'fs'
import i18nTransform from '../src/transform'
import path from 'path'

const enLibraryPath = path.normalize('en/translation.json')

describe('parser', () => {
  it('parses globally on multiple lines', (done) => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        "t('first'); t('second') \n t('third'); t('fourth');"
      ),
      path: 'file.js'
    })
    i18nextParser.once('data', file => {
      if (file.relative.endsWith(enLibraryPath)) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.on('end', () => {
      assert.deepEqual(result, { first: '', second: '', third: '', fourth: '' })
      done()
    })
    i18nextParser.end(fakeFile)
  })

  it('parses multiline function calls', (done) => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        "t(\n  'first'\n)\n t('second'); t(\n\n'third')"
      ),
      path: 'file.js'
    })

    i18nextParser.on('data', file => {
      if (file.relative.endsWith(enLibraryPath)) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.on('end', () => {
      assert.deepEqual(result, { first: '', second: '', third: '' })
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('creates context keys', (done) => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: Buffer.from("t('first', {context: 'female'})"),
      path: 'file.js'
    })

    i18nextParser.on('data', file => {
      if (file.relative.endsWith(enLibraryPath)) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.once('end', () => {
      assert.deepEqual(result, {
        first_female: ''
      })
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('parses html files', (done) => {
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
      sixth: '',
      selfClosing: ''
    }

    i18nextParser.on('data', file => {
      if (file.relative.endsWith(enLibraryPath)) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.on('end', () => {
      assert.deepEqual(result, expected)
      done()
    })
    i18nextParser.end(fakeFile)
  })

  it('parses handlebars files', (done) => {
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
      second_male: 'defaultValue',
      third_female: 'defaultValue',
      fourth_male: 'defaultValue',
      fifth_male: '',
      sixth: '',
      seventh: 'defaultValue'
    }

    i18nextParser.on('data', file => {
      if (file.relative.endsWith(enLibraryPath)) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.on('end', () => {
      assert.deepEqual(result, expected)
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('parses javascript files', (done) => {
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
      third: '{{var}} defaultValue',
      fourth: ''
    }

    i18nextParser.on('data', file => {
      if (file.relative.endsWith(enLibraryPath)) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.on('end', () => {
      assert.deepEqual(result, expected)
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('parses react files', (done) => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: fs.readFileSync(
        path.resolve(__dirname, 'templating/react.jsx')
      ),
      path: 'react.jsx'
    })
    const expected = {
      first: '',
      second: '',
      third: {
        first: 'Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.',
        second: ' <1>Hello,</1> this shouldn\'t be trimmed.',
        third: '<0>Hello,</0>this should be trimmed.<2> and this shoudln\'t</2>'
      },
      fourth: '',
      fifth: '',
      bar: '',
      foo: '',
      "This should be part of the value and the key": "This should be part of the value and the key",
      "don't split {{on}}": "don't split {{on}}"
    }

    i18nextParser.on('data', file => {
      // support for a default Namespace
      if (file.relative.endsWith(path.normalize('en/react.json'))) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.on('end', () => {
      assert.deepEqual(result, expected)
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('parses typescript files', (done) => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: fs.readFileSync(
        path.resolve(__dirname, 'templating/typescript.tsx')
      ),
      path: 'typescript.tsx'
    })
    const expected = {
      first: '',
      second: '',
      third: {
        first: 'Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.',
        second: ' <1>Hello,</1> this shouldn\'t be trimmed.',
        third: '<0>Hello,</0>this should be trimmed.<2> and this shoudln\'t</2>'
      },
      fourth: '',
      fifth: '',
      bar: '',
      foo: '',
      "This should be part of the value and the key": "This should be part of the value and the key",
      "don't split {{on}}": "don't split {{on}}"
    }

    i18nextParser.on('data', file => {
      if (file.relative.endsWith(enLibraryPath)) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.on('end', () => {
      assert.deepEqual(result, expected)
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('creates one file per namespace and per locale', (done) => {
    let results = []
    const i18nextParser = new i18nTransform({
      locales: ['en', 'de', 'fr'],
      defaultNamespace: 'default'
    })
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        "t('ns1:first'); t('second') \n t('ns2:third'); t('fourth')"
      ),
      path: 'file.js'
    })

    i18nextParser.on('data', file => {
      results.push(file.relative.replace(/locales[\//\\]/, ''))
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

      for (const filename of expectedFiles) {
        assert.include(results, path.normalize(filename))
        if (!--length) done()
      }
    })

    i18nextParser.end(fakeFile)
  })

  it('handles escaped single and double quotes', (done) => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        't(\'escaped \\\'single quotes\\\'\'); t("escaped \\"double quotes\\"")'
      ),
      path: 'file.js'
    })

    i18nextParser.on('data', file => {
      if (file.relative.endsWith(enLibraryPath)) {
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

  it('handles escaped characters', (done) => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        "t('escaped backslash\\\\ newline\\n\\r tab\\t')"
      ),
      path: 'file.js'
    })

    i18nextParser.on('data', file => {
      if (file.relative.endsWith(enLibraryPath)) {
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

  it('returns buffers', (done) => {
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        "t('first')"
      ),
      path: 'file.js'
    })

    i18nextParser.once('data', file => {
      assert(file.isBuffer())
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('retrieves values in existing catalog and creates old catalog', (done) => {
    let result, resultOld
    const i18nextParser = new i18nTransform({ output: 'test/locales/$LOCALE/$NAMESPACE.json' })
    const fakeFile = new Vinyl({
      contents: Buffer.from("t('test_merge:first'); t('test_merge:second')"),
      path: 'file.js'
    })

    i18nextParser.on('data', file => {
      if (file.relative.endsWith(path.normalize('en/test_merge.json'))) {
        result = JSON.parse(file.contents)
      }
      else if (file.relative.endsWith(path.normalize('en/test_merge_old.json'))) {
        resultOld = JSON.parse(file.contents)
      }
    })
    i18nextParser.once('end', () => {
      assert.deepEqual(result, { first: 'first', second: '' })
      assert.deepEqual(resultOld, { third: 'third' })
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('does not leak values between locales', (done) => {
    let resultEN
    let resultFR
    const i18nextParser = new i18nTransform({ output: 'test/locales/$LOCALE/$NAMESPACE.json' })
    const fakeFile = new Vinyl({
      contents: Buffer.from("t('test_leak:first'); t('test_leak:second')"),
      path: 'file.js'
    })

    i18nextParser.on('data', file => {
      if (file.relative.endsWith(path.normalize('en/test_leak.json'))) {
        resultEN = JSON.parse(file.contents)
      }
      if (file.relative.endsWith(path.normalize('fr/test_leak.json'))) {
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

  it('retrieves context values in existing catalog', (done) => {
    let result
    const i18nextParser = new i18nTransform({ output: 'test/locales/$LOCALE/$NAMESPACE.json' })
    const fakeFile = new Vinyl({
      contents: Buffer.from("t('test_context:first')"),
      path: 'file.js'
    })

    const expectedResult = {
      first: 'first',
      first_context1: 'first context1',
      first_context2: ''
    }

    i18nextParser.on('data', file => {
      if (file.relative.endsWith(path.normalize('en/test_context.json'))) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.once('end', () => {
      assert.deepEqual(result, expectedResult)
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('saves unused translations in the old catalog', (done) => {
    const i18nextParser = new i18nTransform({ output: 'test/locales/$LOCALE/$NAMESPACE.json' })
    const fakeFile = new Vinyl({
      contents: Buffer.from("t('test_old:parent.third', 'third'), t('test_old:fourth', 'fourth')"),
      path: 'file.js'
    })

    const expectedResult = { parent: { third: 'third' }, fourth: 'fourth' }
    const expectedResultOld = { parent: { first: 'first', some: 'some' }, second: 'second', other: 'other' }

    let result, resultOld;
    i18nextParser.on('data', file => {
      if (file.relative.endsWith(path.normalize('en/test_old.json'))) {
        result = JSON.parse(file.contents)
      }
      else if (file.relative.endsWith(path.normalize('en/test_old_old.json'))) {
        resultOld = JSON.parse(file.contents)
      }
    })
    i18nextParser.once('end', () => {
      assert.deepEqual(result, expectedResult)
      assert.deepEqual(resultOld, expectedResultOld)
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('restores translations from the old catalog', (done) => {
    const i18nextParser = new i18nTransform({ output: 'test/locales/$LOCALE/$NAMESPACE.json' })
    const fakeFile = new Vinyl({
      contents: Buffer.from("t('test_old:parent.some', 'random'), t('test_old:other', 'random')"),
      path: 'file.js'
    })

    const expectedResult = { parent: { some: 'some' }, other: 'other' }
    const expectedResultOld = { parent: { first: 'first' }, second: 'second' }

    let result, resultOld;
    i18nextParser.on('data', file => {
      if (file.relative.endsWith(path.normalize('en/test_old.json'))) {
        result = JSON.parse(file.contents)
      }
      else if (file.relative.endsWith(path.normalize('en/test_old_old.json'))) {
        resultOld = JSON.parse(file.contents)
      }
    })
    i18nextParser.once('end', () => {
      assert.deepEqual(result, expectedResult)
      assert.deepEqual(resultOld, expectedResultOld)
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('retrieves plural values in existing catalog', (done) => {
    let result
    const i18nextParser = new i18nTransform({ output: 'test/locales/$LOCALE/$NAMESPACE.json' })
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        "t('test_plural:first'); t('test_plural:second')"
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
      if (file.relative.endsWith(path.normalize('en/test_plural.json'))) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.once('end', () => {
      assert.deepEqual(result, expectedResult)
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('retrieves plural and context values in existing catalog', (done) => {
    let result
    const i18nextParser = new i18nTransform({ output: 'test/locales/$LOCALE/$NAMESPACE.json' })
    const fakeFile = new Vinyl({
      contents: Buffer.from("t('test_context_plural:first')"),
      path: 'file.js'
    })

    const expectedResult = {
      first: 'first',
      first_context1_plural: 'first context1 plural',
      first_context2_plural_2: 'first context2 plural 2'
    }

    i18nextParser.on('data', file => {
      if (file.relative.endsWith(path.normalize('en/test_context_plural.json'))) {
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
    it('handles output with $LOCALE and $NAMESPACE var', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        locales: ['en'],
        defaultNamespace: 'default',
        output: 'locales/$LOCALE/p-$LOCALE-$NAMESPACE.$LOCALE.i18n'
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('fourth')"),
        path: 'file.js'
      })

      i18nextParser.on('data', file => {
        result = file.relative.replace(/locales[\\\/]/, '')
      })
      i18nextParser.on('end', () => {
        assert.strictEqual(result, path.normalize('en/p-en-default.en.i18n'))
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('handles custom namespace and key separators', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        namespaceSeparator: '?',
        keySeparator: '-'
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from(
          "t('test_separators?first'); t('test_separators?second-third')"
        ),
        path: 'file.js'
      })

      i18nextParser.on('data', file => {
        if (file.relative.endsWith(path.normalize('en/test_separators.json'))) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, { first: '', second: { third: '' } })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('handles disabling namespace and key separators', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        namespaceSeparator: false,
        keySeparator: false
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('Status: loading...')"),
        path: 'file.js'
      })

      i18nextParser.on('data', file => {
        if (file.relative.endsWith(enLibraryPath)) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, { 'Status: loading...': '' })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('supports a defaultValue', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        defaultValue: 'NOT_TRANSLATED'
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('first')"),
        path: 'file.js'
      })

      i18nextParser.on('data', file => {
        if (file.relative.endsWith(enLibraryPath)) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, { first: 'NOT_TRANSLATED' })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('supports a lineEnding', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        lineEnding: '\r\n'
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('first')"),
        path: 'file.js'
      })

      i18nextParser.on('data', file => {
        if (file.relative.endsWith(enLibraryPath)) {
          result = file.contents.toString()
        }
      })
      i18nextParser.once('end', () => {
        assert.equal(result, '{\r\n  "first": ""\r\n}\r\n')
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('supports a lineEnding', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        lineEnding: '\r\n'
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('first')"),
        path: 'file.js'
      })

      i18nextParser.on('data', file => {
        if (file.relative.endsWith(enLibraryPath)) {
          result = file.contents.toString()
        }
      })
      i18nextParser.once('end', () => {
        assert.equal(result, '{\r\n  "first": ""\r\n}\r\n')
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('parses Trans if reactNamespace is true', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        reactNamespace: true
      })
      const fakeFile = new Vinyl({
        contents: fs.readFileSync(
          path.resolve(__dirname, 'templating/react.jsx')
        ),
        path: 'react.js'
      })
      const expected = {
        first: '',
        second: '',
        third: {
          first: 'Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.',
          second: ' <1>Hello,</1> this shouldn\'t be trimmed.',
          third: '<0>Hello,</0>this should be trimmed.<2> and this shoudln\'t</2>'
        },
        fourth: '',
        fifth: '',
        bar: '',
        foo: '',
        "This should be part of the value and the key": "This should be part of the value and the key",
        "don't split {{on}}": "don't split {{on}}"
      }

      i18nextParser.on('data', file => {
        // support for a default Namespace
        if (file.relative.endsWith(path.normalize('en/react.json'))) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.on('end', () => {
        assert.deepEqual(result, expected)
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('parses keeping basic elements if transSupportBasicHtmlNodes is true', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        lexers: {
          jsx: [
            {
              lexer: 'JsxLexer',
              transSupportBasicHtmlNodes: true,
              transKeepBasicHtmlNodesFor: ['strong', 'b']
            }
          ]
        }
      })
      const fakeFile = new Vinyl({
        contents: fs.readFileSync(
          path.resolve(__dirname, 'templating/react.jsx')
        ),
        path: 'react.jsx'
      })
      const expected = {
        first: '',
        second: '',
        third: {
          first: 'Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.',
          second: ' <b>Hello,</b> this shouldn\'t be trimmed.',
          third: '<b>Hello,</b>this should be trimmed.<2> and this shoudln\'t</2>'
        },
        fourth: '',
        fifth: '',
        bar: '',
        foo: '',
        "This should be part of the value and the key": "This should be part of the value and the key",
        "don't split {{on}}": "don't split {{on}}"
      }

      i18nextParser.on('data', file => {
        // support for a default Namespace
        if (file.relative.endsWith(path.normalize('en/react.json'))) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.on('end', () => {
        assert.deepEqual(result, expected)
        done()
      })

      i18nextParser.end(fakeFile)
    })
    
    
    it('supports outputing to yml', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        output: 'locales/$LOCALE/$NAMESPACE.yml'
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('first')"),
        path: 'file.js'
      })

      i18nextParser.on('data', file => {
        if (file.relative.endsWith(path.normalize('en/translation.yml'))) {
          result = file.contents.toString('utf8')
        }
      })
      i18nextParser.once('end', () => {
        assert.equal(result.replace(/\r\n/g, '\n'), 'first: ""\n')
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('reads existing yml catalog', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        output: 'test/locales/$LOCALE/test.yml'
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('first')"),
        path: 'file.js'
      })

      i18nextParser.on('data', file => {
        if (file.relative.endsWith(path.normalize('en/test.yml'))) {
          result = file.contents.toString('utf8')
        }
      })
      i18nextParser.once('end', () => {
        assert.equal(result.replace(/\r\n/g, '\n'), 'first: foo\n')
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('supports an indentation option', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        indentation: 6
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('first')"),
        path: 'file.js'
      })

      i18nextParser.on('data', file => {
        if (file.relative.endsWith(enLibraryPath)) {
          result = file.contents.toString('utf8')
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result.replace(/\r\n/g, '\n').split('\n')[1], '      "first": ""')
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('handles skipping the old catalog with createOldCatalogs=false', (done) => {
      let results = []
      const i18nextParser = new i18nTransform({
        defaultNamespace: 'default',
        createOldCatalogs: false
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from(
          "t('ns1:first'); t('second') \n t('fourth')"
        ),
        path: 'file.js'
      })

      i18nextParser.on('data', file => {
        results.push(file.relative.replace(/locales[\\\/]/, ''))
      })
      i18nextParser.on('end', () => {
        const expectedFiles = [
          'en/default.json',
          'en/ns1.json',
          'fr/default.json',
          'fr/ns1.json'
        ]
        let length = expectedFiles.length

        assert.equal(results.length, expectedFiles.length)
        for (const filename of expectedFiles) {
          assert.include(results, path.normalize(filename))
          if (!--length) done()
        }
      })

      i18nextParser.end(fakeFile)
    })

    it('supports useKeysAsDefaultValue', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        useKeysAsDefaultValue: true,
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from(
          "t('first'); \n t('second and third'); t('$fourth %fifth%'); t('six.seven');"
        ),
        path: 'file.js'
      })

      i18nextParser.once('data', file => {
        if (file.relative.endsWith(enLibraryPath)) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.on('end', () => {
        assert.deepEqual(result, { 
          first: 'first', 
          'second and third': 'second and third', 
          '$fourth %fifth%': '$fourth %fifth%',
          six: {
            seven: 'six.seven'
          }
        })
        done()
      })
      i18nextParser.end(fakeFile)
    })

    describe('lexers', () => {
      it('support custom lexers options', (done) => {
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
          contents: Buffer.from("bla('first'); _e('second')"),
          path: 'file.js'
        })

        i18nextParser.on('data', file => {
          if (file.relative.endsWith(enLibraryPath)) {
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
      it('does not sort by default', (done) => {
        let result
        const i18nextParser = new i18nTransform()
        const fakeFile = new Vinyl({
          contents: Buffer.from(
            "t('ccc'); t('aaa'); t('bbb.bbb'); t('bbb.aaa')"
          ),
          path: 'file.js'
        })

        i18nextParser.on('data', file => {
          if (file.relative.endsWith(enLibraryPath)) {
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

      it('supports sort as an option', (done) => {
        let result
        const i18nextParser = new i18nTransform({
          sort: true
        })
        const fakeFile = new Vinyl({
          contents: Buffer.from(
            "t('ccc'); t('aaa'); t('bbb.bbb'); t('bbb.aaa')"
          ),
          path: 'file.js'
        })

        i18nextParser.on('data', file => {
          if (file.relative.endsWith(enLibraryPath)) {
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
    it('emits a `reading` event', (done) => {
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

    it('emits a `error` event if the catalog is not valid json', (done) => {
      const i18nextParser = new i18nTransform({ output: 'test/locales/$LOCALE/$NAMESPACE.json' })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('test_invalid:content')"),
        path: 'file.js'
      })

      i18nextParser.on('error', error => {
        assert.equal(error.message.startsWith('Unexpected token /'), true)
        done()
      })
      i18nextParser.end(fakeFile)
    })

    it('emits an `error` if a lexer does not exist', (done) => {
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

    it('emits a `warning` event if a key contains a variable', (done) => {
      const i18nextParser = new i18nTransform({ output: 'test/locales/$LOCALE/$NAMESPACE.json' })
      const fakeFile = new Vinyl({
        contents: Buffer.from('t(variable)'),
        path: 'file.js'
      })

      i18nextParser.on('warning', message => {
        assert.equal(message, 'Key is not a string literal: variable')
        done()
      })
      i18nextParser.end(fakeFile)
    })

    it('emits a `warning` event if a react value contains two variables', (done) => {
      const i18nextParser = new i18nTransform({ output: 'test/locales/$LOCALE/$NAMESPACE.json' })
      const fakeFile = new Vinyl({
        contents: Buffer.from('<Trans>{{ key1, key2 }}</Trans>'),
        path: 'file.js'
      })

      i18nextParser.on('warning', message => {
        assert.equal(message, 'The passed in object contained more than one variable - the object should look like {{ value, format }} where format is optional.')
        done()
      })
      i18nextParser.end(fakeFile)
    })
  })
})
