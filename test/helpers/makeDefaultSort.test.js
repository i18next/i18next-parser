import { assert } from 'chai'
import { makeDefaultSort } from '../../src/helpers.js'

describe('makeDefaultSort helper function', () => {
  it('sorts the keys alphanumerically', (done) => {
    const pluralSeparator = '_'
    const keys = ['BBB', '222', 'bbb', 'AAA', '111', 'aaa']

    const defaultSort = makeDefaultSort(pluralSeparator)
    const res = keys.sort(defaultSort)

    assert.deepEqual(res, ['111', '222', 'aaa', 'AAA', 'bbb', 'BBB'])

    done()
  })

  it('sorts plural keys in count order', (done) => {
    const pluralSeparator = '_'
    const keys = [
      'key1_two',
      'key1_other',
      'key1_zero',
      'key1_many',
      'key1_few',
      'key1_one',
    ]

    const defaultSort = makeDefaultSort(pluralSeparator)
    const res = keys.sort(defaultSort)

    assert.deepEqual(res, [
      'key1_zero',
      'key1_one',
      'key1_two',
      'key1_few',
      'key1_many',
      'key1_other',
    ])

    done()
  })

  it('sorts plural keys among other one', (done) => {
    const pluralSeparator = '_'
    const keys = [
      'key1_two',
      'key1_other',
      'key1_zero',
      'key1_male',
      'key1',
      'key1_many',
      'key1_few',
      'key2',
      'key1_female',
      'key1_one',
    ]

    const defaultSort = makeDefaultSort(pluralSeparator)
    const res = keys.sort(defaultSort)

    assert.deepEqual(res, [
      'key1',
      'key1_zero',
      'key1_one',
      'key1_two',
      'key1_few',
      'key1_many',
      'key1_other',
      'key1_female',
      'key1_male',
      'key2',
    ])

    done()
  })

  it('sorts keys with custom `pluralSelector`', (done) => {
    const pluralSeparator = '|'
    const keys = [
      'key1|two',
      'key1|other',
      'key1|zero',
      'key1_male',
      'key1',
      'key12',
      'key1|many',
      'key1|few',
      'key2',
      'key1_female',
      'key1|one',
    ]

    const defaultSort = makeDefaultSort(pluralSeparator)
    const res = keys.sort(defaultSort)

    assert.deepEqual(res, [
      'key1',
      'key1|zero',
      'key1|one',
      'key1|two',
      'key1|few',
      'key1|many',
      'key1|other',
      'key1_female',
      'key1_male',
      'key12',
      'key2',
    ])

    done()
  })
})
