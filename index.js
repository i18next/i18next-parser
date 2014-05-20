var gutil       = require('gulp-util');
var PluginError = gutil.PluginError;
var Transform   = require('stream').Transform;
var util        = require('util');
var helpers     = require('./src/helpers');
var fs          = require('fs');
var File        = require('vinyl');
var path        = require('path');
var _           = require('lodash');



const PLUGIN_NAME = 'i18next-parser';



function Parser(options, transformConfig) {

    var self            = this;
    var options         = options || {};
    var transformConfig = transformConfig || {};

    this.defaultNamespace   = options.namespace || 'translation';
    this.functions          = options.functions || ['t'];
    this.locales            = options.locales || ['en','fr'];
    this.output             = options.output || 'locales';
    this.regex              = options.parser;
    this.namespaceSeparator = options.namespaceSeparator || ':'
    this.keySeparator 	    = options.keySeparator || '.'
    this.translations       = [];

    ['functions', 'locales'].forEach(function( attr ) {
        if ( (typeof self[ attr ] !== 'object') || ! self[ attr ].length ) {
            throw new PluginError(PLUGIN_NAME, '`'+attr+'` must be an array');
        }
    });

    transformConfig.objectMode = true;
    Transform.call(this, transformConfig);
}
util.inherits(Parser, Transform);



Parser.prototype._transform = function(file, encoding, done) {

    var self        = this;
    this.base       = this.base || file.base;



    // we do not handle streams
    // ========================
    if (file.isStream()) {
        this.emit( 'error', new PluginError( PLUGIN_NAME, 'Streams not supported' ) );
        return done();
    }



    // get the file from file path
    // ===========================
    if(file.isNull()) {
        if ( file.stat.isDirectory() ) {
            return done();
        }
        else if ( file.path && fs.existsSync( file.path ) ) {
            data = fs.readFileSync( file.path );
        }
        else {
            this.emit( 'error', new PluginError( PLUGIN_NAME, 'File has no content and is not readable' ) );
            return done();
        }
    }



    // we handle buffers
    // =================
    if(file.isBuffer()) {
        data = file.contents;
    } 



    // create the regex parser
    // =======================
    fnPattern = this.functions.join( ')|(?:' ).replace( '.', '\\.' )
    fnPattern = '(?:' + fnPattern + ')'
    pattern = '[^a-zA-Z0-9_](?:'+fnPattern+')(?:\\(|\\s)\\s*(?:(?:\'((?:(?:\\\\\')?[^\']+)+[^\\\\])\')|(?:"((?:(?:\\\\")?[^"]+)+[^\\\\])"))'
    regex = new RegExp( this.regex || pattern, 'g' )



    // and we parse...
    // ===============
    var fileContent = data.toString();

    this.emit( 'reading', file.path );

    while ( matches = regex.exec( fileContent ) ) {
        match = matches[1] || matches[2];
        
        if ( match.indexOf( self.namespaceSeparator ) == -1 ) {
            match = self.defaultNamespace + self.keySeparator + match
        }
        else {
            match = match.replace( self.namespaceSeparator, self.keySeparator );
        }

        self.translations.push( match );
    }

    done();
};



Parser.prototype._flush = function(done) {

    var self = this;
    var base = path.resolve( self.base, self.output );
    var translationsHash = {};



    // remove duplicate keys
    // =====================
    self.translations = _.uniq( self.translations ).sort();


    
    // turn the array of keys
    // into an associative object
    // ==========================
    for (var index in self.translations) {
        key = self.translations[index];
        translationsHash = helpers.hashFromString( key, self.keySeparator, translationsHash );
    }



    // process each locale and namespace
    // =================================
    for (var i in self.locales) {
        var locale     = self.locales[i];
        var localeBase = path.resolve( self.base, self.output, locale );

        for (var namespace in translationsHash) {

            // get previous version of the files
            var namespacePath    = path.resolve( localeBase, namespace + '.json' );
            var namespaceOldPath = path.resolve( localeBase, namespace + '_old.json' );

            if ( fs.existsSync( namespacePath ) ) {
                try {
                    currentTranslations = JSON.parse( fs.readFileSync( namespacePath ) );
                }
                catch (error) {
                    this.emit( 'json_error', error.name, error.message );
                    currentTranslations = {}
                }
            }
            else {
                currentTranslations = {}
            }

            if ( fs.existsSync( namespaceOldPath ) ) {
                try {
                    oldTranslations = JSON.parse( fs.readFileSync( namespaceOldPath ) );
                }
                catch (error) {
                    this.emit( 'json_error', error.name, error.message );
                    currentTranslations = {}
                }
            }
            else {
                oldTranslations = {}
            }



            // merges existing translations with the new ones
            mergedTranslations = helpers.mergeHash( currentTranslations, translationsHash[namespace] );

            // restore old translations if the key is empty
            mergedTranslations['new'] = helpers.replaceEmpty( oldTranslations, mergedTranslations['new'] );

            // merges former old translations with the new ones
            mergedTranslations['old'] = _.extend( oldTranslations, mergedTranslations['old'] );



            // push files back to the stream
            mergedTranslationsFile = new File({
              path: namespacePath,
              base: base,
              contents: new Buffer( JSON.stringify( mergedTranslations['new'], null, 2 ) )
            });
            mergedOldTranslationsFile = new File({
              path: namespaceOldPath,
              base: base,
              contents: new Buffer( JSON.stringify( mergedTranslations['old'], null, 2 ) )
            });

            this.emit( 'writing', namespacePath );
            this.emit( 'writing', namespaceOldPath );

            self.push( mergedTranslationsFile );
            self.push( mergedOldTranslationsFile );
        }
    }

    done();
};



module.exports = function(options, transformConfig) {
    return new Parser(options, transformConfig);
};