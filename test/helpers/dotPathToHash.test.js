import { assert } from 'chai'
import { dotPathToHash } from '../../src/helpers'

describe('dotPathToHash helper function', () => {
  it('creates an object from a string path', (done) => {
    const { target, duplicate } = dotPathToHash({ key: 'one' })
    assert.deepEqual(target, { one: '' })
    assert.equal(duplicate, false)
    done()
  })

  it('ignores trailing separator', (done) => {
    const { target } = dotPathToHash(
      { key: 'one.' },
      {},
      { separator: '.' }
    )
    assert.deepEqual(target, { one: '' })
    done()
  })

  it('ignores duplicated separator', (done) => {
    const { target } = dotPathToHash(
      { key: 'one..two' }
    )
    assert.deepEqual(target, { one: { two: '' } })
    done()
  })

  it('supports custom separator', (done) => {
    const { target } = dotPathToHash(
      { key: 'one-two' },
      {},
      { separator: '-' }
    )
    assert.deepEqual(target, { one: { two: '' } })
    done()
  })

  it('supports custom separator when `useKeysAsDefaultValue` is true', (done) => {
    const { target } = dotPathToHash(
      { key: 'namespace-two-three' },
      {},
      { separator: '-', useKeysAsDefaultValue: true }
    )
    assert.deepEqual(target, { namespace: { two: { three: 'two-three' } } })
    done()
  })

  it('handles a target hash', (done) => {
    const { target, duplicate } = dotPathToHash(
      { key: 'one.two.three' },
      { one: { twenty: '' } }
    )
    assert.deepEqual(target, { one: { two: { three: '' }, twenty: '' } })
    assert.equal(duplicate, false)
    done()
  })

  it('handles a `defaultValue` option', (done) => {
    const { target } = dotPathToHash(
      { key: 'one' },
      {},
      { value: 'myDefaultValue' }
    )
    assert.deepEqual(target, { one: 'myDefaultValue' })
    done()
  })

  it('handles a `separator` option', (done) => {
    const { target } = dotPathToHash(
      { key: 'one_two_three.' },
      {},
      { separator: '_' }
    )
    assert.deepEqual(target, { one: { two: { 'three.': '' } } })
    done()
  })

  it('detects duplicate keys with the same value', (done) => {
    const { target, duplicate, conflict } = dotPathToHash(
      { key: 'one.two.three' },
      { one: { two: { three: '' } } },
    )
    assert.deepEqual(target, { one: { two: { three: '' } } })
    assert.equal(duplicate, true)
    assert.equal(conflict, false)
    done()
  })

  it('detects and overwrites duplicate keys with different values', (done) => {
    const { target, duplicate, conflict } = dotPathToHash(
      { key: 'one.two.three', defaultValue: 'new' },
      { one: { two: { three: 'old' } } },
    )
    assert.deepEqual(target, { one: { two: { three: 'new' } } })
    assert.equal(duplicate, true)
    assert.equal(conflict, true)
    done()
  })
})
