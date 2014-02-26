#!/usr/bin/env node

var _           = require('lodash');
var program     = require('commander');
var path        = require('path');
var fs          = require('fs');
var mkdirp      = require('mkdirp');
var readdirp    = require('readdirp');
var concat      = require('concat-stream');


// CONFIG THE PROGRAM
// ==================
program
  .version('0.0.3')
  .option('-r, --recursive'           , 'Parse sub directories')
  .option('-p, --parser <string>'     , 'A custom regex to use to parse your code')
  .option('-o, --output <directory>'  , 'The directory to output parsed keys'             , path.resolve(__dirname, 'locales'))
  .option('-f, --functions <list>'    , 'The function names to parse in your code'        , 't,i18n.t')
  .option('-n, --namespace <string>'  , 'The default namespace (translation by default)'  , 'translation')
  .option('-l, --locales <list>'      , 'The locales in your application'                 , 'en,fr')
  .parse(process.argv);

if (process.argv[2]) {
    file = path.resolve(__dirname, process.argv[2]);
}
else {
    file = __dirname;
}

program.locales = program.locales.split(',')
program.functions = program.functions.split(',')


// RUN THE PROGRAM
// ===============
var isFile = require('./src/isFile');
var Parser = require('./src/parser');
var helpers = require('./src/helpers');

var parser = Parser({
    defaultNamespace: program.namespace,
    functions: program.functions,
    regex: program.parser
});
var stat = fs.statSync(file)
var translations = {}

if ( stat.isDirectory() ) {
    if (program.recursive) {
        stream = readdirp( { root: file } )
    }
    else {
        // TODO NOT RECURSIVE
        stream = readdirp( { root: file } )
    }    
}
else {
    stream = fs.createReadStream( file, {encoding: 'utf8'} )
}

stream
    .pipe(isFile)
    .pipe(parser)
    .pipe(concat(function(data) {
        data = _.uniq(data);

        for (var index in data) {
            key = data[index];
            translations = helpers.hashFromString(key, translations)
        }

        for (var i in program.locales) {
            locale = program.locales[i]

            for (var namespace in translations) {
                namespaceFile = path.resolve( program.output, locale, namespace+'.json' )
                namespaceOldFile = path.resolve( program.output, locale, namespace+'_old.json' )

                if ( fs.existsSync(namespaceFile) ) {
                    currentTranslations = JSON.parse( fs.readFileSync( namespaceFile ) );
                }
                else {
                    currentTranslations = {}
                }

                if ( fs.existsSync(namespaceOldFile) ) {
                    oldTranslations = JSON.parse( fs.readFileSync( namespaceOldFile ) );
                }
                else {
                    oldTranslations = {}
                }

                merged = helpers.mergeHash(currentTranslations, translations[namespace]);
                mergedOldTranslations = _.extend( oldTranslations, merged['old'] )

                mkdirp.sync( path.resolve( program.output, locale) )

                fs.writeFileSync( namespaceFile, JSON.stringify( merged['new'], null, 2 ) )
                fs.writeFileSync( namespaceOldFile, JSON.stringify( mergedOldTranslations, null, 2 ) )
            }
        }
    }));
