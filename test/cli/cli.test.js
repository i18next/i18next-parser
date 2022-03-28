import { assert } from 'chai'
import { fileURLToPath } from 'url'
import { execaCommand } from 'execa'
import fs from 'fs-extra'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('CLI', function () {
  // test execution time depends on I/O
  this.timeout(0)

  it('works without options', async () => {
    const subprocess = await execaCommand('yarn test:cli')

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

    const enEmpty = await fs.readJson(
      path.resolve(__dirname, './locales/en/empty.json')
    )

    try {
      await fs.readJson(path.resolve(__dirname, './locales/en/empty_old.json'))
    } catch (error) {
      assert.strictEqual(error.code, 'ENOENT')
    }

    const frTranslation = await fs.readJson(
      path.resolve(__dirname, './locales/fr/translation.json')
    )

    try {
      await fs.readJson(
        path.resolve(__dirname, './locales/fr/translation_old.json')
      )
    } catch (error) {
      assert.strictEqual(error.code, 'ENOENT')
    }

    const frEmpty = await fs.readJson(
      path.resolve(__dirname, './locales/fr/empty.json')
    )

    try {
      await fs.readJson(path.resolve(__dirname, './locales/fr/empty_old.json'))
    } catch (error) {
      assert.strictEqual(error.code, 'ENOENT')
    }

    assert.deepEqual(enTranslation, {
      selfClosing: '',
      first: '',
      second: '',
      third: '',
      fourth: '',
      fifth: 'bar',
      sixth: '',
      seventh: 'bar',
    })
    assert.deepEqual(enEmpty, {})

    assert.deepEqual(frTranslation, {
      selfClosing: '',
      first: '',
      second: '',
      third: '',
      fourth: '',
      fifth: 'bar',
      sixth: '',
      seventh: 'bar',
    })
    assert.deepEqual(frEmpty, {})
  })

  it('works with `--fail-on-warnings` option', async () => {
    try {
      await execaCommand('yarn test:cli --fail-on-warnings')
    } catch (error) {
      assert.strictEqual(error.exitCode, 1)
      assert.include(
        error.stdout.replace(),
        'Warnings were triggered and failOnWarnings option is enabled. Exiting...'
      )
    }
  })

  it('works when no input found', async () => {
    const subprocess = await execaCommand(
      'yarn test:cli cli/**/*.{ts,jsx} --fail-on-warnings'
    )

    assert.include(subprocess.stdout, '0 files were parsed')
  })

  it('works with `--fail-on-update` option', async () => {
    try {
      await execaCommand('yarn test:cli --fail-on-update')
    } catch (error) {
      assert.strictEqual(error.exitCode, 1)
      assert.include(
        error.stdout.replace(),
        'Some translations was updated and failOnUpdate option is enabled. Exiting...'
      )
    }
  })
})
