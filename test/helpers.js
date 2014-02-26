var helpers = require('../src/helpers')
var hashFromString = helpers.hashFromString
var mergeHash = helpers.mergeHash
var test = require('tap').test

// HELPERS: mergeHash
// ==================

test('mergeHash replaces `target` keys with `source`', function (t) {
    var source = { key1: 'value1' }
    var target = { key1: '' }
    
    var res = mergeHash(source, target)

    t.deepEqual(res['new'], { key1: 'value1' })
    t.deepEqual(res['old'], {})
    t.end()
})

test('mergeHash leaves untouched `target` keys not in `source`', function (t) {
    var source = { key1: 'value1' }
    var target = { key1: '', key2: '' }
    
    var res = mergeHash(source, target)

    t.deepEqual(res['new'], { key1: 'value1', key2: '' })
    t.deepEqual(res['old'], {})
    t.end()
})

test('mergeHash populates `old` object with keys from `source` not in `target`', function (t) {
    var source = { key1: 'value1', key2: 'value2' }
    var target = { key1: '' }
    

    var res = mergeHash(source, target)

    t.deepEqual(res['new'], { key1: 'value1' })
    t.deepEqual(res['old'], { key2: 'value2' })
    t.end()
})

test('mergeHash works with deep objects', function (t) {
    var source = { 
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
    var target = { 
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
    
    var res = mergeHash(source, target)

    var expected_target = { 
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

    var expected_old = { 
        key2: {
            key22: {
                key221: 'value221'
            },
            key23: 'value23'
        }
    }

    t.deepEqual(res['new'], expected_target)
    t.deepEqual(res['old'], expected_old)
    t.end()
})

// HELPERS: hashFromString
// =======================

test('hashFromString creates an object from a string path', function (t) {
    var res = hashFromString('one')

    t.deepEqual(res, { one: '' })
    t.end()
})

test('hashFromString handles nested paths', function (t) {
    var res = hashFromString('one.two.three')

    t.deepEqual(res, { one: { two: { three: '' } } })
    t.end()
})
