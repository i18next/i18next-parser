describe('replaceEmpty helper function', function () {
    it('replaces `target` empty keys with `source` keys', function (done) {
        var source = { key1: 'value1' };
        var target = { key1: '' };
        var res    = replaceEmpty(source, target);

        assert.deepEqual(res, { key1: 'value1' });
        done();
    });

    it('leaves `target` keys, which are not empty, untouched', function (done) {
        var source = { key1: 'value1' };
        var target = { key1: 'value2' };
        var res    = replaceEmpty(source, target);

        assert.deepEqual(res, { key1: 'value2' });
        done();
    });

    it('leaves `target` keys, not in `source`, untouched', function (done) {
        var source = { key1: 'value1' };
        var target = { key1: '', key2: '' };
        var res    = replaceEmpty(source, target);

        assert.deepEqual(res, { key1: 'value1', key2: '' });
        done();
    });

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
        };
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
        };
        var res = replaceEmpty(source, target);
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
        };

        assert.deepEqual(res, expected_target);
        done();
    });
});