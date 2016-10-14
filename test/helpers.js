describe('mergeHash helper function', function () {
    it('replaces `target` keys with `source`', function (done) {
        var source = { key1: 'value1' };
        var target = { key1: '' };
        var res    = mergeHash(source, target);

        assert.deepEqual(res.new, { key1: 'value1' });
        assert.deepEqual(res.old, {});
        done();
    });

    it('replaces `target` keys with `source` while tracking paths', function (done) {
        var source = { key1: 'value1' };
        var target = { key1: simpleDeepCopy(emptyTranslationWithPaths) };
        var res    = mergeHash(source, target);

        assert.deepEqual(res.new, { key1: { msgstr: 'value1', paths: [''] } });
        assert.deepEqual(res.old, {});
        done();
    });

    it('leaves untouched `target` keys not in `source`', function (done) {
        var source = { key1: 'value1' };
        var target = { key1: '', key2: '' };
        var res    = mergeHash(source, target);

        assert.deepEqual(res.new, { key1: 'value1', key2: '' });
        assert.deepEqual(res.old, {});
        done();
    });

    it('leaves untouched `target` keys not in `source` while tracking paths', function (done) {
        var translationValue = simpleDeepCopy(emptyTranslationWithPaths);
        var source = { key1: 'value1' };
        var target = {
            key1: translationValue,
            key2: translationValue
        };
        var res = mergeHash(source, target);
        var expected = {
            key1: { msgstr: 'value1', paths: [''] },
            key2: translationValue
        };

        assert.deepEqual(res.new, expected);
        assert.deepEqual(res.old, {});
        done();
    });

    it('populates `old` object with keys from `source` not in `target`', function (done) {
        var source = { key1: 'value1', key2: 'value2' };
        var target = { key1: '' };
        var res    = mergeHash(source, target);

        assert.deepEqual(res.new, { key1: 'value1' });
        assert.deepEqual(res.old, { key2: 'value2' });
        done();
    });

    it('populates `old` object with keys from `source` not in `target` while tracking paths', function (done) {
        var source = { key1: 'value1', key2: 'value2' };
        var target = { key1: simpleDeepCopy(emptyTranslationWithPaths) };
        var res    = mergeHash(source, target);

        assert.deepEqual(res.new, { key1: { msgstr: 'value1', paths: [''] } });
        assert.deepEqual(res.old, { key2: 'value2' });
        done();
    });

    it('copies `source` keys to `target` regardless of presence when keepRemoved is enabled', function (done) {
        var source = { key1: 'value1', key2: 'value2' };
        var target = { key1: '', key3: '' };
        var res    = mergeHash(source, target, null, true);

        assert.deepEqual(res.new, { key1: 'value1', key2: 'value2', key3: '' });
        assert.deepEqual(res.old, { key2: 'value2' });
        done();
    });

    it('copies `source` keys to `target` regardless of presence when keepRemoved is enabled while tracking paths', function (done) {
        var source = { key1: 'value1', key2: 'value2' };
        var target = { key1: simpleDeepCopy(emptyTranslationWithPaths), key3: simpleDeepCopy(emptyTranslationWithPaths) };
        var res    = mergeHash(source, target, null, true);

        assert.deepEqual(res.new, {
            key1: { msgstr: 'value1', paths: [''] },
            key2: 'value2',
            key3: simpleDeepCopy(emptyTranslationWithPaths)
        });
        assert.deepEqual(res.old, { key2: 'value2' });
        done();
    });

    it('restores plural keys when the singular one exists', function (done) {
        var source = { key1: '', key1_plural: 'value1' };
        var target = { key1: '' };
        var res    = mergeHash(source, target);

        assert.deepEqual(res.new, { key1: '', key1_plural: 'value1' });
        assert.deepEqual(res.old, {});
        done();
    });

    it('restores plural keys when the singular one exists while tracking paths', function (done) {
        var translationValue = simpleDeepCopy(emptyTranslationWithPaths);
        var source = { key1: '', key1_plural: 'value1' };
        var target = { key1: translationValue };
        var res    = mergeHash(source, target);

        assert.deepEqual(res.new, { key1: translationValue, key1_plural: 'value1' });
        assert.deepEqual(res.old, {});
        done();
    });

    it('does not restores plural keys when the singular one does not', function (done) {
        var source = { key1: '', key1_plural: 'value1' };
        var target = { key2: '' };
        var res    = mergeHash(source, target);

        assert.deepEqual(res.new, { key2: '' });
        assert.deepEqual(res.old, { key1: '', key1_plural: 'value1' });
        done();
    });

    it('does not restores plural keys when the singular one does not, while tracking paths', function (done) {
        var source = { key1: '', key1_plural: 'value1' };
        var target = { key2: simpleDeepCopy(emptyTranslationWithPaths) };
        var res    = mergeHash(source, target);

        assert.deepEqual(res.new, { key2: simpleDeepCopy(emptyTranslationWithPaths) });
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

        var res = mergeHash(source, target);

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

    it('works with deep objects and file path tracking', function (done) {
        var valueOne = simpleDeepCopy(emptyTranslationWithPaths);
        var valueTwoOne = simpleDeepCopy(emptyTranslationWithPaths);
        var valueTwoTwoTwo = simpleDeepCopy(emptyTranslationWithPaths);
        valueOne.msgstr = 'value1';
        valueTwoOne.msgstr = 'value21';
        valueTwoTwoTwo.msgstr = 'value222';

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
            key1: simpleDeepCopy(emptyTranslationWithPaths),
            key2: {
                key21: simpleDeepCopy(emptyTranslationWithPaths),
                key22: {
                    key222: simpleDeepCopy(emptyTranslationWithPaths),
                    key223: simpleDeepCopy(emptyTranslationWithPaths)
                },
                key24: simpleDeepCopy(emptyTranslationWithPaths)
            },
            key3: simpleDeepCopy(emptyTranslationWithPaths)
        };

        var res = mergeHash(source, target);

        var expected_target = {
            key1: valueOne,
            key2: {
                key21: valueTwoOne,
                key22: {
                    key222: valueTwoTwoTwo,
                    key223: simpleDeepCopy(emptyTranslationWithPaths)
                },
                key24: simpleDeepCopy(emptyTranslationWithPaths)
            },
            key3: simpleDeepCopy(emptyTranslationWithPaths)
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
        var target = { key1: '' };
        var res    = mergeHash(source, target);

        assert.deepEqual(res.new, { key1: ['Line one.', 'Line two.'] });
        done();
    });

    it('leaves arrays of values (multiline) untouched while tracking paths', function (done) {
        var source = { key1: ['Line one.', 'Line two.'] };
        var target = { key1: simpleDeepCopy(emptyTranslationWithPaths) };
        var res    = mergeHash(source, target);

        assert.deepEqual(res.new, { key1: { msgstr: ['Line one.', 'Line two.'], paths: [''] } });
        done();
    });
});


describe('hashFromString helper function', function () {
    it('creates an object from a string path', function (done) {
        var res = hashFromString('one');

        assert.deepEqual(res, { one: '' });
        done();
    });

    it('creates an object from a string path while tracking file paths', function (done) {
        var res = hashFromString('one', null, null, ['testing/a/path']);

        assert.deepEqual(res, { one: { msgstr: '', paths: ['testing/a/path'] } });
        done();
    });

    it('ignores trailing separator', function (done) {
        var res = hashFromString('one..', '..');

        assert.deepEqual(res, { one: '' });
        done();
    });

    it('ignores trailing separator while tracking paths', function (done) {
        var res = hashFromString('one..', '..', null, ['file/location.html']);

        assert.deepEqual(res, { one: { msgstr: '', paths: ['file/location.html'] } });
        done();
    });

    it('handles nested paths', function (done) {
        var res = hashFromString('one.two.three');

        assert.deepEqual(res, { one: { two: { three: '' } } });
        done();
    });

    it('handles nested paths while tracking file paths', function (done) {
        var res = hashFromString('one.two.three', null, null, ['./one/two/three.js']);

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

    it('handles a different separator while tracking paths', function (done) {
        var res = hashFromString('one_two_three.', '_', null, ['./one/two/three.js']);

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

describe('replaceEmpty helper function', function () {
    it('replaces `target` empty keys with `source` ones', function (done) {
        var source = { key1: 'value1' };
        var target = { key1: '' };
        var res    = replaceEmpty(source, target);

        assert.deepEqual(res, { key1: 'value1' });
        done();
    });

    it('leaves untouched `target` keys that are not empty', function (done) {
        var source = { key1: 'value1' };
        var target = { key1: 'value2' };
        var res    = replaceEmpty(source, target);

        assert.deepEqual(res, { key1: 'value2' });
        done();
    });

    it('leaves untouched `target` keys not in `source`', function (done) {
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
