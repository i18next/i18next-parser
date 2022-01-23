import { assert } from 'chai'
import { hasRelatedPluralKey } from '../../src/helpers.js'

describe('hasRelatedPluralKey helper function', () => {
  it('returns false when `source` does not contain valid plural form of `rawKey`', (done) => {
    const rawKey = 'key1_'
    const source = {
      key1: '',
      key1_: '',
      key1_0: '',
      key1_1: '',
      key1_three: '',
    }
    const res = hasRelatedPluralKey(rawKey, source)

    assert.strictEqual(res, false)
    done()
  })

  it('returns true when `source` contains any valid plural form of `rawKey`', (done) => {
    const rawKey = 'key1_'
    const sources = [
      { key1_zero: '' },
      { key1_one: '' },
      { key1_two: '' },
      { key1_few: '' },
      { key1_many: '' },
      { key1_other: '' },
      {
        key1_zero: '',
        key1_one: '',
        key1_two: '',
        key1_few: '',
        key1_many: '',
        key1_other: '',
      },
    ]

    sources.forEach((source) => {
      const res = hasRelatedPluralKey(rawKey, source)

      assert.strictEqual(res, true)
    })

    done()
  })
})
