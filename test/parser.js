describe('parser', function () {
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
            assert.deepEqual( result, { first: '', second: '', third: '', fourth: '' } );
            done();
        });

        i18nextParser.end(fakeFile);
    });


    it('parses data-i18n attributes in html templates', function (done) {
        var result;
        var i18nextParser = Parser();
        var fakeFile = new File({
            contents: new Buffer('<p data-i18n>first</p><p data-i18n="second">Second</p><p data-i18n="[html]third">Third</p><p data-i18n="[title]fourth;fifth">Fifth</p>')
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.on('end', function (file) {
            assert.deepEqual( result, { first: '', second: '', third: '', fourth: '', fifth: '' } );
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('parses html templates', function (done) {
        var result;
        var i18nextParser = Parser();
        var fakeFile = new File({
            contents: fs.readFileSync( path.resolve(__dirname, 'templating/html.html') )
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.on('end', function (file) {
            assert.deepEqual( result, { first: '', second: '', third: '', fourth: '', fifth: '' } );
            done();
        });

        i18nextParser.end(fakeFile);
    });


    it('parses jade templates', function (done) {
        var result;
        var i18nextParser = Parser();
        var fakeFile = new File({
            contents: fs.readFileSync( path.resolve(__dirname, 'templating/jade.jade') )
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.on('end', function (file) {
            assert.deepEqual( result, { first: '' } );
            done();
        });

        i18nextParser.end(fakeFile);
    });


    it('parses handlebars templates', function (done) {
        var result;
        var i18nextParser = Parser();
        var fakeFile = new File({
            contents: fs.readFileSync( path.resolve(__dirname, 'templating/handlebars.hbs') )
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.on('end', function (file) {
            assert.deepEqual( result, { first: '' } );
            done();
        });

        i18nextParser.end(fakeFile);
    });


    it('creates two files per namespace and per locale', function (done) {
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

    it('handles custom namespace and key separators', function (done) {
        var result;
        var i18nextParser = Parser({
            namespaceSeparator: '?',
            keySeparator: '-'
        });
        var fakeFile = new File({
            base: __dirname,
            contents: new Buffer("asd t('test_separators?first') t('test_separators?second-third')")
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/test_separators.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.once('end', function (file) {
            assert.deepEqual( result, { first: '', second: { third: '' } } );
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('handles escaped single and double quotes', function (done) {
        var result;
        var i18nextParser = Parser();
        var fakeFile = new File({
            base: __dirname,
            contents: new Buffer("asd t('escaped \\'single quotes\\'') t(\"escaped \\\"double quotes\\\"\")")
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.once('end', function (file) {
            var keys = Object.keys(result);
            assert.equal( keys[0], 'escaped "double quotes"' );
            assert.equal( keys[1], "escaped 'single quotes'" );
            done();
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

    it('retrieves values in existing file', function (done) {
        var i18nextParser = Parser();
        var fakeFile = new File({
            base: __dirname,
            contents: new Buffer("asd t('test_merge:first') t('test_merge:second')")
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/test_merge.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.once('end', function (file) {
            assert.deepEqual( result, { first: 'first', second: '' } );
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('retrieves context values in existing file', function (done) {
        var i18nextParser = Parser();
        var fakeFile = new File({
            base: __dirname,
            contents: new Buffer("asd t('test_context:first')")
        });

        var expectedResult = {
            first: 'first',
            first_context1: 'first context1',
            first_context2: ''
        };

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/test_context.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.once('end', function (file) {
            assert.deepEqual( result, expectedResult );
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('retrieves plural values in existing file', function (done) {
        var i18nextParser = Parser();
        var fakeFile = new File({
            base: __dirname,
            contents: new Buffer("asd t('test_plural:first') t('test_plural:second')")
        });

        var expectedResult = {
            first: 'first',
            first_plural: 'first plural',
            second: 'second',
            second_plural_0: 'second plural 0',
            second_plural_12: 'second plural 12'
        };

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/test_plural.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.once('end', function (file) {
            assert.deepEqual( result, expectedResult );
            done();
        });

        i18nextParser.end(fakeFile);
    });


    it('retrieves plural and context values in existing file', function (done) {
        var i18nextParser = Parser();
        var fakeFile = new File({
            base: __dirname,
            contents: new Buffer("asd t('test_context_plural:first')")
        });

        var expectedResult = {
            first: 'first',
            first_context1_plural: 'first context1 plural',
            first_context2_plural_2: 'first context2 plural 2'
        };

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/test_context_plural.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.once('end', function (file) {
            assert.deepEqual( result, expectedResult );
            done();
        });

        i18nextParser.end(fakeFile);
    });


    it('removes any trailing [bla] in the key', function (done) {
        var result;
        var i18nextParser = Parser();
        var fakeFile = new File({
            contents: new Buffer('<p data-i18n="[html]first">!first key!</p>')
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.on('end', function (file) {
            assert.deepEqual( result, { first: '' } );
            done();
        });

        i18nextParser.end(fakeFile);
    });
});
