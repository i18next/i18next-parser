import path from 'path'
import { assert } from 'chai'
import execa from 'execa'
import fs from 'fs-extra'

describe('CLI', function () {
  // test execution time depends on I/O
  this.timeout(5000)

  it('works without options', async () => {
    const subprocess = await execa.command('yarn test:cli')

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
      await execa.command('yarn test:cli --fail-on-warnings')
    } catch (error) {
      assert.strictEqual(error.exitCode, 1)
      assert.include(
        error.stdout,
        '[error]   \u001b[39mWarnings were triggered and failOnWarnings option is enabled. Exiting...'
      )
    }
  })

  it('works when no input found', async () => {
    const subprocess = await execa.command(
      'yarn test:cli cli/**/*.{ts,jsx} --fail-on-warnings'
    )

    assert.include(
      subprocess.stdout,
      '\u001b[36m  Stats:  \u001b[39m0 files were parsed'
    )
  })
})
