var fs              = require('fs');
var path            = require('path');
var assert          = require('assert');
var File            = require('vinyl');
var through         = require('through2');
var Parser          = require('../index');

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
        i18nextParser.on('end', function () {
            assert.deepEqual( result, { first: '', second: '', third: '', fourth: '' } );
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('parses multiline function calls', function (done) {
      var result;
      var i18nextParser = Parser();
      var fakeFile = new File({
          contents: new Buffer("asd t(\n  'first'\n) t('second') \n asd t(\n\n'third')")
      });

      i18nextParser.on('data', function (file) {
          if ( file.relative === 'en/translation.json' ) {
              result = JSON.parse( file.contents );
          }
      });
      i18nextParser.on('end', function () {
          assert.deepEqual( result, { first: '', second: '', third: '' } );
          done();
      });

      i18nextParser.end(fakeFile);
    });

	it('parses default js translations', function (done) {
		var result;
		var i18nextParser = Parser({ defaultValues: true });
		var fakeFile = new File({
			contents: new Buffer("asd t('first', { defaultValue: 'lol' }) t('second', {defaultValue:\"mdr\"}) \n asd t('third', { other: 'yolo', \ndefaultValue: `ptdr` }) ad t('fourth')")
		});

		i18nextParser.on('data', function (file) {
			if ( file.relative === 'en/translation.json' ) {
				result = JSON.parse( file.contents );
			}
		});
		i18nextParser.on('end', function () {
			assert.deepEqual( result, { first: 'lol', second: 'mdr', third: 'ptdr', fourth: '' } );
			done();
		});

		i18nextParser.end(fakeFile);
	});

    it('parses attributes in html templates', function (done) {
        var result;
        var i18nextParser = Parser({
          attributes: ['data-i18n', 'translate', 't']
        });
        var fakeFile = new File({
            contents: new Buffer('<p data-i18n>first</p><p translate="second">Second</p><p t="[html]third">Third</p><p data-i18n="[title]fourth;fifth">Fifth</p>')
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.on('end', function () {
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
        i18nextParser.on('end', function () {
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
        i18nextParser.on('end', function () {
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
        i18nextParser.on('end', function () {
            assert.deepEqual( result, { first: '', second: '' } );
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
        i18nextParser.on('end', function () {

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

    it('creates only one file per namespace and per locale with writeOld: false', function (done) {
        var results = [];
        var i18nextParser = Parser({
            locales: ['en', 'de', 'fr'],
            namespace: 'default',
            writeOld: false
        });
        var fakeFile = new File({
            contents: new Buffer("asd t('ns1:first') t('second') \n asd t('ns2:third') ad t('fourth')")
        });

        i18nextParser.on('data', function (file) {
            results.push(file.relative);
        });
        i18nextParser.on('end', function () {

            var expectedFiles = [
                'en/default.json', 'en/ns1.json', 'en/ns2.json',
                'de/default.json', 'de/ns1.json', 'de/ns2.json',
                'fr/default.json', 'fr/ns1.json', 'fr/ns2.json'
            ];
            var length = expectedFiles.length;

            expectedFiles.forEach(function (filename) {
                assert( results.indexOf( filename ) !== -1 );
                if( ! --length ) done();
            });
        });

        i18nextParser.end(fakeFile);
    });

    it('handles prefix, suffix and extension with the current locale tag in each', function (done) {
        var results = [];
        var i18nextParser = Parser({
            locales: ['en'],
            namespace: 'default',
            prefix: 'p-$LOCALE-',
            suffix: '-s-$LOCALE',
            extension: '.$LOCALE.i18n'
        });
        var fakeFile = new File({
            contents: new Buffer("asd t('fourth')")
        });

        i18nextParser.on('data', function (file) {
            results.push(file.relative);
        });
        i18nextParser.on('end', function () {
            var expectedFiles = [
                'en/p-en-default-s-en.en.i18n', 'en/p-en-default-s-en_old.en.i18n'
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
        i18nextParser.once('end', function () {
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
        i18nextParser.once('end', function () {
            var keys = Object.keys(result);
            assert.equal( keys[0], "escaped 'single quotes'" );
            assert.equal( keys[1], 'escaped "double quotes"' );
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('handles escaped characters', function (done) {
        var result;
        var i18nextParser = Parser();
        var fakeFile = new File({
            base: __dirname,
            contents: new Buffer("asd t('escaped backslash\\\\ newline\\n\\r tab\\t')")
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.once('end', function () {
            var keys = Object.keys(result);
            assert.equal( keys[0], 'escaped backslash\\ newline\n\r tab\t' );
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('handles es6 template strings with expressions', function (done) {
        var result;
        var i18nextParser = Parser();
        var fakeFile = new File({
            base: __dirname,
            contents: new Buffer("asd t(`root.plain`) t(`root.${expr}`) t(`root.${dotted.path}`)")
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.once('end', function () {
            assert.deepEqual(Object.keys(result), ['root']);
            assert.deepEqual(Object.keys(result.root), [
              '${path}',
              '${expr}',
              'plain'
            ]);
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
        i18nextParser.once('end', function () {
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
        i18nextParser.once('end', function () {
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
        i18nextParser.once('end', function () {
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
        i18nextParser.once('end', function () {
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
        i18nextParser.on('end', function () {
            assert.deepEqual( result, { first: '' } );
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('fails to parse translation function with a variable', function (done) {
        var i18nextParser = Parser();
        var fakeFile = new File({
            contents: new Buffer("asd t(firstVar)\n")
        });

        i18nextParser.on('error', function (message, region) {
            assert.equal( message, 'i18next-parser does not support variables in translation functions, use a string literal' );
            assert.equal( region, 't(firstVar)' );
            done();
        });

        i18nextParser.end(fakeFile);
    });

    it('does not parse text with `doesn\'t` or isolated `t` in it', function (done) {
        var result;
        var i18nextParser = Parser();
        var fakeFile = new File({
            contents: new Buffer("// FIX this doesn't work and this t is all alone\nt('first')\nt = function() {}")
        });
        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.on('end', function () {
            assert.deepEqual( result, {first: ''} );
            done();
        });
        i18nextParser.end(fakeFile);
    });

    it('parses context passed as object', function (done) {
        var result;
        var i18nextParser = Parser();
        var fakeFile = new File({
            contents: new Buffer('t("first", {context: \'date\'}) t("second", { "hello": "world", "context": \'form2\', "foo": "bar"}) t(`third`, { \'context\' : `context` }) t("fourth", { "context" : "pipo"})')
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.on('end', function () {
            assert.deepEqual( result, { first_date: '', second_form2: '', third_context: '', fourth_pipo: '' } );
            done();
        });
        i18nextParser.end(fakeFile);
    });

    it('ignores functions that ends with a t', function (done) {
        var result;
        var i18nextParser = Parser();
        var fakeFile = new File({
            contents: new Buffer('import \'./yolo.js\'; t(\'first\');')
        });

        i18nextParser.on('data', function (file) {
            if ( file.relative === 'en/translation.json' ) {
                result = JSON.parse( file.contents );
            }
        });
        i18nextParser.on('end', function () {
            assert.deepEqual( result, { first: '' });
            done();
        });
        i18nextParser.end(fakeFile);
    });
});
