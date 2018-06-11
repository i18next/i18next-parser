import { assert } from 'chai'
import { transferValues } from '../../src/helpers'

describe('transferValues helper function', () => {
  it('sets undefined keys', (done) => {
    const source = { key1: 'value1', key2: { key21: 'value21' } }
    const target = {}
    transferValues(source, target)

    assert.deepEqual(target, source)
    done()
  })
})
