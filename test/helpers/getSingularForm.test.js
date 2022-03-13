import { assert } from 'chai'
import { getSingularForm } from '../../src/helpers.js'

describe('getSingularForm helper function', () => {
  it('returns singular key for all valid plural forms', (done) => {
    const pluralSeparator = '_'
    const validPluralForms = [
      'key1_zero',
      'key1_one',
      'key1_two',
      'key1_few',
      'key1_many',
      'key1_other',
    ]

    validPluralForms.forEach((pluralKey) => {
      assert.strictEqual(getSingularForm(pluralKey, pluralSeparator), 'key1')
    })

    done()
  })

  it('returns the key unchanged when not in plural form', (done) => {
    const pluralSeparator = '_'
    const nonPluralKeys = [
      'key1',
      'key1_context',
      'key1-zero',
      'key1-one',
      'key1-two',
      'key1-few',
      'key1-many',
      'key1-other',
      'key1_zero_edgeCase',
      'key1_one_edgeCase',
      'key1_two_edgeCase',
      'key1_few_edgeCase',
      'key1_many_edgeCase',
      'key1_other_edgeCase',
    ]

    nonPluralKeys.forEach((key) => {
      assert.strictEqual(getSingularForm(key, pluralSeparator), key)
    })

    done()
  })

  it('returns singular key for all valid plural forms with custom pluralSeparator', (done) => {
    const pluralSeparator = '|'
    const validPluralForms = [
      'key1|zero',
      'key1|one',
      'key1|two',
      'key1|few',
      'key1|many',
      'key1|other',
    ]

    validPluralForms.forEach((pluralKey) => {
      assert.strictEqual(getSingularForm(pluralKey, pluralSeparator), 'key1')
    })

    done()
  })

  it('returns the key unchanged when not in plural form with custom pluralSeparator', (done) => {
    const pluralSeparator = '|'
    const nonPluralKeys = [
      'key1',
      'key1_context',
      'key1_zero',
      'key1_one',
      'key1_two',
      'key1_few',
      'key1_many',
      'key1_other',
      'key1|zero|edgeCase',
      'key1|one|edgeCase',
      'key1|two|edgeCase',
      'key1|few|edgeCase',
      'key1|many|edgeCase',
      'key1|other|edgeCase',
    ]

    nonPluralKeys.forEach((key) => {
      assert.strictEqual(getSingularForm(key, pluralSeparator), key)
    })

    done()
  })
})
