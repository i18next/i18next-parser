import path from 'path'
import { assert } from 'chai'
import execa from 'execa'
import fs from 'fs-extra'

describe('broccoli plugin', function () {
  // test execution time depends on I/O
  this.timeout(5000)

  it('works as a broccoli plugin', async () => {
    const subprocess = await execa.command('yarn test:broccoli')

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
