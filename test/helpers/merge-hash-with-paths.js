describe('mergeHash helper function while tracking file paths of keys', function () {
    it('replaces `target` keys with `source` keys', function (done) {
        var source = { key1: 'value1' };
        var target = { key1: emptyTranslationWithPaths() };
        var res    = mergeHash(source, target);

        assert.deepEqual(res.new, { key1: emptyTranslationWithPaths({ msgstr: 'value1' }) });
        assert.deepEqual(res.old, {});
        done();
    });

    it('leaves `target` keys, not in `source`, untouched', function (done) {
        var source = { key1: 'value1' };
        var target = {
            key1: emptyTranslationWithPaths(),
            key2: emptyTranslationWithPaths()
        };
        var res = mergeHash(source, target);
        var expected = {
            key1: emptyTranslationWithPaths({ msgstr: 'value1' }),
            key2: emptyTranslationWithPaths()
        };

        assert.deepEqual(res.new, expected);
        assert.deepEqual(res.old, {});
        done();
    });

    it('populates `old` object with keys from `source` that are not in `target`', function (done) {
        var source = { key1: 'value1', key2: 'value2' };
        var target = { key1: emptyTranslationWithPaths() };
        var res    = mergeHash(source, target);

        assert.deepEqual(res.new, { key1: emptyTranslationWithPaths({ msgstr: 'value1'}) });
        assert.deepEqual(res.old, { key2: 'value2' });
        done();
    });

    it('copies `source` keys to `target` regardless of presence when keepRemoved is enabled', function (done) {
        var source = { key1: 'value1', key2: 'value2' };
        var target = { key1: emptyTranslationWithPaths(), key3: emptyTranslationWithPaths() };
        var res    = mergeHash(source, target, null, true);

        assert.deepEqual(res.new, {
            key1: emptyTranslationWithPaths({ msgstr: 'value1' }),
            key2: 'value2',
            key3: emptyTranslationWithPaths()
        });
        assert.deepEqual(res.old, { key2: 'value2' });
        done();
    });

    it('restores plural keys when the singular one exists', function (done) {
        var source = { key1: '', key1_plural: 'value1' };
        var target = { key1: emptyTranslationWithPaths() };
        var res    = mergeHash(source, target);

        assert.deepEqual(res.new, { key1: emptyTranslationWithPaths(), key1_plural: 'value1' });
        assert.deepEqual(res.old, {});
        done();
    });

    it('does not restores plural keys when the singular one does not,', function (done) {
        var source = { key1: '', key1_plural: 'value1' };
        var target = { key2: emptyTranslationWithPaths() };
        var res    = mergeHash(source, target);

        assert.deepEqual(res.new, { key2: emptyTranslationWithPaths() });
        assert.deepEqual(res.old, { key1: '', key1_plural: 'value1' });
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
            key1: emptyTranslationWithPaths(),
            key2: {
                key21: emptyTranslationWithPaths(),
                key22: {
                    key222: emptyTranslationWithPaths(),
                    key223: emptyTranslationWithPaths()
                },
                key24: emptyTranslationWithPaths()
            },
            key3: emptyTranslationWithPaths()
        };

        var res = mergeHash(source, target);

        var expected_target = {
            key1: emptyTranslationWithPaths({ msgstr: 'value1' }),
            key2: {
                key21: emptyTranslationWithPaths({ msgstr: 'value21' }),
                key22: {
                    key222: emptyTranslationWithPaths({ msgstr: 'value222' }),
                    key223: emptyTranslationWithPaths()
                },
                key24: emptyTranslationWithPaths()
            },
            key3: emptyTranslationWithPaths()
        };

        var expected_old = {
            key2: {
                key22: {
                    key221: 'value221'
                },
                key23: 'value23'
            }
        };

        assert.deepEqual(res.new, expected_target);
        assert.deepEqual(res.old, expected_old);
        done();
    });

    it('leaves arrays of values (multiline) untouched', function (done) {
        var source = { key1: ['Line one.', 'Line two.'] };
        var target = { key1: emptyTranslationWithPaths() };
        var res    = mergeHash(source, target);

        assert.deepEqual(res.new, { key1: emptyTranslationWithPaths({ msgstr: ['Line one.', 'Line two.'] }) });
        done();
    });
});