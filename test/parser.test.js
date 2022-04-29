import { assert, expect } from 'chai'
import { fileURLToPath } from 'url'
import fs from 'fs'
import path from 'path'
import sinon from 'sinon'
import Vinyl from 'vinyl'
import i18nTransform from '../src/transform.js'

const enLibraryPath = path.normalize('en/translation.json')
const arLibraryPath = path.normalize('ar/translation.json')
const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('parser', () => {
  it('parses globally on multiple lines', (done) => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        "t('first'); t('second') \n t('third'); t('fourth');"
      ),
      path: 'file.js',
    })
    i18nextParser.once('data', (file) => {
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
      contents: Buffer.from("t(\n  'first'\n)\n t('second'); t(\n\n'third')"),
      path: 'file.js',
    })

    i18nextParser.on('data', (file) => {
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
      path: 'file.js',
    })

    i18nextParser.on('data', (file) => {
      if (file.relative.endsWith(enLibraryPath)) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.once('end', () => {
      assert.deepEqual(result, {
        first_female: '',
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
      path: 'file.html',
    })
    const expected = {
      first: '',
      second: '',
      third: '',
      fourth: '',
      fifth: 'bar',
      sixth: '',
      selfClosing: '',
    }

    i18nextParser.on('data', (file) => {
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
      path: 'file.hbs',
    })
    const expected = {
      first: '',
      second_male: 'defaultValue',
      third_female: 'defaultValue',
      fourth_male: 'defaultValue',
      fifth_male: '',
      sixth: '',
      seventh: 'defaultValue',
    }

    i18nextParser.on('data', (file) => {
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
      path: 'file.js',
    })
    const expected = {
      first: '',
      second: 'defaultValue',
      third: '{{var}} defaultValue',
      fourth: '',
    }

    i18nextParser.on('data', (file) => {
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
      path: 'react.jsx',
    })
    const expected = {
      first: '',
      second: '',
      third: {
        first_one:
          'Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.',
        first_other:
          'Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.',
        second: " <1>Hello,</1> this shouldn't be trimmed.",
        third: "<0>Hello,</0>this should be trimmed.<2> and this shoudln't</2>",
      },
      fourth: '',
      fifth_one: '',
      fifth_other: '',
      bar: '',
      foo: '',
      'This should be part of the value and the key':
        'This should be part of the value and the key',
      "don't split {{on}}": "don't split {{on}}",
      'override-default': 'default override',
    }

    i18nextParser.on('data', (file) => {
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
      path: 'typescript.tsx',
    })
    const expected = {
      first: '',
      second: '',
      third: {
        first_one:
          'Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.',
        first_other:
          'Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.',
        second: " <1>Hello,</1> this shouldn't be trimmed.",
        third: "<0>Hello,</0>this should be trimmed.<2> and this shoudln't</2>",
      },
      fourth: '',
      fifth_one: '',
      fifth_other: '',
      bar: '',
      foo: '',
      'This should be part of the value and the key':
        'This should be part of the value and the key',
      "don't split {{on}}": "don't split {{on}}",
    }

    i18nextParser.on('data', (file) => {
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

  it('creates one file per namespace and per locale', (done) => {
    let results = []
    const i18nextParser = new i18nTransform({
      locales: ['en', 'de', 'fr'],
      defaultNamespace: 'default',
    })
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        "t('ns1:first'); t('second') \n t('ns2:third'); t('fourth')"
      ),
      path: 'file.js',
    })

    i18nextParser.on('data', (file) => {
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
        'fr/ns2.json',
      ]
      let length = expectedFiles.length

      for (const filename of expectedFiles) {
        assert.include(results, path.normalize(filename))
        if (!--length) done()
      }
    })

    i18nextParser.end(fakeFile)
  })

  it('creates an empty namespace file if no key is provided', (done) => {
    let results = []
    let resultContent
    const i18nextParser = new i18nTransform({
      locales: ['en'],
      defaultNamespace: 'default',
    })
    const fakeFile = new Vinyl({
      contents: Buffer.from("t('empty:');"),
      path: 'file.js',
    })

    i18nextParser.on('data', (file) => {
      if (file.relative.endsWith(path.normalize('en/empty.json'))) {
        resultContent = JSON.parse(file.contents)
      }
      results.push(file.relative.replace(/locales[\//\\]/, ''))
    })
    i18nextParser.on('end', () => {
      const expectedFiles = ['en/empty.json']
      let length = expectedFiles.length

      assert.equal(results.length, 1)
      assert.deepEqual(resultContent, {})
      for (const filename of expectedFiles) {
        assert.include(results, path.normalize(filename))
        if (!--length) done()
      }
    })

    i18nextParser.end(fakeFile)
  })

  it.only('does not overwrite the namespace file if it already exists', (done) => {
    let resultContent
    const i18nextParser = new i18nTransform({
      locales: ['en'],
      defaultNamespace: 'test_empty',
    })
    const fakeFile = new Vinyl({
      contents: Buffer.from("t('key'); t('');"),
      path: 'file.js',
    })

    i18nextParser.on('data', (file) => {
      if (file.relative.endsWith(path.normalize('en/test_empty.json'))) {
        resultContent = JSON.parse(file.contents)
      }
    })
    i18nextParser.on('end', () => {
      assert.deepEqual(resultContent, { key: '' })
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('applies withTranslation namespace globally', (done) => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: fs.readFileSync(
        path.resolve(__dirname, 'templating/namespace-hoc.jsx')
      ),
      path: 'functional.jsx',
    })
    const expected = {
      'test-1': '',
      'test-2': '',
    }

    i18nextParser.on('data', (file) => {
      if (file.relative.endsWith(path.normalize('en/test-namespace.json'))) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.on('end', () => {
      assert.deepEqual(result, expected)
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('applies useTranslation namespace globally', (done) => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: fs.readFileSync(
        path.resolve(__dirname, 'templating/namespace-hook.jsx')
      ),
      path: 'functional.jsx',
    })
    const expected = {
      'test-1': '',
      'test-2': '',
    }

    i18nextParser.on('data', (file) => {
      if (file.relative.endsWith(path.normalize('en/test-namespace.json'))) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.on('end', () => {
      assert.deepEqual(result, expected)
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('applies useTranslation keyPrefix globally', (done) => {
    let result
    const i18nextParser = new i18nTransform()
    const fakeFile = new Vinyl({
      contents: fs.readFileSync(
        path.resolve(__dirname, 'templating/keyPrefix-hook.jsx')
      ),
      path: 'file.jsx',
    })
    const expected = {
      'test-prefix': {
        foo: '',
        bar: '',
      },
    }

    i18nextParser.on('data', (file) => {
      if (file.relative.endsWith(path.normalize('en/key-prefix.json'))) {
        result = JSON.parse(file.contents)
      }
    })
    i18nextParser.on('end', () => {
      assert.deepEqual(result, expected)
      done()
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
      path: 'file.js',
    })

    i18nextParser.on('data', (file) => {
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
      contents: Buffer.from("t('escaped backslash\\\\ newline\\n\\r tab\\t')"),
      path: 'file.js',
    })

    i18nextParser.on('data', (file) => {
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
      contents: Buffer.from("t('first')"),
      path: 'file.js',
    })

    i18nextParser.once('data', (file) => {
      assert(file.isBuffer())
      done()
    })

    i18nextParser.end(fakeFile)
  })

  it('retrieves values in existing catalog and creates old catalog', (done) => {
    let result, resultOld
    const i18nextParser = new i18nTransform({
      output: 'test/locales/$LOCALE/$NAMESPACE.json',
    })
    const fakeFile = new Vinyl({
      contents: Buffer.from("t('test_merge:first'); t('test_merge:second')"),
      path: 'file.js',
    })

    i18nextParser.on('data', (file) => {
      if (file.relative.endsWith(path.normalize('en/test_merge.json'))) {
        result = JSON.parse(file.contents)
      } else if (
        file.relative.endsWith(path.normalize('en/test_merge_old.json'))
      ) {
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
    const i18nextParser = new i18nTransform({
      output: 'test/locales/$LOCALE/$NAMESPACE.json',
    })
    const fakeFile = new Vinyl({
      contents: Buffer.from("t('test_leak:first'); t('test_leak:second')"),
      path: 'file.js',
    })

    i18nextParser.on('data', (file) => {
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
    const i18nextParser = new i18nTransform({
      output: 'test/locales/$LOCALE/$NAMESPACE.json',
    })
    const fakeFile = new Vinyl({
      contents: Buffer.from("t('test_context:first')"),
      path: 'file.js',
    })

    const expectedResult = {
      first: 'first',
      first_context1: 'first context1',
      first_context2: '',
    }

    i18nextParser.on('data', (file) => {
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
    const i18nextParser = new i18nTransform({
      output: 'test/locales/$LOCALE/$NAMESPACE.json',
    })
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        "t('test_old:parent.third', 'third'), t('test_old:fourth', 'fourth')"
      ),
      path: 'file.js',
    })

    const expectedResult = { parent: { third: 'third' }, fourth: 'fourth' }
    const expectedResultOld = {
      parent: { first: 'first', some: 'some' },
      second: 'second',
      other: 'other',
    }

    let result, resultOld
    i18nextParser.on('data', (file) => {
      if (file.relative.endsWith(path.normalize('en/test_old.json'))) {
        result = JSON.parse(file.contents)
      } else if (
        file.relative.endsWith(path.normalize('en/test_old_old.json'))
      ) {
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
    const i18nextParser = new i18nTransform({
      output: 'test/locales/$LOCALE/$NAMESPACE.json',
    })
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        "t('test_old:parent.some', 'random'), t('test_old:other', 'random')"
      ),
      path: 'file.js',
    })

    const expectedResult = { parent: { some: 'some' }, other: 'other' }
    const expectedResultOld = { parent: { first: 'first' }, second: 'second' }

    let result, resultOld
    i18nextParser.on('data', (file) => {
      if (file.relative.endsWith(path.normalize('en/test_old.json'))) {
        result = JSON.parse(file.contents)
      } else if (
        file.relative.endsWith(path.normalize('en/test_old_old.json'))
      ) {
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
    const i18nextParser = new i18nTransform({
      output: 'test/locales/$LOCALE/$NAMESPACE.json',
    })
    const fakeFile = new Vinyl({
      contents: Buffer.from(
        "t('test_plural:first_one'); t('test_plural:second_one')"
      ),
      path: 'file.js',
    })

    const expectedResult = {
      first_one: 'first',
      first_other: 'first plural',
      second_one: 'second',
      second_zero: 'second plural zero',
      second_other: 'second plural other',
    }

    i18nextParser.on('data', (file) => {
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
    const i18nextParser = new i18nTransform({
      output: 'test/locales/$LOCALE/$NAMESPACE.json',
    })
    const fakeFile = new Vinyl({
      contents: Buffer.from("t('test_context_plural:first')"),
      path: 'file.js',
    })

    const expectedResult = {
      first: 'first',
      first_context1_other: 'first context1 plural',
      first_context2_two: 'first context2 plural 2',
    }

    i18nextParser.on('data', (file) => {
      if (
        file.relative.endsWith(path.normalize('en/test_context_plural.json'))
      ) {
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
    describe('resetDefaultValueLocale', () => {
      it('will not reset a key if a default value has not changed in the locale', (done) => {
        const i18nextParser = new i18nTransform({
          resetDefaultValueLocale: 'fr',
          output: 'test/locales/$LOCALE/$NAMESPACE.json',
          locales: ['en', 'ar', 'fr'],
        })

        const fakeFile = new Vinyl({
          contents: Buffer.from(
            `t('test_reset:key', {
            defaultValue: 'defaultTranslation',
          })`
          ),
          path: 'file.js',
        })

        let enResult, arResult
        i18nextParser.on('data', (file) => {
          if (file.relative.endsWith(path.normalize('en/test_reset.json'))) {
            enResult = JSON.parse(file.contents)
          } else if (
            file.relative.endsWith(path.normalize('ar/test_reset.json'))
          ) {
            arResult = JSON.parse(file.contents)
          }
        })
        i18nextParser.once('end', () => {
          assert.deepEqual(enResult, {
            key: 'en_translation',
          })
          assert.deepEqual(arResult, {
            key: 'ar_translation',
          })
          done()
        })

        i18nextParser.end(fakeFile)
      })

      it('will reset a key if a default value has changed in the locale', (done) => {
        const i18nextParser = new i18nTransform({
          resetDefaultValueLocale: 'fr',
          output: 'test/locales/$LOCALE/$NAMESPACE.json',
          locales: ['en', 'ar', 'fr'],
        })

        const newString = 'newTranslation'

        const fakeFile = new Vinyl({
          contents: Buffer.from(
            `t('test_reset:key', {
            defaultValue: '${newString}',
          })`
          ),
          path: 'file.js',
        })

        let enResult, arResult
        i18nextParser.on('data', (file) => {
          if (file.relative.endsWith(path.normalize('en/test_reset.json'))) {
            enResult = JSON.parse(file.contents)
          } else if (
            file.relative.endsWith(path.normalize('ar/test_reset.json'))
          ) {
            arResult = JSON.parse(file.contents)
          }
        })
        i18nextParser.once('end', () => {
          assert.deepEqual(enResult, {
            key: newString,
          })
          assert.deepEqual(arResult, {
            key: newString,
          })
          done()
        })

        i18nextParser.end(fakeFile)
      })
    })

    describe('verbose', () => {
      beforeEach(() => {
        sinon.spy(console, 'log')
      })

      afterEach(() => {
        console.log.restore()
      })

      it('logs stats unique keys per namespace', (done) => {
        const i18nextParser = new i18nTransform({
          verbose: true,
          output: 'test/locales/$LOCALE/$NAMESPACE.json',
          locales: ['en'],
        })
        const fakeFile = new Vinyl({
          contents: Buffer.from(
            `t('key', {
              ns: 'namespace1',
            })
            t('key', {
              ns: 'namespace1'
            })
            t('key2', {
              ns: 'namespace1',
              count: 1
            })
            t('key2', {
              ns: 'namespace1',
              count: 2
            })
            t('key', {
              ns: 'namespace2',
            })
            `
          ),
          path: 'file.js',
        })

        i18nextParser.on('data', () => {})

        i18nextParser.once('end', () => {
          assert(console.log.calledWith('Unique keys: 3 (2 are plurals)')) // namespace1
          assert(console.log.calledWith('Unique keys: 1 (0 are plurals)')) // namespace2
          done()
        })

        i18nextParser.end(fakeFile)
      })

      it('logs added and removed keys', (done) => {
        const i18nextParser = new i18nTransform({
          verbose: true,
          output: 'test/locales/$LOCALE/$NAMESPACE.json',
          locales: ['en'],
        })
        const fakeFile = new Vinyl({
          contents: Buffer.from(
            `
            t('test_log:was_present')
            t('test_log:was_not_present')
            t('test_log:was_present_but_not_plural', {
              count: 1
            })
            t('test_log:was_not_present_and_plural', {
              count: 1
            })
            t('test_log:was_present_and_plural_but_no_more')
            `
          ),
          path: 'file.js',
        })

        i18nextParser.on('data', () => {})

        i18nextParser.once('end', () => {
          assert(console.log.calledWith('Added keys: 6'))
          assert(console.log.calledWith('Removed keys: 3'))
          done()
        })

        i18nextParser.end(fakeFile)
      })

      describe('with defaultResetLocale', () => {
        it('logs the number of values reset', (done) => {
          const i18nextParser = new i18nTransform({
            verbose: true,
            resetDefaultValueLocale: 'fr',
            output: 'test/locales/$LOCALE/$NAMESPACE.json',
            locales: ['en', 'fr'],
          })

          const newString = 'newTranslation'

          const fakeFile = new Vinyl({
            contents: Buffer.from(
              `t('test_reset:key', {
              defaultValue: '${newString}',
            })`
            ),
            path: 'file.js',
          })

          i18nextParser.on('data', () => {})

          i18nextParser.once('end', () => {
            assert(console.log.calledWith('Reset keys: 1'))
            done()
          })

          i18nextParser.end(fakeFile)
        })
      })
    })

    it('handles output with $LOCALE and $NAMESPACE var', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        locales: ['en'],
        defaultNamespace: 'default',
        output: 'locales/$LOCALE/p-$LOCALE-$NAMESPACE.$LOCALE.i18n',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('fourth')"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
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
        keySeparator: '-',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from(
          "t('test_separators?first'); t('test_separators?second-third')"
        ),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
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
        keySeparator: false,
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('Status: loading...')"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
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
        defaultValue: 'NOT_TRANSLATED',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('first')"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
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

    it('supports a defaultValue function', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        defaultValue: (locale, namespace, key) =>
          `${locale}:${namespace}:${key}`,
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('first')"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(enLibraryPath)) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, { first: 'en:translation:first' })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('supports a useKeysAsDefaultValue function', (done) => {
      let enResult
      let arResult
      const i18nextParser = new i18nTransform({
        locales: ['en', 'ar'],
        useKeysAsDefaultValue: (locale, namespace) => locale === 'en',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('first')"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(enLibraryPath)) {
          enResult = JSON.parse(file.contents)
        } else if (file.relative.endsWith(arLibraryPath)) {
          arResult = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(enResult, { first: 'first' })
        assert.deepEqual(arResult, { first: '' })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('supports a skipDefaultValues function', (done) => {
      let enResult
      let arResult
      const i18nextParser = new i18nTransform({
        locales: ['en', 'ar'],
        skipDefaultValues: (locale, namespace) => locale === 'en',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('first', { defaultValue: 'default' })"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(enLibraryPath)) {
          enResult = JSON.parse(file.contents)
        } else if (file.relative.endsWith(arLibraryPath)) {
          arResult = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(enResult, { first: '' })
        assert.deepEqual(arResult, { first: 'default' })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('supports a lineEnding', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        lineEnding: '\r\n',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('first')"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
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
        lineEnding: '\r\n',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('first')"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
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

    it('parses Trans from js file with lexer override to JsxLexer', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        lexers: {
          js: [
            {
              lexer: 'JsxLexer',
            },
          ],
        },
      })
      const fakeFile = new Vinyl({
        contents: fs.readFileSync(
          path.resolve(__dirname, 'templating/react.jsx')
        ),
        path: 'react.js',
      })
      const expected = {
        first: '',
        second: '',
        third: {
          first_one:
            'Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.',
          first_other:
            'Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.',
          second: " <1>Hello,</1> this shouldn't be trimmed.",
          third:
            "<0>Hello,</0>this should be trimmed.<2> and this shoudln't</2>",
        },
        fourth: '',
        fifth_one: '',
        fifth_other: '',
        bar: '',
        foo: '',
        'This should be part of the value and the key':
          'This should be part of the value and the key',
        "don't split {{on}}": "don't split {{on}}",
        'override-default': 'default override',
      }

      i18nextParser.on('data', (file) => {
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

    it('parses Trans, keeping tags without attributes inline, if transSupportBasicHtmlNodes is true', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        lexers: {
          jsx: [
            {
              lexer: 'JsxLexer',
              transSupportBasicHtmlNodes: true,
              transKeepBasicHtmlNodesFor: ['strong', 'b'],
            },
          ],
        },
      })
      const fakeFile = new Vinyl({
        contents: fs.readFileSync(
          path.resolve(__dirname, 'templating/react.jsx')
        ),
        path: 'react.jsx',
      })
      const expected = {
        first: '',
        second: '',
        third: {
          first_one:
            'Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.',
          first_other:
            'Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.',
          second: " <b>Hello,</b> this shouldn't be trimmed.",
          third:
            "<b>Hello,</b>this should be trimmed.<2> and this shoudln't</2>",
        },
        fourth: '',
        fifth_one: '',
        fifth_other: '',
        bar: '',
        foo: '',
        'This should be part of the value and the key':
          'This should be part of the value and the key',
        "don't split {{on}}": "don't split {{on}}",
        'override-default': 'default override',
      }

      i18nextParser.on('data', (file) => {
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

    it('writes non-breaking space output to json', (done) => {
      let result
      const expected = '{\n  "nbsp": "Oné\\u00a0Twó\\u3000Three Four"\n}\n'

      const i18nextParser = new i18nTransform({
        output: 'locales/$LOCALE/$NAMESPACE.json',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('nbsp', 'Oné\\u00A0Twó\\u3000Three Four')"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(path.normalize('en/translation.json'))) {
          result = file.contents.toString('utf8')
        }
      })
      i18nextParser.once('end', () => {
        assert.equal(result, expected)
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('supports outputing to yml', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        output: 'locales/$LOCALE/$NAMESPACE.yml',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('first')"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(path.normalize('en/translation.yml'))) {
          result = file.contents.toString('utf8')
        }
      })
      i18nextParser.once('end', () => {
        assert.equal(result.replace(/\r\n/g, '\n'), "first: ''\n")
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('writes multiline output to yml', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        output: 'locales/$LOCALE/$NAMESPACE.yml',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('multiline', 'One\\nTwo')"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(path.normalize('en/translation.yml'))) {
          result = file.contents.toString('utf8')
        }
      })
      i18nextParser.once('end', () => {
        assert.equal(
          result.replace(/\r\n/g, '\n'),
          `multiline: |-
  One
  Two
`
        )
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('writes non-breaking space output to yml', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        output: 'locales/$LOCALE/$NAMESPACE.yml',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('nbsp', 'One\\u00A0Two')"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(path.normalize('en/translation.yml'))) {
          result = file.contents.toString('utf8')
        }
      })
      i18nextParser.once('end', () => {
        assert.equal(result.replace(/\r\n/g, '\n'), 'nbsp: "One\\_Two"\n')
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('reads existing yml catalog', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        output: 'test/locales/$LOCALE/test.yml',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('first')"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
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
        indentation: 6,
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('first')"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(enLibraryPath)) {
          result = file.contents.toString('utf8')
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(
          result.replace(/\r\n/g, '\n').split('\n')[1],
          '      "first": ""'
        )
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('handles skipping the old catalog with createOldCatalogs=false', (done) => {
      let results = []
      const i18nextParser = new i18nTransform({
        defaultNamespace: 'default',
        createOldCatalogs: false,
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('ns1:first'); t('second') \n t('fourth')"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        results.push(file.relative.replace(/locales[\\\/]/, ''))
      })
      i18nextParser.on('end', () => {
        const expectedFiles = [
          'en/default.json',
          'en/ns1.json',
          'fr/default.json',
          'fr/ns1.json',
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
        path: 'file.js',
      })

      i18nextParser.once('data', (file) => {
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
            seven: 'six.seven',
          },
        })
        done()
      })
      i18nextParser.end(fakeFile)
    })

    it('generates plurals', (done) => {
      let result
      const i18nextParser = new i18nTransform()
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('test {{count}}', { count: 1 })"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(enLibraryPath)) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, {
          'test {{count}}_one': '',
          'test {{count}}_other': '',
        })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('generates plurals with custom plural separator', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        pluralSeparator: '~~~',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('test {{count}}', { count: 1 })"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(enLibraryPath)) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, {
          'test {{count}}~~~one': '',
          'test {{count}}~~~other': '',
        })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('generates plurals according to compatibilityJSON value', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        i18nextOptions: { compatibilityJSON: 'v3' },
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('test {{count}}', { count: 1 })"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(enLibraryPath)) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, {
          'test {{count}}': '',
          'test {{count}}_plural': '',
        })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('generates plurals according to compatibilityJSON value for languages with multiple plural forms', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        locales: ['ar'],
        i18nextOptions: { compatibilityJSON: 'v3' },
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('test {{count}}', { count: 1 })"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(arLibraryPath)) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, {
          'test {{count}}_0': '',
          'test {{count}}_1': '',
          'test {{count}}_2': '',
          'test {{count}}_3': '',
          'test {{count}}_4': '',
          'test {{count}}_5': '',
        })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('generates one plural key for unknow languages', (done) => {
      let result
      const i18nextParser = new i18nTransform({ locales: ['unknown'] })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('test {{count}}', { count: 1 })"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (
          file.relative.endsWith(path.normalize('unknown/translation.json'))
        ) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, {
          'test {{count}}_one': '',
          'test {{count}}_other': '',
        })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('generates plurals for languages with multiple plural forms', (done) => {
      let result
      const i18nextParser = new i18nTransform({ locales: ['ar'] })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('test {{count}}', { count: 1 })"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(arLibraryPath)) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, {
          'test {{count}}_zero': '',
          'test {{count}}_one': '',
          'test {{count}}_two': '',
          'test {{count}}_few': '',
          'test {{count}}_many': '',
          'test {{count}}_other': '',
        })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('generates plurals with key as value', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        useKeysAsDefaultValue: true,
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('test {{count}}', { count: 1 })"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(enLibraryPath)) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, {
          'test {{count}}_one': 'test {{count}}',
          'test {{count}}_other': 'test {{count}}',
        })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('generates plurals for defaultValue as second parameter', (done) => {
      let result
      const i18nextParser = new i18nTransform()
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('key', 'test {{count}}', { count })"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(enLibraryPath)) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, {
          key_one: 'test {{count}}',
          key_other: 'test {{count}}',
        })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('generates plurals for different defaultValue in singular and plural form', (done) => {
      let result
      const i18nextParser = new i18nTransform()
      const fakeFile = new Vinyl({
        contents: Buffer.from(
          "t('key', { count, defaultValue: 'singular {{count}}', defaultValue_other: 'plural {{count}}' })"
        ),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(enLibraryPath)) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, {
          key_one: 'singular {{count}}',
          key_other: 'plural {{count}}',
        })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('generates plurals for different defaultValue in plural forms with fallback', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        locales: ['ar'],
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from(
          `t('key', {
            count,
            defaultValue: 'default for missing',
            defaultValue_zero: 'zero {{count}}',
            defaultValue_one: 'one {{count}}',
            defaultValue_two: 'two {{count}}',
            defaultValue_few: 'three-ten {{count}}',
          })`
        ),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(arLibraryPath)) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, {
          key_zero: 'zero {{count}}',
          key_one: 'one {{count}}',
          key_two: 'two {{count}}',
          key_few: 'three-ten {{count}}',
          // Missing forms fall back on default
          key_many: 'default for missing',
          key_other: 'default for missing',
        })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('generates plurals with key as value for languages with multiple plural forms', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        useKeysAsDefaultValue: true,
        locales: ['ar'],
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('test {{count}}', { count: 1 })"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(arLibraryPath)) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, {
          'test {{count}}_zero': 'test {{count}}',
          'test {{count}}_one': 'test {{count}}',
          'test {{count}}_two': 'test {{count}}',
          'test {{count}}_few': 'test {{count}}',
          'test {{count}}_many': 'test {{count}}',
          'test {{count}}_other': 'test {{count}}',
        })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('generates ordinal', (done) => {
      let result
      const i18nextParser = new i18nTransform()
      const fakeFile = new Vinyl({
        contents: Buffer.from(
          "t('test {{count}}', { count: 1, ordinal: true })"
        ),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(enLibraryPath)) {
          result = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, {
          'test {{count}}_one': '',
          'test {{count}}_two': '',
          'test {{count}}_few': '',
          'test {{count}}_other': '',
        })
        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('supports skipDefaultValues option', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        skipDefaultValues: true,
      })

      const fakeFile = new Vinyl({
        contents: Buffer.from(
          "t('headline1', 'There will be a headline here.') \n" +
            "t('headline2', {defaultValue: 'Another Headline here'}})"
        ),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        result = JSON.parse(file.contents)
      })

      i18nextParser.on('end', () => {
        assert.deepEqual(result, {
          headline1: '',
          headline2: '',
        })

        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('supports customValueTemplate option', (done) => {
      let result
      const i18nextParser = new i18nTransform({
        customValueTemplate: {
          message: '${defaultValue}',
          description: '${max}',
          namespace: '${namespace}',
          key: '${key}',
        },
      })

      const fakeFile = new Vinyl({
        contents: Buffer.from(
          "t('test'); t('salt', {defaultValue: 'salty', max: 150})"
        ),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        result = JSON.parse(file.contents)
      })

      i18nextParser.once('end', () => {
        assert.deepEqual(result, {
          test: {
            message: '',
            description: '',
            namespace: 'translation',
            key: 'test',
          },
          salt: {
            message: 'salty',
            description: '150',
            namespace: 'translation',
            key: 'salt',
          },
        })

        done()
      })

      i18nextParser.end(fakeFile)
    })

    it('supports keepRemoved option', (done) => {
      let result, resultOld
      const i18nextParser = new i18nTransform({
        keepRemoved: true,
        output: 'test/locales/$LOCALE/$NAMESPACE.json',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('test_merge:first'); t('test_merge:second')"),
        path: 'file.js',
      })

      i18nextParser.on('data', (file) => {
        if (file.relative.endsWith(path.normalize('en/test_merge.json'))) {
          result = JSON.parse(file.contents)
        } else if (
          file.relative.endsWith(path.normalize('en/test_merge_old.json'))
        ) {
          resultOld = JSON.parse(file.contents)
        }
      })
      i18nextParser.once('end', () => {
        assert.deepEqual(result, { first: 'first', second: '', third: 'third' })
        assert.deepEqual(resultOld, undefined)
        done()
      })

      i18nextParser.end(fakeFile)
    })

    describe('lexers', () => {
      it('supports custom lexers options', (done) => {
        let result
        const i18nextParser = new i18nTransform({
          lexers: {
            js: [
              {
                lexer: 'JavascriptLexer',
                functions: ['bla', '_e'],
              },
            ],
          },
        })
        const fakeFile = new Vinyl({
          contents: Buffer.from("bla('first'); _e('second')"),
          path: 'file.js',
        })

        i18nextParser.on('data', (file) => {
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

      it('supports function as custom lexer', (done) => {
        class CustomLexer {
          extract(content) {
            return content.split(';').map((key) => ({ key }))
          }

          on() {}
        }

        let result
        const i18nextParser = new i18nTransform({
          lexers: {
            js: [CustomLexer],
          },
        })
        const fakeFile = new Vinyl({
          contents: Buffer.from('first;second'),
          path: 'file.js',
        })

        i18nextParser.on('data', (file) => {
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

      it('pass options to custom lexer', (done) => {
        class CustomLexer {
          constructor(options) {
            this.delimiter = options.delimiter
          }

          extract(content) {
            return content.split(this.delimiter).map((key) => ({ key }))
          }

          on() {}
        }

        let result
        const i18nextParser = new i18nTransform({
          lexers: {
            js: [
              {
                lexer: CustomLexer,
                delimiter: '@',
              },
            ],
          },
        })
        const fakeFile = new Vinyl({
          contents: Buffer.from('first@second'),
          path: 'file.js',
        })

        i18nextParser.on('data', (file) => {
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
          contents: Buffer.from(`
            t('bbb.aaA');
            t('pluralKey_withContext', { count: 1, context: 'male' });
            t('aaA');
            t('bbb.withContext', { context: 'male' });
            t('aaa');
            t('bbb.pluralKey', { count: 1 });
            t('pluralKey', { count: 1 });
            t('bbb.withContext', { context: 'female' });
            t('aa1');
            t('withContext', { context: 'male' });
            t('aaa_aaa');
            t('bbb.pluralKey_withContext', { count: 1, context: 'male' });
            t('bbb.aa1');
            t('pluralKey_withContext', { count: 1, context: 'female' });
            t('bbb.ccc');
            t('bbb.pluralKey_withContext', { count: 1, context: 'female' });
            t('withContext', { context: 'female' });
            t('bbb.aaa');
            t('bbb.aaa_aaa');
          `),
          path: 'file.js',
        })

        i18nextParser.on('data', (file) => {
          if (file.relative.endsWith(enLibraryPath)) {
            result = JSON.parse(file.contents)
          }
        })
        i18nextParser.once('end', () => {
          assert.sameOrderedMembers(Object.keys(result), [
            'bbb',
            'pluralKey_withContext_male_one',
            'pluralKey_withContext_male_other',
            'aaA',
            'aaa',
            'pluralKey_one',
            'pluralKey_other',
            'aa1',
            'withContext_male',
            'aaa_aaa',
            'pluralKey_withContext_female_one',
            'pluralKey_withContext_female_other',
            'withContext_female',
          ])
          assert.sameOrderedMembers(Object.keys(result.bbb), [
            'aaA',
            'withContext_male',
            'pluralKey_one',
            'pluralKey_other',
            'withContext_female',
            'pluralKey_withContext_male_one',
            'pluralKey_withContext_male_other',
            'aa1',
            'ccc',
            'pluralKey_withContext_female_one',
            'pluralKey_withContext_female_other',
            'aaa',
            'aaa_aaa',
          ])
          done()
        })

        i18nextParser.end(fakeFile)
      })

      it('supports sort as a boolean', (done) => {
        let result
        const i18nextParser = new i18nTransform({
          sort: true,
        })
        const fakeFile = new Vinyl({
          contents: Buffer.from(`
            t('bbb.aaA');
            t('pluralKey_withContext', { count: 1, context: 'male' });
            t('aaA');
            t('bbb.withContext', { context: 'male' });
            t('aaa');
            t('bbb.pluralKey', { count: 1 });
            t('pluralKey', { count: 1 });
            t('bbb.withContext', { context: 'female' });
            t('aa1');
            t('withContext', { context: 'male' });
            t('aaa_aaa');
            t('bbb.pluralKey_withContext', { count: 1, context: 'male' });
            t('bbb.aa1');
            t('pluralKey_withContext', { count: 1, context: 'female' });
            t('bbb.ccc');
            t('bbb.pluralKey_withContext', { count: 1, context: 'female' });
            t('withContext', { context: 'female' });
            t('bbb.aaa');
            t('bbb.aaa_aaa');
          `),
          path: 'file.js',
        })

        i18nextParser.on('data', (file) => {
          if (file.relative.endsWith(enLibraryPath)) {
            result = JSON.parse(file.contents)
          }
        })
        i18nextParser.once('end', () => {
          assert.sameOrderedMembers(Object.keys(result), [
            'aa1',
            'aaa',
            'aaA',
            'aaa_aaa',
            'bbb',
            'pluralKey_one',
            'pluralKey_other',
            'pluralKey_withContext_female_one',
            'pluralKey_withContext_female_other',
            'pluralKey_withContext_male_one',
            'pluralKey_withContext_male_other',
            'withContext_female',
            'withContext_male',
          ])
          assert.sameOrderedMembers(Object.keys(result.bbb), [
            'aa1',
            'aaa',
            'aaA',
            'aaa_aaa',
            'ccc',
            'pluralKey_one',
            'pluralKey_other',
            'pluralKey_withContext_female_one',
            'pluralKey_withContext_female_other',
            'pluralKey_withContext_male_one',
            'pluralKey_withContext_male_other',
            'withContext_female',
            'withContext_male',
          ])
          done()
        })

        i18nextParser.end(fakeFile)
      })

      it('supports sort of the plural keys in count order', (done) => {
        let result
        const i18nextParser = new i18nTransform({
          sort: true,
          locales: ['ar'],
        })
        const fakeFile = new Vinyl({
          contents: Buffer.from(`
            t('bbb.aaA');
            t('pluralKey_withContext', { count: 1, context: 'male' });
            t('aaA');
            t('bbb.withContext', { context: 'male' });
            t('aaa');
            t('bbb.pluralKey', { count: 1 });
            t('pluralKey', { count: 1 });
            t('bbb.withContext', { context: 'female' });
            t('aa1');
            t('withContext', { context: 'male' });
            t('aaa_aaa');
            t('bbb.pluralKey_withContext', { count: 1, context: 'male' });
            t('bbb.aa1');
            t('pluralKey_withContext', { count: 1, context: 'female' });
            t('bbb.ccc');
            t('bbb.pluralKey_withContext', { count: 1, context: 'female' });
            t('withContext', { context: 'female' });
            t('bbb.aaa');
            t('bbb.aaa_aaa');
          `),
          path: 'file.js',
        })

        i18nextParser.on('data', (file) => {
          if (file.relative.endsWith(arLibraryPath)) {
            result = JSON.parse(file.contents)
          }
        })
        i18nextParser.once('end', () => {
          assert.sameOrderedMembers(Object.keys(result), [
            'aa1',
            'aaa',
            'aaA',
            'aaa_aaa',
            'bbb',
            'pluralKey_zero',
            'pluralKey_one',
            'pluralKey_two',
            'pluralKey_few',
            'pluralKey_many',
            'pluralKey_other',
            'pluralKey_withContext_female_zero',
            'pluralKey_withContext_female_one',
            'pluralKey_withContext_female_two',
            'pluralKey_withContext_female_few',
            'pluralKey_withContext_female_many',
            'pluralKey_withContext_female_other',
            'pluralKey_withContext_male_zero',
            'pluralKey_withContext_male_one',
            'pluralKey_withContext_male_two',
            'pluralKey_withContext_male_few',
            'pluralKey_withContext_male_many',
            'pluralKey_withContext_male_other',
            'withContext_female',
            'withContext_male',
          ])
          assert.sameOrderedMembers(Object.keys(result.bbb), [
            'aa1',
            'aaa',
            'aaA',
            'aaa_aaa',
            'ccc',
            'pluralKey_zero',
            'pluralKey_one',
            'pluralKey_two',
            'pluralKey_few',
            'pluralKey_many',
            'pluralKey_other',
            'pluralKey_withContext_female_zero',
            'pluralKey_withContext_female_one',
            'pluralKey_withContext_female_two',
            'pluralKey_withContext_female_few',
            'pluralKey_withContext_female_many',
            'pluralKey_withContext_female_other',
            'pluralKey_withContext_male_zero',
            'pluralKey_withContext_male_one',
            'pluralKey_withContext_male_two',
            'pluralKey_withContext_male_few',
            'pluralKey_withContext_male_many',
            'pluralKey_withContext_male_other',
            'withContext_female',
            'withContext_male',
          ])
          done()
        })

        i18nextParser.end(fakeFile)
      })

      it('supports sort as a function', (done) => {
        let result
        const i18nextParser = new i18nTransform({
          sort: (a, b) => a.slice(0, -1).localeCompare(b.slice(0, -1)),
          locales: ['ar'],
        })
        const fakeFile = new Vinyl({
          contents: Buffer.from(`
            t('bbb.aaA');
            t('pluralKey_withContext', { count: 1, context: 'male' });
            t('aaA');
            t('bbb.withContext', { context: 'male' });
            t('aaa');
            t('bbb.pluralKey', { count: 1 });
            t('pluralKey', { count: 1 });
            t('bbb.withContext', { context: 'female' });
            t('aa1');
            t('withContext', { context: 'male' });
            t('aaa_aaa');
            t('bbb.pluralKey_withContext', { count: 1, context: 'male' });
            t('bbb.aa1');
            t('pluralKey_withContext', { count: 1, context: 'female' });
            t('bbb.ccc');
            t('bbb.pluralKey_withContext', { count: 1, context: 'female' });
            t('withContext', { context: 'female' });
            t('bbb.aaa');
            t('bbb.aaa_aaa');
          `),
          path: 'file.js',
        })

        i18nextParser.on('data', (file) => {
          if (file.relative.endsWith(arLibraryPath)) {
            result = JSON.parse(file.contents)
          }
        })
        i18nextParser.once('end', () => {
          assert.sameOrderedMembers(Object.keys(result), [
            'aaA',
            'aaa',
            'aa1',
            'aaa_aaa',
            'bbb',
            'pluralKey_few',
            'pluralKey_many',
            'pluralKey_one',
            'pluralKey_other',
            'pluralKey_two',
            'pluralKey_withContext_female_few',
            'pluralKey_withContext_female_many',
            'pluralKey_withContext_female_one',
            'pluralKey_withContext_female_other',
            'pluralKey_withContext_female_two',
            'pluralKey_withContext_female_zero',
            'pluralKey_withContext_male_few',
            'pluralKey_withContext_male_many',
            'pluralKey_withContext_male_one',
            'pluralKey_withContext_male_other',
            'pluralKey_withContext_male_two',
            'pluralKey_withContext_male_zero',
            'pluralKey_zero',
            'withContext_female',
            'withContext_male',
          ])
          assert.sameOrderedMembers(Object.keys(result.bbb), [
            'aaA',
            'aa1',
            'aaa',
            'aaa_aaa',
            'ccc',
            'pluralKey_few',
            'pluralKey_many',
            'pluralKey_one',
            'pluralKey_other',
            'pluralKey_two',
            'pluralKey_withContext_female_few',
            'pluralKey_withContext_female_many',
            'pluralKey_withContext_female_one',
            'pluralKey_withContext_female_other',
            'pluralKey_withContext_female_two',
            'pluralKey_withContext_female_zero',
            'pluralKey_withContext_male_few',
            'pluralKey_withContext_male_many',
            'pluralKey_withContext_male_one',
            'pluralKey_withContext_male_other',
            'pluralKey_withContext_male_two',
            'pluralKey_withContext_male_zero',
            'pluralKey_zero',
            'withContext_female',
            'withContext_male',
          ])
          done()
        })

        i18nextParser.end(fakeFile)
      })

      it('supports sort of old catalog', (done) => {
        const i18nextParser = new i18nTransform({
          output: 'test/locales/$LOCALE/$NAMESPACE.json',
          sort: true,
          locales: ['ar'],
        })
        const fakeFile = new Vinyl({
          contents: Buffer.from("t('test_sort:ccc'), t('test_sort:bbb.ddd')"),
          path: 'file.js',
        })

        let result, resultOld
        i18nextParser.on('data', (file) => {
          if (file.relative.endsWith(path.normalize('ar/test_sort.json'))) {
            result = JSON.parse(file.contents)
          } else if (
            file.relative.endsWith(path.normalize('ar/test_sort_old.json'))
          ) {
            resultOld = JSON.parse(file.contents)
          }
        })
        i18nextParser.once('end', () => {
          assert.sameOrderedMembers(Object.keys(result), ['bbb', 'ccc'])
          assert.sameOrderedMembers(Object.keys(result.bbb), ['ddd'])
          assert.sameOrderedMembers(Object.keys(resultOld), [
            'aa1',
            'aaa',
            'aaA',
            'aaa_aaa',
            'bbb',
            'pluralKey_zero',
            'pluralKey_one',
            'pluralKey_two',
            'pluralKey_few',
            'pluralKey_many',
            'pluralKey_other',
            'pluralKey_withContext_female_zero',
            'pluralKey_withContext_female_one',
            'pluralKey_withContext_female_two',
            'pluralKey_withContext_female_few',
            'pluralKey_withContext_female_many',
            'pluralKey_withContext_female_other',
            'pluralKey_withContext_male_zero',
            'pluralKey_withContext_male_one',
            'pluralKey_withContext_male_two',
            'pluralKey_withContext_male_few',
            'pluralKey_withContext_male_many',
            'pluralKey_withContext_male_other',
            'withContext_female',
            'withContext_male',
          ])
          assert.sameOrderedMembers(Object.keys(resultOld.bbb), [
            'aa1',
            'aaa',
            'aaA',
            'aaa_aaa',
            'ccc',
            'pluralKey_zero',
            'pluralKey_one',
            'pluralKey_two',
            'pluralKey_few',
            'pluralKey_many',
            'pluralKey_other',
            'pluralKey_withContext_female_zero',
            'pluralKey_withContext_female_one',
            'pluralKey_withContext_female_two',
            'pluralKey_withContext_female_few',
            'pluralKey_withContext_female_many',
            'pluralKey_withContext_female_other',
            'pluralKey_withContext_male_zero',
            'pluralKey_withContext_male_one',
            'pluralKey_withContext_male_two',
            'pluralKey_withContext_male_few',
            'pluralKey_withContext_male_many',
            'pluralKey_withContext_male_other',
            'withContext_female',
            'withContext_male',
          ])
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
        path: 'file.js',
      })

      i18nextParser.on('reading', (file) => {
        result = file.path
      })
      i18nextParser.on('finish', () => {
        assert.equal(result, 'file.js')
        done()
      })
      i18nextParser.end(fakeFile)
    })

    it('emits a `error` event if the catalog is not valid json', (done) => {
      const i18nextParser = new i18nTransform({
        output: 'test/locales/$LOCALE/$NAMESPACE.json',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from("t('test_invalid:content')"),
        path: 'file.js',
      })

      i18nextParser.on('error', (error) => {
        assert.equal(error.message.startsWith('Unexpected token /'), true)
        done()
      })
      i18nextParser.end(fakeFile)
    })

    it('emits an `error` if a lexer does not exist', (done) => {
      const i18nextParser = new i18nTransform({ lexers: { js: ['fakeLexer'] } })
      const fakeFile = new Vinyl({
        contents: Buffer.from('content'),
        path: 'file.js',
      })

      i18nextParser.on('error', (error) => {
        assert.equal(error.message, "Lexer 'fakeLexer' does not exist")
        done()
      })
      i18nextParser.end(fakeFile)
    })

    it('emits a `warning` event if a key contains a variable', (done) => {
      const i18nextParser = new i18nTransform({
        output: 'test/locales/$LOCALE/$NAMESPACE.json',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from('t(variable)'),
        path: 'file.js',
      })

      i18nextParser.on('warning', (message) => {
        assert.equal(message, 'Key is not a string literal: variable')
        done()
      })
      i18nextParser.end(fakeFile)
    })

    it('emits a `warning` event if a namespace contains a variable', (done) => {
      const i18nextParser = new i18nTransform({
        output: 'test/locales/$LOCALE/$NAMESPACE.json',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from('<Trans i18nKey={variable} />'),
        path: 'file.jsx',
      })

      i18nextParser.on('warning', (message) => {
        assert.equal(message, 'Namespace is not a string literal: variable')
        done()
      })
      i18nextParser.end(fakeFile)
    })

    it('emits a `warning` event if a react value contains two variables', (done) => {
      const i18nextParser = new i18nTransform({
        output: 'test/locales/$LOCALE/$NAMESPACE.json',
      })
      const fakeFile = new Vinyl({
        contents: Buffer.from('<Trans>{{ key1, key2 }}</Trans>'),
        path: 'file.jsx',
      })

      i18nextParser.on('warning', (message) => {
        assert.equal(
          message,
          'The passed in object contained more than one variable - the object should look like {{ value, format }} where format is optional.'
        )
        done()
      })
      i18nextParser.end(fakeFile)
    })
  })
})
