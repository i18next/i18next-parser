var fs              = require('fs');
var path            = require('path');
var assert          = require('assert');
var File            = require('vinyl');
var through         = require('through2');
var Parser          = require('../index');
var helpers         = require('../src/helpers');
var hashFromString  = helpers.hashFromString;
var mergeHash       = helpers.mergeHash;
var replaceEmpty    = helpers.replaceEmpty;


describe('i18next-parser', function () {
    /* jshint evil:true */
    eval(fs.readFileSync(__dirname+'/parser.js')+'');
    eval(fs.readFileSync(__dirname+'/helpers.js')+'');
});
