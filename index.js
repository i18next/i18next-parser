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

    var self = this;

    options         = options || {};
    transformConfig = transformConfig || {};

    this.defaultNamespace   = options.namespace || 'translation';
    this.functions          = options.functions || ['t'];
    this.locales            = options.locales || ['en','fr'];
    this.output             = options.output || 'locales';
    this.regex              = options.parser;
    this.namespaceSeparator = options.namespaceSeparator || ':';
    this.keySeparator 	    = options.keySeparator || '.';
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



    // create the parser regexes
    // =========================
    var fileContent = data.toString();
    var keys = [];
    var matches;

    this.emit( 'reading', file.path );


    // and we parse for functions...
    // =============================
    var fnPattern = '(?:' + this.functions.join( ')|(?:' ).replace( '.', '\\.' ) + ')';
    var pattern = '[^a-zA-Z0-9_](?:'+fnPattern+')(?:\\(|\\s)\\s*(?:(?:\'((?:(?:\\\\\')?[^\']*)+[^\\\\])\')|(?:"((?:(?:\\\\")?[^"]*)+[^\\\\])"))';
    var functionRegex = new RegExp( this.regex || pattern, 'g' );

    while (( matches = functionRegex.exec( fileContent ) )) {

        // the key should be the first truthy match
        for (var i in matches) {
            if (i > 0 && matches[i]) {
                keys.push( matches[i] );
                break;
            }
        }
    }


    // and we parse for data-i18n attributes in html
    // =============================================
    var attributeWithValueRegex = new RegExp( '(?:\\s+data-i18n=")([^"]*)(?:")', 'gi' );
    var attributeWithoutValueRegex = new RegExp( '<([A-Z][A-Z0-9]*)(?:(?:\\s+[A-Z0-9-]+)(?:(?:=")(?:[^"]*)(?:"))?)*(?:(?:\\s+data-i18n))(?:(?:\\s+[A-Z0-9-]+)(?:(?:=")(?:[^"]*)(?:"))?)*\\s*(?:>(.*?)<\\/\\1>)', 'gi' );

    while (( matches = attributeWithValueRegex.exec( fileContent ) )) {
        matchKeys = matches[1].split(';');

        for (var i in matchKeys) {
            // remove any leading [] in the key
            keys.push( matchKeys[i].replace( /^\[[a-zA-Z0-9_-]*\]/ , '' ) );
        }
    }

    while (( matches = attributeWithoutValueRegex.exec( fileContent ) )) {
        keys.push( matches[2] );
    }


    // finally we add the parsed keys to the catalog
    // =============================================
    for (var j in keys) {
        // remove the backslash from escaped quotes
        var key = keys[j].replace(/\\('|")/g, '$1');

        if ( key.indexOf( self.namespaceSeparator ) == -1 ) {
            key = self.defaultNamespace + self.keySeparator + key;
        }
        else {
            key = key.replace( self.namespaceSeparator, self.keySeparator );
        }

        self.translations.push( key );
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
        var key = self.translations[index];
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
                    currentTranslations = {};
                }
            }
            else {
                currentTranslations = {};
            }

            if ( fs.existsSync( namespaceOldPath ) ) {
                try {
                    oldTranslations = JSON.parse( fs.readFileSync( namespaceOldPath ) );
                }
                catch (error) {
                    this.emit( 'json_error', error.name, error.message );
                    currentTranslations = {};
                }
            }
            else {
                oldTranslations = {};
            }



            // merges existing translations with the new ones
            mergedTranslations = helpers.mergeHash( currentTranslations, translationsHash[namespace] );

            // restore old translations if the key is empty
            mergedTranslations.new = helpers.replaceEmpty( oldTranslations, mergedTranslations.new );

            // merges former old translations with the new ones
            mergedTranslations.old = _.extend( oldTranslations, mergedTranslations.old );



            // push files back to the stream
            mergedTranslationsFile = new File({
              path: namespacePath,
              base: base,
              contents: new Buffer( JSON.stringify( mergedTranslations.new, null, 2 ) )
            });
            mergedOldTranslationsFile = new File({
              path: namespaceOldPath,
              base: base,
              contents: new Buffer( JSON.stringify( mergedTranslations.old, null, 2 ) )
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
