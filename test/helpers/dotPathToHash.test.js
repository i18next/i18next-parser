import { assert } from 'chai'
import { dotPathToHash } from '../../src/helpers'

describe('dotPathToHash helper function', function () {
  it('creates an object from a string path', function (done) {
    const res = dotPathToHash('one')
    assert.deepEqual(res, { one: '' })
    done()
  })

  it('ignores trailing separator', function (done) {
    const res = dotPathToHash('one..', '..')
    assert.deepEqual(res, { one: '' })
    done()
  })

  it('ignores duplicated separator', function (done) {
    const res = dotPathToHash('one..two', '..')
    assert.deepEqual(res, { one: { two: '' } })
    done()
  })

  it('use provided default value', function (done) {
    const res = dotPathToHash('one', null, 'myDefaultValue')
    assert.deepEqual(res, { one: 'myDefaultValue' })
    done()
  })

  it('use provided default value', function (done) {
    const res = dotPathToHash('one', null, 'myDefaultValue')
    assert.deepEqual(res, { one: 'myDefaultValue' })
    done()
  })

  it('handles a target hash', function (done) {
    const res = dotPathToHash('one.two.three', '.', '', { one: { twenty: '' } })
    assert.deepEqual(res, { one: { two: { three: '' }, twenty: '' } })
    done()
  })

  it('handles a different separator', function (done) {
    const res = dotPathToHash('one_two_three.', '_')
    assert.deepEqual(res, { one: { two: { 'three.': '' } } })
    done()
  })
})
