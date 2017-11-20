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
    this.attributes         = options.attributes || ['data-i18n'];
    this.namespaceSeparator = options.namespaceSeparator || ':';
    this.keySeparator       = options.keySeparator || '.';
    this.contextSeparator   = options.contextSeparator || '_';
    this.translations       = [];
    this.extension          = options.extension || '.json';
    this.suffix             = options.suffix || '';
    this.prefix             = options.prefix || '';
    this.writeOld           = options.writeOld !== false;
    this.keepRemoved        = options.keepRemoved;
    this.ignoreVariables    = options.ignoreVariables || false;
    this.defaultValues      = options.defaultValues || false;

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
    var fnPattern = this.functions.join( '|' ).replace( '.', '\\.' );
    var singleQuotePattern = "'([^\'].*?[^\\\\])?'";
    var doubleQuotePattern = '"([^\"].*?[^\\\\])?"';
    var backQuotePattern   = '`([^\`].*?[^\\\\])?`';
    var stringPattern = '(?:' + singleQuotePattern + '|' + doubleQuotePattern + '|' + backQuotePattern + ')';
    var pattern = '(?:\\W|^)(?:' + fnPattern + ')\\s*\\(?\\s*' + stringPattern + '(?:(?:[^).]*?)\\{(?:.*?)(?:(?:context|\'context\'|"context")\\s*:\\s*' + stringPattern + '(?:.*?)\\}))?';

    if (this.defaultValues) {
        var defaultValuePattern = '(,\\s*{[^}]*defaultValue\\s*:\\s*' + stringPattern + ')?';
        pattern += defaultValuePattern;
    }

    var functionRegex = new RegExp( this.regex || pattern, 'g' );
    while (( matches = functionRegex.exec( fileContent ) )) {
        var key = matches[1] || matches[2] || matches[3];
        if (key) {
            var context = matches[4] || matches[5] || matches[6];
            if (context) {
                key += this.contextSeparator + context;
            }
            var defaultValue = matches[8] || matches[9] || matches[10];
            keys.push( { key: key, defaultValue: defaultValue } );
        }
    }

    // and we parse for functions with variables instead of string literals
    // ====================================================================
    var noStringLiteralPattern = '[^a-zA-Z0-9_\'"`]((?:'+fnPattern+')(?:\\()\\s*(?:[^\'"`\)]+\\)))';
    var matches = new RegExp( noStringLiteralPattern, 'g' ).exec( fileContent );
    if (matches && matches.length) {
        if (!this.ignoreVariables) {
            this.emit(
                'error',
                'i18next-parser does not support variables in translation functions, use a string literal',
                matches[1]
            );
        } else {
            console.log('[warning] '.yellow + 'i18next-parser does not support variables in translation functions, use a string literal ' + matches[1]);
        }
    }

    // and we parse for attributes in html
    // ===================================
    const attributes = '(?:' + this.attributes.join('|') + ')';
    var attributeWithValueRegex = new RegExp( '(?:\\s+' + attributes + '=")([^"]*)(?:")', 'gi' );
    var attributeWithoutValueRegex = new RegExp( '<([A-Z][A-Z0-9]*)(?:(?:\\s+[A-Z0-9-]+)(?:(?:=")(?:[^"]*)(?:"))?)*(?:(?:\\s+' + attributes + '))(?:(?:\\s+[A-Z0-9-]+)(?:(?:=")(?:[^"]*)(?:"))?)*\\s*(?:>(.*?)<\\/\\1>)', 'gi' );

    while (( matches = attributeWithValueRegex.exec( fileContent ) )) {
        matchKeys = matches[1].split(';');

        for (var i in matchKeys) {
            // remove any leading [] in the key
            keys.push( { key: matchKeys[i].replace( /^\[[a-zA-Z0-9_-]*\]/ , '' ) } );
        }
    }

    while (( matches = attributeWithoutValueRegex.exec( fileContent ) )) {
        keys.push( { key: matches[2] } );
    }


    // finally we add the parsed keys to the catalog
    // =============================================
    for (var j in keys) {
        var key = keys[j].key;
        var defaultValue = keys[j].defaultValue;
        // remove the backslash from escaped quotes
        key = key.replace(/\\('|"|`)/g, '$1')
        key = key.replace(/\\n/g, '\n');
        key = key.replace(/\\r/g, '\r');
        key = key.replace(/\\t/g, '\t');
        key = key.replace(/\\\\/g, '\\');

        if ( key.indexOf( self.namespaceSeparator ) == -1 ) {
            key = self.defaultNamespace + self.keySeparator + key;
        }
        else {
            key = key.replace( self.namespaceSeparator, self.keySeparator );
        }

        self.translations.push( { key: key, defaultValue: defaultValue } );
    }

    done();
};



Parser.prototype._flush = function(done) {

    var self = this;
    var base = path.resolve( self.base, self.output );
    var translationsHash = {};



    // remove duplicate keys
    // =====================
    function getKey(translation) {
        return translation.key;
    }
    function byKeyOrder(first, second) {
        return first.key.localeCompare(second.key);
    }
    self.translations = _.uniqBy( self.translations, getKey ).sort(byKeyOrder);



    // turn the array of keys
    // into an associative object
    // ==========================
    for (var index in self.translations) {
        // simplify ${dot.separated.variables} into just their tails (${variables})
        var key = self.translations[index].key.replace( /\$\{(?:[^.}]+\.)*([^}]+)\}/g, '\${$1}' );
        var value = self.translations[index].defaultValue;
        translationsHash = helpers.hashFromString( key, self.keySeparator, value, translationsHash );
    }



    // process each locale and namespace
    // =================================
    for (var i in self.locales) {
        var locale     = self.locales[i];
        var localeBase = path.resolve( self.base, self.output, locale );

        for (var namespace in translationsHash) {

            // get previous version of the files
            var prefix = self.prefix.replace( '$LOCALE', locale );
            var suffix = self.suffix.replace( '$LOCALE', locale );
            var extension = self.extension.replace( '$LOCALE', locale );

            var namespacePath = path.resolve(
                localeBase,
                prefix + namespace + suffix + extension
            );
            var namespaceOldPath = path.resolve(
                localeBase,
                prefix + namespace + suffix + '_old' + extension
            );

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
            mergedTranslations = helpers.mergeHash( currentTranslations, translationsHash[namespace], null, this.keepRemoved );

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
            this.emit( 'writing', namespacePath );
            self.push( mergedTranslationsFile );

            if ( self.writeOld ) {
                mergedOldTranslationsFile = new File({
                    path: namespaceOldPath,
                    base: base,
                    contents: new Buffer(JSON.stringify(mergedTranslations.old, null, 2))
                });
                this.emit( 'writing', namespaceOldPath );
                self.push( mergedOldTranslationsFile );
            }


        }
    }

    done();
};



module.exports = function(options, transformConfig) {
    return new Parser(options, transformConfig);
};
