import { assert } from 'chai'
import { mergeHashes } from '../../src/helpers'

describe('mergeHashes helper function', () => {
  it('replaces empty `target` keys with `source`', (done) => {
    const source = { key1: 'value1' }
    const target = { key1: '' }
    const res    = mergeHashes(source, target)

    assert.deepEqual(res.new, { key1: 'value1' })
    assert.deepEqual(res.old, {})
    assert.strictEqual(res.mergeCount, 1)
    assert.strictEqual(res.pullCount, 0)
    assert.strictEqual(res.oldCount, 0)
    done()
  })

  it('does not replace empty `target` keys with `source` if it is a hash', (done) => {
    const source = { key1: { key11: 'value1'} }
    const target = { key1: '' }
    const res    = mergeHashes(source, target)

    assert.deepEqual(res.new, { key1: '' })
    assert.deepEqual(res.old, { key1: { key11: 'value1' } })
    assert.strictEqual(res.mergeCount, 0)
    assert.strictEqual(res.pullCount, 0)
    assert.strictEqual(res.oldCount, 1)
    done()
  })

  it('keeps `target` keys not in `source`', (done) => {
    const source = { key1: 'value1' }
    const target = { key1: '', key2: '' }
    const res    = mergeHashes(source, target)

    assert.deepEqual(res.new, { key1: 'value1', key2: '' })
    assert.deepEqual(res.old, {})
    assert.strictEqual(res.mergeCount, 1)
    assert.strictEqual(res.pullCount, 0)
    assert.strictEqual(res.oldCount, 0)
    done()
  })

  it('stores into `old` the keys from `source` that are not in `target`', (done) => {
    const source = { key1: 'value1', key2: 'value2' }
    const target = { key1: '' }
    const res    = mergeHashes(source, target)

    assert.deepEqual(res.new, { key1: 'value1' })
    assert.deepEqual(res.old, { key2: 'value2' })
    assert.strictEqual(res.mergeCount, 1)
    assert.strictEqual(res.pullCount, 0)
    assert.strictEqual(res.oldCount, 1)
    done()
  })

  it('copies `source` keys to `target` regardless of presence when `keepRemoved` is enabled', (done) => {
    const source = { key1: 'value1', key2: 'value2' }
    const target = { key1: '', key3: '' }
    const res    = mergeHashes(source, target, true)

    assert.deepEqual(res.new, { key1: 'value1', key2: 'value2', key3: '' })
    assert.deepEqual(res.old, { })
    assert.strictEqual(res.mergeCount, 1)
    assert.strictEqual(res.pullCount, 0)
    assert.strictEqual(res.oldCount, 1)
    done()
  })

  it('restores plural keys when the singular one exists', (done) => {
    const source = { key1: '', key1_plural: 'value1' }
    const target = { key1: '' }
    const res    = mergeHashes(source, target)

    assert.deepEqual(res.new, { key1: '', key1_plural: 'value1' })
    assert.deepEqual(res.old, {})
    assert.strictEqual(res.mergeCount, 1)
    assert.strictEqual(res.pullCount, 1)
    assert.strictEqual(res.oldCount, 0)
    done()
  })

  it('does not restore plural keys when the singular one does not', (done) => {
    const source = { key1: '', key1_plural: 'value1' }
    const target = { key2: '' }
    const res    = mergeHashes(source, target)

    assert.deepEqual(res.new, { key2: '' })
    assert.deepEqual(res.old, { key1: '', key1_plural: 'value1' })
    assert.strictEqual(res.mergeCount, 0)
    assert.strictEqual(res.pullCount, 0)
    assert.strictEqual(res.oldCount, 2)
    done()
  })

  it('restores context keys when the singular one exists', (done) => {
    const source = { key1: '', key1_context: 'value1' }
    const target = { key1: '' }
    const res    = mergeHashes(source, target)

    assert.deepEqual(res.new, { key1: '', key1_context: 'value1' })
    assert.deepEqual(res.old, {})
    assert.strictEqual(res.mergeCount, 1)
    assert.strictEqual(res.pullCount, 1)
    assert.strictEqual(res.oldCount, 0)
    done()
  })

  it('does not restore context keys when the singular one does not', (done) => {
    const source = { key1: '', key1_context: 'value1' }
    const target = { key2: '' }
    const res    = mergeHashes(source, target)

    assert.deepEqual(res.new, { key2: '' })
    assert.deepEqual(res.old, { key1: '', key1_context: 'value1' })
    assert.strictEqual(res.mergeCount, 0)
    assert.strictEqual(res.pullCount, 0)
    assert.strictEqual(res.oldCount, 2)
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
        },
        key4: {
          key41: 'value41'
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
        key3: '',
        key4: {
          key41: 'value41'
        }
    }

    const res = mergeHashes(source, target)

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
        key3: '',
        key4: {
          key41: 'value41'
        }
    }

    const expected_old = {
        key2: {
            key22: {
                key221: 'value221'
            },
            key23: 'value23'
        }
    }

    assert.deepEqual(res.new, expected_target)
    assert.deepEqual(res.old, expected_old)
    assert.strictEqual(res.mergeCount, 4)
    assert.strictEqual(res.pullCount, 0)
    assert.strictEqual(res.oldCount, 2)
    done()
  })

  it('leaves arrays of values (multiline) untouched', (done) => {
    const source = { key1: ['Line one.', 'Line two.'] }
    const target = { key1: '' }
    const res    = mergeHashes(source, target)

    assert.deepEqual(res.new, { key1: ['Line one.', 'Line two.'] })
    assert.deepEqual(res.old, {})
    assert.strictEqual(res.mergeCount, 1)
    assert.strictEqual(res.pullCount, 0)
    assert.strictEqual(res.oldCount, 0)
    done()
  })
})
