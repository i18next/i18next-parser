describe('hashFromString helper function', function () {
    it('creates an object from a string path', function (done) {
        var res = hashFromString('one');

        assert.deepEqual(res, { one: '' });
        done();
    });

    it('creates an object from a string path while tracking file paths of keys', function (done) {
        var res = hashFromStringWithPaths('one', null, null, ['testing/a/path']);

        assert.deepEqual(res, { one: { msgstr: '', paths: ['testing/a/path'] } });
        done();
    });

    it('ignores trailing separator', function (done) {
        var res = hashFromString('one..', '..');

        assert.deepEqual(res, { one: '' });
        done();
    });

    it('ignores trailing separator while tracking file paths of keys', function (done) {
        var res = hashFromStringWithPaths('one..', '..', null, ['file/location.html']);

        assert.deepEqual(res, { one: { msgstr: '', paths: ['file/location.html'] } });
        done();
    });

    it('handles nested paths', function (done) {
        var res = hashFromString('one.two.three');

        assert.deepEqual(res, { one: { two: { three: '' } } });
        done();
    });

    it('handles nested paths while tracking file paths of keys', function (done) {
        var res = hashFromStringWithPaths('one.two.three', null, null, ['./one/two/three.js']);

        assert.deepEqual(res, {
            one: {
                two: {
                    msgstr: '',
                    paths: ['./one/two/three.js'],
                    three: { msgstr: '', paths: ['./one/two/three.js']}
                }
            }
        });
        done();
    });

    it('handles a different separator', function (done) {
        var res = hashFromString('one_two_three.', '_');

        assert.deepEqual(res, { one: { two: { 'three.': '' } } });
        done();
    });

    it('handles a different separator while tracking file paths of keys', function (done) {
        var res = hashFromStringWithPaths('one_two_three.', '_', null, ['./one/two/three.js']);

        assert.deepEqual(res, {
            one: {
                two: {
                    msgstr: '',
                    paths: ['./one/two/three.js'],
                    'three.': { msgstr: '', paths: ['./one/two/three.js']}
                }
            }
        });
        done();
    });
});