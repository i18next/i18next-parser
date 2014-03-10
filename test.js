var assert          = require('assert')
var File            = require('vinyl')
var through         = require('through2')
var Parser          = require('./index')
var helpers         = require('./src/helpers')
var hashFromString  = helpers.hashFromString
var mergeHash       = helpers.mergeHash
var replaceEmpty    = helpers.replaceEmpty



describe('i18next-parser', function () {
    it('parses globally on multiple lines', function (done) {
        var result;
        var i18nextParser = Parser();
        var fakeFile = new File({
            contents: new Buffer("asd t('first') t('second') \n asd t('third') ad t('fourth')")
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.on('end', function (file) {
            assert.deepEqual( result, { first: '', second: '', third: '', fourth: '' } )
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('should create two files per namespace and per locale', function (done) {
        var results = [];
        var i18nextParser = Parser({
            locales: ['en', 'de', 'fr'],
            namespace: 'default'
        });
        var fakeFile = new File({
            contents: new Buffer("asd t('ns1:first') t('second') \n asd t('ns2:third') ad t('fourth')")
        });

        i18nextParser.on('data', function (file) {
            results.push(file.relative);
        });
        i18nextParser.on('end', function (file) {

            var expectedFiles = [
                'en/default.json', 'en/default_old.json', 'en/ns1.json', 'en/ns1_old.json', 'en/ns2.json', 'en/ns2_old.json',
                'de/default.json', 'de/default_old.json', 'de/ns1.json', 'de/ns1_old.json', 'de/ns2.json', 'de/ns2_old.json',
                'fr/default.json', 'fr/default_old.json', 'fr/ns1.json', 'fr/ns1_old.json', 'fr/ns2.json', 'fr/ns2_old.json'
            ];
            var length = expectedFiles.length;

            expectedFiles.forEach(function (filename) {
                assert( results.indexOf( filename ) !== -1 );
                if( ! --length ) done();
            });
        });

        i18nextParser.end(fakeFile);
    });

    it('returns buffers', function (done) {
        var i18nextParser = Parser();
        var fakeFile = new File({
            contents: new Buffer("asd t('first') t('second') \n asd t('third') ad t('fourth')")
        }); 

        i18nextParser.once('data', function (file) {
            assert(file.isBuffer());
            done();
        });

        i18nextParser.end(fakeFile);
    });
});



describe('mergeHash helper function', function () {
    it('replaces `target` keys with `source`', function (done) {
        var source = { key1: 'value1' }
        var target = { key1: '' }
        var res    = mergeHash(source, target)

        assert.deepEqual(res['new'], { key1: 'value1' })
        assert.deepEqual(res['old'], {})
        done()
    })

    it('leaves untouched `target` keys not in `source`', function (done) {
        var source = { key1: 'value1' }
        var target = { key1: '', key2: '' }
        var res    = mergeHash(source, target)

        assert.deepEqual(res['new'], { key1: 'value1', key2: '' })
        assert.deepEqual(res['old'], {})
        done()
    })

    it('populates `old` object with keys from `source` not in `target`', function (done) {
        var source = { key1: 'value1', key2: 'value2' }
        var target = { key1: '' }
        var res    = mergeHash(source, target)

        assert.deepEqual(res['new'], { key1: 'value1' })
        assert.deepEqual(res['old'], { key2: 'value2' })
        done()
    })

    it('works with deep objects', function (done) {
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

        assert.deepEqual(res['new'], expected_target)
        assert.deepEqual(res['old'], expected_old)
        done()
    })
})


describe('hashFromString helper function', function () {
    it('creates an object from a string path', function (done) {
        var res = hashFromString('one')

        assert.deepEqual(res, { one: '' })
        done()
    })

    it('handles nested paths', function (done) {
        var res = hashFromString('one.two.three')

        assert.deepEqual(res, { one: { two: { three: '' } } })
        done()
    })
})

describe('replaceEmpty helper function', function () {
    it('replaces `target` empty keys with `source` ones', function (done) {
        var source = { key1: 'value1' }
        var target = { key1: '' }
        var res    = replaceEmpty(source, target)

        assert.deepEqual(res, { key1: 'value1' })
        done()
    })

    it('leaves untouched `target` keys that are not empty', function (done) {
        var source = { key1: 'value1' }
        var target = { key1: 'value2' }
        var res    = replaceEmpty(source, target)

        assert.deepEqual(res, { key1: 'value2' })
        done()
    })

    it('leaves untouched `target` keys not in `source`', function (done) {
        var source = { key1: 'value1' }
        var target = { key1: '', key2: '' }
        var res    = replaceEmpty(source, target)

        assert.deepEqual(res, { key1: 'value1', key2: '' })
        done()
    })

    it('works with deep objects', function (done) {
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
        var res = replaceEmpty(source, target)
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

        assert.deepEqual(res, expected_target)
        done()
    })
})
