#!/usr/bin/env node

var colors      = require('colors');
var program     = require('commander');
var fs          = require('fs');
var path        = require('path');
var Readable    = require('stream').Readable;
var readdirp    = require('readdirp');
var through     = require('through2');
var File        = require('vinyl');
var mkdirp      = require('mkdirp');
var Parser      = require('../index');


// Configure the command line
// ==========================
program
  .version('0.13.0')
  .option( '-r, --recursive'                     , 'Parse sub directories' )
  .option( '-p, --parser <string>'               , 'A custom regex to use to parse your code' )
  .option( '-a, --attributes <list>'             , 'The html attributes to parse' )
  .option( '-o, --output <directory>'            , 'The directory to output parsed keys' )
  .option( '-f, --functions <list>'              , 'The function names to parse in your code' )
  .option( '--prefix <string>'                   , 'Prefix filename for each locale, eg.: \'pre-$LOCALE-\' will yield \'pre-en-default.json\'')
  .option( '--suffix <string>'                   , 'Suffix filename for each locale, eg.: \'-$suf-LOCALE\' will yield \'default-suf-en.json\'')
  .option( '--extension <string>'                , 'Specify extension for filename for each locale, eg.: \'.$LOCALE.i18n\' will yield \'default.en.i18n\'')
  .option( '-n, --namespace <string>'            , 'The default namespace (translation by default)' )
  .option( '-s, --namespace-separator <string>'  , 'The default namespace separator (: by default)' )
  .option( '-k, --key-separator <string>'        , 'The default key separator (. by default)' )
  .option( '-c, --context-separator <string>'    , 'The default context separator (_ by default)' )
  .option( '-l, --locales <list>'                , 'The locales in your application' )
  .option( '--directoryFilter <list>'            , 'Filter directories' )
  .option( '--fileFilter <list>'                 , 'Filter files' )
  .option( '--keep-removed'                      , 'Prevent keys no longer found from being removed' )
  .option( '--write-old <string>'                , 'Save (or don\'t if false) _old files' )
  .option( '--ignore-variables'                  , 'Don\'t fail when a variable is found' )
  .option( '--default-values'                    , 'Extract default values' )
  .parse( process.argv );



// Define the target directory
// ===========================
var firstArgument = process.argv[2];
var input;
var output;

if ( firstArgument && firstArgument.charAt(0) !== '-' ) {
  var parts = firstArgument.split(':');

  if ( parts.length > 1 ) {
    input = path.resolve(process.cwd(), parts[0]);
    output = path.resolve(process.cwd(), parts[1]);
  }
  else {
    input = path.resolve(process.cwd(), firstArgument);
  }
}
else {
  input = process.cwd();
}

output = output || program.output || 'locales';

if ( ! fs.existsSync(input) ) {
  console.log( '\n' + 'Error: '.red + input + ' is not a file or directory\n' );
  process.exit( 1 );
}



// Parse passed values
// ===================
program.locales = program.locales && program.locales.split(',');
program.attributes = program.attributes && program.attributes.split(',');
program.functions = program.functions && program.functions.split(',');
program.writeOld = program.writeOld !== 'false';
program.directoryFilter = program.directoryFilter && program.directoryFilter.split(',');
program.fileFilter = program.fileFilter && program.fileFilter.split(',');
program.output = path.resolve(process.cwd(), output);



// Welcome message
// ===============
var intro = '\n'+
'i18next Parser'.yellow + '\n' +
'--------------'.yellow + '\n' +
'Input:  '.green + input + '\n' +
'Output: '.green + program.output + '\n\n';

console.log(intro);



// Create a stream from the input
// ==============================
var stat = fs.statSync(input);
var stream;

if ( stat.isDirectory() ) {
  var args = { root: input };
  if( program.directoryFilter ) {
    args.directoryFilter = program.directoryFilter;
  }
  if( program.fileFilter ) {
    args.fileFilter = program.fileFilter;
  }
  if ( ! program.recursive) {
    args.depth = 0;
  }

  stream = readdirp( args );
}
else {
  stream = new Readable( { objectMode: true } );
  var file = new File({
    path: input,
    stat: stat
  });
  stream._read = function() {
    stream.push( file );
    stream.push( null );
  };
}



// Parse the stream
// ================
var parser = Parser(program);
parser.on('error', function (message, region) {
  console.log('[error] '.red + message + ': ' + region.trim());
});

stream
  .pipe(through( { objectMode: true }, function (data, encoding, done) {

    if ( data instanceof File ) {
      this.push( data );
    }
    else if ( data.fullPath ) {
      var file = new File({
        path: data.fullPath,
        stat: data.stat
      });
      this.push( file );
    }

    done();
  }))
  .pipe(parser.on('reading', function(path) { console.log('[parse] '.green + path) }))
  .pipe(through( { objectMode: true }, function (file, encoding, done) {

    mkdirp.sync( path.dirname(file.path) );

    fs.writeFileSync( file.path, file.contents + "\n" );

    this.push( file );

    done();
  }));
