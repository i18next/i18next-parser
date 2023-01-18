import { assert } from 'chai'
import { dotPathToHash } from '../../src/helpers.js'

describe('dotPathToHash helper function', () => {
  it('creates an object from a string path', async () => {
    const { target, duplicate } = await dotPathToHash({
      keyWithNamespace: 'one',
    })
    assert.deepEqual(target, { one: '' })
    assert.equal(duplicate, false)
  })

  it('ignores trailing separator', async () => {
    const { target } = await dotPathToHash(
      { keyWithNamespace: 'one.two.' },
      {},
      { separator: '.' }
    )
    assert.deepEqual(target, { one: { two: '' } })
  })

  it('ignores duplicated separator', async () => {
    const { target } = await dotPathToHash({ keyWithNamespace: 'one..two' })
    assert.deepEqual(target, { one: { two: '' } })
  })

  it('supports custom separator', async () => {
    const { target } = await dotPathToHash(
      { keyWithNamespace: 'one-two' },
      {},
      { separator: '-' }
    )
    assert.deepEqual(target, { one: { two: '' } })
  })

  it('handles an empty namespace', async () => {
    const { target, duplicate } = await dotPathToHash({
      keyWithNamespace: 'ns.',
      namespace: 'ns',
    })
    assert.deepEqual(target, { ns: {} })
    assert.equal(duplicate, false)
  })

  it('handles a target hash', async () => {
    const { target, duplicate } = await dotPathToHash(
      { keyWithNamespace: 'one.two.three' },
      { one: { twenty: '' } }
    )
    assert.deepEqual(target, { one: { two: { three: '' }, twenty: '' } })
    assert.equal(duplicate, false)
  })

  it('handles a `defaultValue` option', async () => {
    const { target } = await dotPathToHash(
      { keyWithNamespace: 'one' },
      {},
      { value: 'myDefaultValue' }
    )
    assert.deepEqual(target, { one: 'myDefaultValue' })
  })

  it('handles a `separator` option', async () => {
    const { target } = await dotPathToHash(
      { keyWithNamespace: 'one_two_three.' },
      {},
      { separator: '_' }
    )
    assert.deepEqual(target, { one: { two: { 'three.': '' } } })
  })

  it('detects duplicate keys with the same value', async () => {
    const { target, duplicate, conflict } = await dotPathToHash(
      { keyWithNamespace: 'one.two.three' },
      { one: { two: { three: '' } } }
    )
    assert.deepEqual(target, { one: { two: { three: '' } } })
    assert.equal(duplicate, true)
    assert.equal(conflict, false)
  })

  it('detects and overwrites duplicate keys with different values', async () => {
    const { target, duplicate, conflict } = await dotPathToHash(
      { keyWithNamespace: 'one.two.three', defaultValue: 'new' },
      { one: { two: { three: 'old' } } }
    )
    assert.deepEqual(target, { one: { two: { three: 'new' } } })
    assert.equal(duplicate, true)
    assert.equal(conflict, 'value')
  })

  it('overwrites keys already mapped to a string with an object value', async () => {
    const { target, duplicate, conflict } = await dotPathToHash(
      { keyWithNamespace: 'one', defaultValue: 'bla' },
      { one: { two: { three: 'bla' } } }
    )
    assert.deepEqual(target, { one: 'bla' })
    assert.equal(duplicate, true)
    assert.equal(conflict, 'key')
  })

  it('overwrites keys already mapped to an object with a string value', async () => {
    const { target, duplicate, conflict } = await dotPathToHash(
      { keyWithNamespace: 'one.two.three', defaultValue: 'bla' },
      { one: 'bla' }
    )
    assert.deepEqual(target, { one: { two: { three: 'bla' } } })
    assert.equal(duplicate, true)
    assert.equal(conflict, 'key')
  })

  it('uses old value when there is no new value and does not conflict', async () => {
    const { target, duplicate, conflict } = await dotPathToHash(
      { keyWithNamespace: 'one.two.three' },
      { one: { two: { three: 'old' } } }
    )
    assert.deepEqual(target, { one: { two: { three: 'old' } } })
    assert.equal(duplicate, true)
    assert.equal(conflict, false)
  })

  it('uses new value when there is no old value and does not conflict', async () => {
    const { target, duplicate, conflict } = await dotPathToHash(
      { keyWithNamespace: 'one.two.three', defaultValue: 'new' },
      { one: { two: { three: '' } } }
    )
    assert.deepEqual(target, { one: { two: { three: 'new' } } })
    assert.equal(duplicate, true)
    assert.equal(conflict, false)
  })
})
