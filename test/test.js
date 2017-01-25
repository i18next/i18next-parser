var fs                       = require('fs');
var path                     = require('path');
var assert                   = require('assert');
var File                     = require('vinyl');
var through                  = require('through2');
var Parser                   = require('../index');
var helpers                  = require('../src/helpers');
var hashFromString           = helpers.hashFromString;
var hashFromStringWithPaths  = helpers.hashFromStringWithPaths;
var mergeHash                = helpers.mergeHash;
var replaceEmpty             = helpers.replaceEmpty;

var emptyTranslationWithPaths = function (options) {
	var msgstr = '';
	var paths = [''];

	if (typeof options != 'undefined') {
		if (options.hasOwnProperty('msgstr')) {
			msgstr = options.msgstr;
		}
		if (options.hasOwnProperty('paths')) {
			paths = options.paths;
		}
	}

  return JSON.parse(JSON.stringify({
    'msgstr': msgstr,
    'paths': paths
  }));
};

describe('i18next-parser', function () {
    /* jshint evil:true */
    eval(fs.readFileSync(__dirname+'/parser/parser-with-paths.js')+'');
    eval(fs.readFileSync(__dirname+'/parser/parser-without-paths.js')+'');
    eval(fs.readFileSync(__dirname+'/helpers/hash-from-string.js')+'');
    eval(fs.readFileSync(__dirname+'/helpers/merge-hash-with-paths.js')+'');
    eval(fs.readFileSync(__dirname+'/helpers/merge-hash.js')+'');
    eval(fs.readFileSync(__dirname+'/helpers/replace-empty.js')+'');
});
