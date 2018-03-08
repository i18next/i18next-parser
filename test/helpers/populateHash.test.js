import { assert } from 'chai'
import { populateHash } from '../../src/helpers'

describe('populateHash helper function', () => {
  it('replaces `target` empty keys with `source` ones', (done) => {
    const source = { key1: 'value1' }
    const target = { key1: '' }
    const res    = populateHash(source, target)

    assert.deepEqual(res, { key1: 'value1' })
    done()
  })

  it('leaves untouched `target` keys that are not empty', (done) => {
    const source = { key1: 'value1' }
    const target = { key1: 'value2' }
    const res    = populateHash(source, target)

    assert.deepEqual(res, { key1: 'value2' })
    done()
  })

  it('leaves untouched `target` keys not in `source`', (done) => {
    const source = { key1: 'value1' }
    const target = { key1: '', key2: '' }
    const res    = populateHash(source, target)

    assert.deepEqual(res, { key1: 'value1', key2: '' })
    done()
  })

  it('works with deep objects', (done) => {
    const source = {
      key1: 'value1',
      key2: {
        key21: 'value21',
        key22: {
          key221: 'value221',
          key222: 'value222'
        },
        key23: 'value23'
      }
    }
    const target = {
      key1: '',
      key2: {
        key21: '',
        key22: {
          key222: '',
          key223: ''
        },
        key24: ''
      },
      key3: ''
    }
    const res = populateHash(source, target)
    const expected_target = {
      key1: 'value1',
      key2: {
        key21: 'value21',
        key22: {
          key222: 'value222',
          key223: ''
        },
        key24: ''
      },
      key3: ''
    }

    assert.deepEqual(res, expected_target)
    done()
  })
})
