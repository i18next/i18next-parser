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
    self = this

    this.defaultNamespace = options.namespace || 'translation';
    this.functions = options.functions || ['t'];
    this.locales = options.locales || ['en','fr'];
    this.output = options.output || 'locales';
    this.regex = options.parser;
    this.translations = [];

    ['functions', 'locales'].forEach(function( attr ) {
        if ( (typeof self[ attr ] !== 'object') || ! self[ attr ].length ) {
            throw new PluginError(PLUGIN_NAME, '`'+attr+'` must be an array');
        }
    });

    transformConfig = transformConfig || {};
    transformConfig.objectMode = true;
    Transform.call(this, transformConfig);
}
util.inherits(Parser, Transform);

Parser.prototype._transform = function(file, encoding, done) {

    if (file.isStream()) {
        this.emit( 'error', new PluginError( PLUGIN_NAME, 'Streams not supported' ) );
        return done();
    }

    if(file.isNull()) {
        if ( file.path && fs.existsSync( file.path ) ) {
            data = fs.readFileSync( file.path );
        }
        else {
            this.emit( 'error', new PluginError( PLUGIN_NAME, 'File has no content and is not readable' ) );
            return done();
        }
    }

    if(file.isBuffer()) {
        // nothing to do
    }

    this.base = this.base || file.base;

    this.emit( 'parsing', file.path );

    fnPattern = this.functions.join( ')|(?:' ).replace( '.', '\\.' )
    fnPattern = '(?:' + fnPattern + ')'
    pattern = '[^a-zA-Z0-9](?:'+fnPattern+')(?:\\(|\\s)\\s*(?:(?:\'((?:(?:\\\\\')?[^\']+)+[^\\\\])\')|(?:"((?:(?:\\\\")?[^"]+)+[^\\\\])"))'
    regex = new RegExp( this.regex || pattern, 'g' )

    fileContent = data.toString()
    self = this

    while ( matches = regex.exec( fileContent ) ) {
        match = matches[1] || matches[2];
        
        if ( match.indexOf( ':' ) == -1 ) {
            match = self.defaultNamespace + '.' + match
        }
        else {
            match = match.replace( ':', '.' );
        }

        self.translations.push( match );
        
    }

    done();
};

Parser.prototype._flush = function(done) {

    var self = this;
    var translationsHash = {};

    self.translations = _.uniq( self.translations );

    for (var index in self.translations) {
        key = self.translations[index];
        translationsHash = helpers.hashFromString( key, translationsHash );
    }

    var base = path.resolve( self.base, self.output );

    for (var i in self.locales) {
        var locale = self.locales[i];

        var localeBase = path.resolve( self.base, self.output, locale );

        for (var namespace in translationsHash) {

            var namespacePath = path.resolve( localeBase, namespace + '.json' );
            var namespaceOldPath = path.resolve( localeBase, namespace + '_old.json' );

            if ( fs.existsSync( namespacePath ) ) {
                currentTranslations = JSON.parse( fs.readFileSync( namespacePath ) );
            }
            else {
                currentTranslations = {}
            }

            if ( fs.existsSync( namespaceOldPath ) ) {
                oldTranslations = JSON.parse( fs.readFileSync( namespaceOldPath ) );
            }
            else {
                oldTranslations = {}
            }

            mergedTranslations = helpers.mergeHash( currentTranslations, translationsHash[namespace] );
            mergedTranslations['old'] = _.extend( oldTranslations, mergedTranslations['old'] );

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

            self.push( mergedTranslationsFile );
            self.push( mergedOldTranslationsFile );
        }
    }

    done();
};

module.exports = function(options, transformConfig) {
    return new Parser(options, transformConfig);
};