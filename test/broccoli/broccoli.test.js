import { assert } from 'chai'
import { fileURLToPath } from 'url'
import broccoli from 'broccoli'
import fs from 'fs-extra'
import path from 'path'
import sinon from 'sinon'
import brocFile from './Brocfile.js'
import PluralRulesMock from '../Intl.PluralRules.mock.js'

const { Builder } = broccoli
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const broccoliTmpDir = path.join(__dirname, '_broccoli_tmp')

describe('broccoli plugin', function () {
  // test execution time depends on I/O
  this.timeout(0)

  let builder = null

  beforeEach(async () => {
    await fs.emptyDir(path.resolve(__dirname, './src/locales'))
    await fs.emptyDir(broccoliTmpDir)

    sinon.replace(Intl, 'PluralRules', PluralRulesMock)
    builder = new Builder(brocFile, {
      // Place temporary files someplace under the current working directory,
      // as glob-stream doesn't look further down on the file system than that
      tmpdir: broccoliTmpDir,
    })
  })

  afterEach(async () => {
    await fs.emptyDir(path.resolve(__dirname, './src/locales'))

    await builder.cleanup()
    sinon.restore()
  })

  it('works as a broccoli plugin', async () => {
    await builder.build()

    const enTranslation = await fs.readJson(
      path.resolve(__dirname, './src/locales/en/translation.json')
    )

    try {
      await fs.readJson(
        path.resolve(__dirname, './src/locales/en/translation_old.json')
      )
    } catch (error) {
      assert.strictEqual(error.code, 'ENOENT')
    }

    const frTranslation = await fs.readJson(
      path.resolve(__dirname, './src/locales/fr/translation.json')
    )

    try {
      await fs.readJson(
        path.resolve(__dirname, './src/locales/fr/translation_old.json')
      )
    } catch (error) {
      assert.strictEqual(error.code, 'ENOENT')
    }

    assert.deepEqual(enTranslation, {
      eighth_one: '',
      eighth_other: '',
      fifth_male: '',
      first: '',
      fourth: '',
      fourth_male: 'defaultValue',
      second: 'defaultValue',
      second_male: 'defaultValue',
      seventh: 'defaultValue',
      sixth: '',
      third: '{{var}} defaultValue',
      third_female: 'defaultValue',
    })

    assert.deepEqual(frTranslation, {
      eighth_one: '',
      eighth_many: '',
      eighth_other: '',
      fifth_male: '',
      first: '',
      fourth: '',
      fourth_male: 'defaultValue',
      second: 'defaultValue',
      second_male: 'defaultValue',
      seventh: 'defaultValue',
      sixth: '',
      third: '{{var}} defaultValue',
      third_female: 'defaultValue',
    })
  })
})
