describe('parser while tracking paths', function () {
    it('parses attributes in html templates and tracks paths', function (done) {
        var result;
        var translationWithPaths = emptyTranslationWithPaths();
        translationWithPaths.paths = ['test/fake.html'];
        var i18nextParser = Parser({
          attributes: ['data-i18n', 'translate', 't'],
          trackPaths: true
        });
        var fakeFile = new File({
            path: path.resolve(__dirname, './fake.html'),
            contents: new Buffer('<p data-i18n>first</p><p translate="second">Second</p><p t="[html]third">Third</p><p data-i18n="[title]fourth;fifth">Fifth</p>')
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.po.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.on('end', function (file) {
            assert.deepEqual( result, {
                first: translationWithPaths,
                second: translationWithPaths,
                third: translationWithPaths,
                fourth: translationWithPaths,
                fifth: translationWithPaths
            });
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('parses html templates and tracks file paths', function (done) {
        var result;
        var i18nextParser = Parser({
            trackPaths: true
        });
        var fakeFile = new File({
            path: path.resolve(__dirname, 'templating/html.html'),
            contents: fs.readFileSync( path.resolve(__dirname, 'templating/html.html') )
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.po.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.on('end', function (file) {
            var translationWithPaths = emptyTranslationWithPaths();

            translationWithPaths.paths = ['test/templating/html.html'];

            assert.deepEqual( result, {
                first: translationWithPaths,
                second: translationWithPaths,
                third: translationWithPaths,
                fourth: translationWithPaths,
                fifth: translationWithPaths
            });

            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('parses jade templates and tracks file paths', function (done) {
        var result;
        var i18nextParser = Parser({
            trackPaths: true
        });
        var fakeFile = new File({
            path: path.resolve(__dirname, 'templating/jade.jade'),
            contents: fs.readFileSync( path.resolve(__dirname, 'templating/jade.jade') )
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.po.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.on('end', function (file) {
            var translationWithPaths = emptyTranslationWithPaths();

            translationWithPaths.paths = ['test/templating/jade.jade'];

            assert.deepEqual( result, { first: translationWithPaths });
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('parses handlebars templates and tracks file paths', function (done) {
        var result;
        var i18nextParser = Parser({
            trackPaths: true
        });
        var fakeFile = new File({
            path: path.resolve(__dirname, 'templating/handlebars.hbs'),
            contents: fs.readFileSync( path.resolve(__dirname, 'templating/handlebars.hbs') )
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.po.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.on('end', function (file) {
            var translationWithPaths = emptyTranslationWithPaths();

            translationWithPaths.paths = ['test/templating/handlebars.hbs'];

            assert.deepEqual( result, { first: translationWithPaths } );
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('creates three files per namespace and per locale while tracking paths', function (done) {
        var results = [];
        var resultContents = [];
        var translationWithPaths = emptyTranslationWithPaths();
        translationWithPaths.paths = ['test/fake.js'];
        var i18nextParser = Parser({
            locales: ['en', 'de', 'fr'],
            namespace: 'default',
            trackPaths: true
        });
        var fakeFile = new File({
            path: path.resolve(__dirname, './fake.js'),
            contents: new Buffer("asd t('ns1:first') t('second') \n asd t('ns2:third') ad t('fourth')")
        });

        i18nextParser.on('data', function (file) {
            results.push( file.relative );

            if (/\.po\.json$/.test(file.relative)) {
                resultContents.push(JSON.parse( file.contents ));
            }
        });
        i18nextParser.on('end', function (file) {
            var expectedFiles = [
                'en/default.json', 'en/default.po.json', 'en/default_old.json',
                'en/ns1.json', 'en/ns1.po.json', 'en/ns1_old.json',
                'en/ns2.json', 'en/ns2.po.json', 'en/ns2_old.json',
                'de/default.json', 'de/default.po.json', 'de/default_old.json',
                'de/ns1.json', 'de/ns1.po.json', 'de/ns1_old.json',
                'de/ns2.json', 'de/ns2.po.json', 'de/ns2_old.json',
                'fr/default.json', 'fr/default.po.json', 'fr/default_old.json',
                'fr/ns1.json', 'fr/ns1.po.json', 'fr/ns1_old.json',
                'fr/ns2.json', 'fr/ns2.po.json', 'fr/ns2_old.json'
            ];
            var length = expectedFiles.length;

            expectedFiles.forEach(function (filename) {
                assert( results.indexOf( filename ) !== -1 );
                if( ! --length ) done();
            });

            var expectedContents = [
                { fourth: translationWithPaths,
                  second: translationWithPaths },
                { first: translationWithPaths },
                { third: translationWithPaths },
                { fourth: translationWithPaths,
                  second: translationWithPaths },
                { first: translationWithPaths },
                { third: translationWithPaths },
                { fourth: translationWithPaths,
                  second: translationWithPaths },
                { first: translationWithPaths },
                { third: translationWithPaths }
            ];

            assert.deepEqual(resultContents, expectedContents);

        });

        i18nextParser.end(fakeFile);
    });

    it('retrieves values in existing file and tracks file paths', function (done) {
        var result;
        var i18nextParser = Parser({
            trackPaths: true
        });
        var fakeFile = new File({
            path: __dirname,
            base: __dirname,
            contents: new Buffer("asd t('test_merge:first') t('test_merge:second')")
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/test_merge.po.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.once('end', function (file) {
            var translationWithPaths = emptyTranslationWithPaths();
            translationWithPaths.paths = ['test'];

            var firstValue = emptyTranslationWithPaths();
            firstValue.paths = ['test'];
            firstValue.msgstr = 'first';

            assert.deepEqual( result, {
                first: firstValue,
                second: translationWithPaths,
            } );
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('retrieves context values in existing file and tracks file paths', function (done) {
        var result;
        var i18nextParser = Parser({
            trackPaths: true
        });
        var fakeFile = new File({
            path: __dirname,
            base: __dirname,
            contents: new Buffer("asd t('test_context:first')")
        });

        var translationWithPaths = emptyTranslationWithPaths();
        translationWithPaths.paths = ['test'];
        translationWithPaths.msgstr = 'first';

        var expectedResult = {
            first: translationWithPaths,
            first_context1: 'first context1',
            first_context2: ''
        };

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/test_context.po.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.once('end', function (file) {
            assert.deepEqual( result, expectedResult );
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('retrieves plural values in existing file and tracks file paths', function (done) {
        var result;
        var i18nextParser = Parser({
            trackPaths: true
        });
        var fakeFile = new File({
            path: __dirname,
            base: __dirname,
            contents: new Buffer("asd t('test_plural:first') t('test_plural:second')")
        });

        var firstValue = emptyTranslationWithPaths();
        firstValue.paths = ['test'];
        firstValue.msgstr = 'first';

        var secondValue = emptyTranslationWithPaths();
        secondValue.paths = ['test'];
        secondValue.msgstr = 'second';

        var expectedResult = {
            first: firstValue,
            first_plural: 'first plural',
            second: secondValue,
            second_plural_0: 'second plural 0',
            second_plural_12: 'second plural 12'
        };

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/test_plural.po.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.once('end', function (file) {
            assert.deepEqual( result, expectedResult );
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('retrieves plural and context values in existing file and tracks file paths', function (done) {
        var result;
        var i18nextParser = Parser({
            trackPaths: true
        });
        var fakeFile = new File({
            path: __dirname,
            base: __dirname,
            contents: new Buffer("asd t('test_context_plural:first')")
        });

        var firstValue = emptyTranslationWithPaths();
        firstValue.paths = ['test'];
        firstValue.msgstr = 'first';

        var expectedResult = {
            first: firstValue,
            first_context1_plural: 'first context1 plural',
            first_context2_plural_2: 'first context2 plural 2'
        };

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/test_context_plural.po.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.once('end', function (file) {
            assert.deepEqual( result, expectedResult );
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('removes any trailing [bla] in the key and tracks file paths', function (done) {
        var result;
        var translationWithPaths = emptyTranslationWithPaths();
        translationWithPaths.paths = ['test/fake.html'];
        var i18nextParser = Parser({
            trackPaths: true
        });
        var fakeFile = new File({
            path: path.resolve(__dirname, 'fake.html'),
            contents: new Buffer('<p data-i18n="[html]first">!first key!</p>')
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.po.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.on('end', function (file) {
            assert.deepEqual( result, { first: translationWithPaths } );
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('parses context passed as object and tracks file paths', function (done) {
        var result;
        var translationWithPaths = emptyTranslationWithPaths();
        translationWithPaths.paths = ['test/fake.js'];
        var i18nextParser = Parser({
            trackPaths: true
        });
        var fakeFile = new File({
            path: path.resolve(__dirname, 'fake.js'),
            contents: new Buffer('t("first", {context: \'date\'}) t("second", { "hello": "world", "context": \'form2\', "foo": "bar"}) t(`third`, { \'context\' : `context` }) t("fourth", { "context" : "pipo"})')
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.po.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.on('end', function (file) {
            assert.deepEqual( result, {
                first_date: translationWithPaths,
                second_form2: translationWithPaths,
                third_context: translationWithPaths,
                fourth_pipo: translationWithPaths
            });
            done();
        });

        i18nextParser.end(fakeFile);
    });
});
