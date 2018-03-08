import { assert } from 'chai'
import { dotPathToHash } from '../../src/helpers'

describe('dotPathToHash helper function', () => {
  it('creates an object from a string path', (done) => {
    const res = dotPathToHash({ key: 'one' })
    assert.deepEqual(res, { one: '' })
    done()
  })

  it('ignores trailing separator', (done) => {
    const res = dotPathToHash(
      { key: 'one.' },
      {},
      { separator: '.' }
    )
    assert.deepEqual(res, { one: '' })
    done()
  })

  it('ignores duplicated separator', (done) => {
    const res = dotPathToHash(
      { key: 'one..two' }
    )
    assert.deepEqual(res, { one: { two: '' } })
    done()
  })

  it('handles a target hash', (done) => {
    const res = dotPathToHash(
      { key: 'one.two.three' },
      { one: { twenty: '' } }
    )
    assert.deepEqual(res, { one: { two: { three: '' }, twenty: '' } })
    done()
  })

  it('handles a `defaultValue` option', (done) => {
    const res = dotPathToHash(
      { key: 'one' },
      {},
      { value: 'myDefaultValue' }
    )
    assert.deepEqual(res, { one: 'myDefaultValue' })
    done()
  })

  it('handles a `separator` option', (done) => {
    const res = dotPathToHash(
      { key: 'one_two_three.' },
      {},
      { separator: '_' }
    )
    assert.deepEqual(res, { one: { two: { 'three.': '' } } })
    done()
  })
})
