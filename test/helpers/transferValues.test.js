import { assert } from 'chai'
import { transferValues } from '../../src/helpers.js'

describe('transferValues helper function', () => {
  it('sets undefined keys', (done) => {
    const source = { key1: 'value1', key2: { key21: 'value21' } }
    const target = {}
    transferValues(source, target)

    assert.deepEqual(target, source)
    done()
  })

  it('overwrites existing keys', (done) => {
    const source = { key1: 'value1', key2: { key21: 'value21' } }
    const target = { key1: 'value1_old', key2: { key21: 'value21_old' } }
    transferValues(source, target)

    assert.deepEqual(target, source)
    done()
  })

  it('keeps nonexisting keys', (done) => {
    const source = { key1: 'value1', key2: { key21: 'value21' } }
    const target = { key0: 'value0', key2: { key20: 'value20_old' } }
    transferValues(source, target)

    assert.deepEqual(target, {
      key0: 'value0',
      key1: 'value1',
      key2: { key20: 'value20_old', key21: 'value21' },
    })
    done()
  })
})
