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

    it('handles custom namespace and key separators', function (done) {
        var result;
        var i18nextParser = Parser({
            namespaceSeparator: '?',
            keySeparator: '-'
        });
        var fakeFile = new File({
            base: __dirname,
            contents: new Buffer("asd t('test3?first') t('test3?second-third')")
        }); 

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/test3.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.once('end', function (file) {
            assert.deepEqual( result, { first: '', second: { third: '' } } )
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
            contents: new Buffer("asd t('test1:first') t('test1:second')")
        }); 

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/test1.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.once('end', function (file) {
            assert.deepEqual( result, { first: 'first', second: '' } )
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('retrieves plural values in existing file', function (done) {
        var i18nextParser = Parser();
        var fakeFile = new File({
            base: __dirname,
            contents: new Buffer("asd t('test2:first') t('test2:second')")
        }); 

        var expectedResult = {
            first: 'first', 
            first_plural: 'first plural',
            second: 'second',
            second_plural_0: 'second plural 0',
            second_plural_12: 'second plural 12'
        }

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/test2.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.once('end', function (file) {
            assert.deepEqual( result, expectedResult )
            done();
        });

        i18nextParser.end(fakeFile);
    });
});