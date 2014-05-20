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
  .version('0.1.10')
  .option( '-r, --recursive'                     , 'Parse sub directories' )
  .option( '-p, --parser <string>'               , 'A custom regex to use to parse your code' )
  .option( '-o, --output <directory>'            , 'The directory to output parsed keys' )
  .option( '-f, --functions <list>'              , 'The function names to parse in your code' )
  .option( '-n, --namespace <string>'            , 'The default namespace (translation by default)' )
  .option( '-s, --namespace-separator <string>'  , 'The default namespace separator(: by default)' )
  .option( '-k, --key-separator <string>'        , 'The default key separator(. by default)' )
  .option( '-l, --locales <list>'                , 'The locales in your application' )
  .option( '--directoryFilter <list>'            , 'Filter directories' )
  .option( '--fileFilter <list>'                 , 'Filter files' )
  .parse( process.argv );



// Define the target directory
// ===========================
var option = process.argv[2];

if ( option && option.charAt(0) !== '-' ) {
    file = path.resolve(process.cwd(), process.argv[2]);
}
else {
    file = process.cwd();
}

if ( ! fs.existsSync(file) ) {
    console.log( "\n" + "Error: ".red + file + " is not a file or directory\n" );
    process.exit( 1 );
}


// Parse passed values
// ===================
program.locales = program.locales && program.locales.split(',');
program.functions = program.functions && program.functions.split(',');
program.output = program.output && path.resolve(process.cwd(), program.output) || path.resolve(process.cwd(), 'locales');
program.directoryFilter = program.directoryFilter && program.directoryFilter.split(',');
program.fileFilter = program.fileFilter && program.fileFilter.split(',');



// Welcome message
// ===============
var intro = "\n"+
"i18next Parser".yellow + "\n" + 
"--------------".yellow + "\n" +
"Input:  ".green + file + "\n" +
"Output: ".green + program.output + "\n\n";

console.log(intro);



// Create a stream from the input
// ==============================
var stat = fs.statSync(file)

if ( stat.isDirectory() ) {
    args = { root: file }
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
    stream._read = function() {
        stream.push( new File( { path: file } ) );
        stream.push( null );
    }
}



// Parse the stream
// ================
var parser = Parser(program);

stream
    .pipe(through( { objectMode: true }, function (data, encoding, done) {

        if ( data instanceof File ) {
            this.push( data );
        }
        else if ( data.fullPath ) {
            file = new File({
                path: data.fullPath,
                stat: data.stat
            });
            this.push( file );
        }

        done();
    }))
    .pipe(parser.on('reading', function(path) { console.log("[parse] ".green + path) }))
    .pipe(through( { objectMode: true }, function (file, encoding, done) {
        
        mkdirp.sync( path.dirname(file.path) );

        fs.writeFileSync( file.path, file.contents );

        this.push( file );

        done();
    }));