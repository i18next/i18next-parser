import { assert } from 'chai'
import { getPluralSuffixPosition } from '../../src/helpers.js'

describe('getPluralSuffixPosition helper function', () => {
  it('returns suffix position for all valid plural forms', (done) => {
    const keys = {
      // default pluralSeparator
      key1_other: 5,
      key1_many: 4,
      key1_few: 3,
      key1_two: 2,
      key1_one: 1,
      key1_zero: 0,

      // custom pluralSeparator
      'key1|other': 5,
      'key1|many': 4,
      'key1|few': 3,
      'key1|two': 2,
      'key1|one': 1,
      'key1|zero': 0,
    }

    Object.entries(keys).forEach(([key, position]) => {
      const res = getPluralSuffixPosition(key)

      assert.strictEqual(res, position)
    })

    done()
  })

  it('returns `-1` for non plural keys', (done) => {
    const nonPluralKeys = [
      'key1',
      'key1_context',
      'key1_zero_edgeCase',
      'key1_one_edgeCase',
      'key1_two_edgeCase',
      'key1_few_edgeCase',
      'key1_many_edgeCase',
      'key1_other_edgeCase',
    ]

    nonPluralKeys.forEach((key) => {
      const res = getPluralSuffixPosition(key)

      assert.strictEqual(res, -1)
    })

    done()
  })
})
