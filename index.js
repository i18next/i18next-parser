#!/usr/bin/env node

var _           = require('lodash');
var colors      = require('colors');
var program     = require('commander');
var path        = require('path');
var fs          = require('fs');
var mkdirp      = require('mkdirp');
var readdirp    = require('readdirp');
var concat      = require('concat-stream');

var FileBuffer = require('./src/FileBuffer');
var Parser = require('./src/Parser');
var helpers = require('./src/helpers');



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
  .option('--directoryFilter <list>'  , 'Filter directories')
  .option('--fileFilter <list>'       , 'Filter files')
  .parse(process.argv);

if (process.argv[2]) {
    file = path.resolve(__dirname, process.argv[2]);
}
else {
    file = __dirname;
}

program.locales = program.locales.split(',')
program.functions = program.functions.split(',')



// CONFIG THE STREAM TRANSFORMS
// ============================
var bufferize = FileBuffer();
var parser = Parser({
    defaultNamespace: program.namespace,
    functions: program.functions,
    regex: program.parser
});



// RUN THE PROGRAM
// ===============
var stat = fs.statSync(file)
var translations = {}


var intro = "\n"+
"i18next Parser".yellow + "\n" + 
"--------------".yellow + "\n" +
"Target: ".green + file + "\n" +
"Output: ".green + program.output + "\n\n";
console.log(intro);


if ( stat.isDirectory() ) {
    args = { root: file }
    if( program.directoryFilter ) {
        args.directoryFilter = program.directoryFilter.split(',');
    }
    if( program.fileFilter ) {
        args.fileFilter = program.fileFilter.split(',');
    }

    if (program.recursive) {
        stream = readdirp( args );
    }
    else {
        args.depth = 0;
        stream = readdirp( args );
    }    
}
else {
    stream = fs.createReadStream( file, {encoding: 'utf8'} )
    console.log("[parse] ".green + file);
}

stream
    .pipe(bufferize)
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
