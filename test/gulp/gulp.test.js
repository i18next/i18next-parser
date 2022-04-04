import { assert } from 'chai'
import { pEvent } from 'p-event'
import { fileURLToPath } from 'url'
import fs from 'fs-extra'
import gulp from 'gulp'
import path from 'path'
import sinon from 'sinon'
import './gulpfile.js'
import PluralRulesMock from '../Intl.PluralRules.mock.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('gulp plugin', function () {
  // test execution time depends on I/O
  this.timeout(0)

  beforeEach(async () => {
    await fs.emptyDir(path.resolve(__dirname, './locales'))
    sinon.replace(Intl, 'PluralRules', PluralRulesMock)
  })

  afterEach(async () => {
    await fs.emptyDir(path.resolve(__dirname, './locales'))
    sinon.restore()
  })

  it('works as a gulp plugin', async () => {
    const gulpStream = gulp.task('i18next')()

    await pEvent(gulpStream, 'end')

    const enReact = await fs.readJson(
      path.resolve(__dirname, './locales/en/react.json')
    )

    try {
      await fs.readJson(path.resolve(__dirname, './locales/en/react_old.json'))
    } catch (error) {
      assert.strictEqual(error.code, 'ENOENT')
    }

    const enNamespace = await fs.readJson(
      path.resolve(__dirname, './locales/en/test-namespace.json')
    )

    try {
      await fs.readJson(
        path.resolve(__dirname, './locales/en/test-namespace_old.json')
      )
    } catch (error) {
      assert.strictEqual(error.code, 'ENOENT')
    }

    const enKeyPrefix = await fs.readJson(
      path.resolve(__dirname, './locales/en/key-prefix.json')
    )

    try {
      await fs.readJson(
        path.resolve(__dirname, './locales/en/key-prefix_old.json')
      )
    } catch (error) {
      assert.strictEqual(error.code, 'ENOENT')
    }

    const enTranslation = await fs.readJson(
      path.resolve(__dirname, './locales/en/translation.json')
    )

    try {
      await fs.readJson(
        path.resolve(__dirname, './locales/en/translation_old.json')
      )
    } catch (error) {
      assert.strictEqual(error.code, 'ENOENT')
    }

    const frReact = await fs.readJson(
      path.resolve(__dirname, './locales/fr/react.json')
    )

    try {
      await fs.readJson(path.resolve(__dirname, './locales/fr/react_old.json'))
    } catch (error) {
      assert.strictEqual(error.code, 'ENOENT')
    }
    const frNamespace = await fs.readJson(
      path.resolve(__dirname, './locales/fr/test-namespace.json')
    )

    try {
      await fs.readJson(path.resolve(__dirname, './locales/fr/react_old.json'))
    } catch (error) {
      assert.strictEqual(error.code, 'ENOENT')
    }
    const frTranslation = await fs.readJson(
      path.resolve(__dirname, './locales/fr/translation.json')
    )

    try {
      await fs.readJson(path.resolve(__dirname, './locales/fr/react_old.json'))
    } catch (error) {
      assert.strictEqual(error.code, 'ENOENT')
    }

    assert.deepEqual(enReact, {
      bar: '',
      "don't split {{on}}": "don't split {{on}}",
      fifth_one: '',
      fifth_other: '',
      first: '',
      foo: '',
      fourth: '',
      'override-default': 'default override',
      second: '',
      third: {
        first_one:
          'Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.',
        first_other:
          'Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.',
        second: " <1>Hello,</1> this shouldn't be trimmed.",
        third: "<0>Hello,</0>this should be trimmed.<2> and this shoudln't</2>",
      },
      'This should be part of the value and the key':
        'This should be part of the value and the key',
    })
    assert.deepEqual(enNamespace, {
      'test-1': '',
      'test-2': '',
    })
    assert.deepEqual(enKeyPrefix, {
      'test-prefix': {
        foo: '',
        bar: '',
      },
    })
    assert.deepEqual(enTranslation, {
      fifth: 'bar',
      fifth_male: '',
      first: '',
      fourth: '',
      fourth_male: 'defaultValue',
      second: 'defaultValue',
      second_male: 'defaultValue',
      selfClosing: '',
      seventh: 'defaultValue',
      sixth: '',
      third: '{{var}} defaultValue',
      third_female: 'defaultValue',
    })

    assert.deepEqual(frReact, {
      bar: '',
      "don't split {{on}}": "don't split {{on}}",
      fifth_one: '',
      fifth_many: '',
      fifth_other: '',
      first: '',
      foo: '',
      fourth: '',
      'override-default': 'default override',
      second: '',
      third: {
        first_one:
          'Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.',
        first_many:
          'Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.',
        first_other:
          'Hello <1>{{name}}</1>, you have {{count}} unread message. <5>Go to messages</5>.',
        second: " <1>Hello,</1> this shouldn't be trimmed.",
        third: "<0>Hello,</0>this should be trimmed.<2> and this shoudln't</2>",
      },
      'This should be part of the value and the key':
        'This should be part of the value and the key',
    })
    assert.deepEqual(frNamespace, {
      'test-1': '',
      'test-2': '',
    })
    assert.deepEqual(frTranslation, {
      fifth: 'bar',
      fifth_male: '',
      first: '',
      fourth: '',
      fourth_male: 'defaultValue',
      second: 'defaultValue',
      second_male: 'defaultValue',
      selfClosing: '',
      seventh: 'defaultValue',
      sixth: '',
      third: '{{var}} defaultValue',
      third_female: 'defaultValue',
    })
  })
})
