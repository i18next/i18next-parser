#!/usr/bin/env node

var colors        = require('colors')
var fs            = require('fs')
var i18nTransform = require('../dist/transform')
var path          = require('path')
var pkg           = require('../package.json')
var program       = require('commander')
var sort          = require('gulp-sort')
var vfs           = require('vinyl-fs')

program
.version(pkg.version)
.option('-c, --config <path>', 'Path to the config file (default: i18next-scanner.config.js)')
.option('-o, --output <path>', 'Path to the output directory (default: locales)')
.option('-s, --silent', 'Disable logging to stdout')

program.on('--help', function() {
  console.log('  Examples:')
  console.log('')
  console.log('    $ i18next "src/**/*.{js,jsx}"')
  console.log('    $ i18next "/path/to/src/app.js" "/path/to/assets/index.html"')
  console.log('    $ i18next --config i18next-parser.config.js --output /path/to/output \'src/**/*.{js,jsx}\'')
  console.log('')
})

program.parse(process.argv)

var args = program.args || []

var globs = args.map(function (s) {
  s = s.trim()
  if (s.match(/(^'.*'$|^".*"$)/)) {
    s = s.slice(1, -1)
  }
  return s
})

var config = {}
if (program.config) {
  try {
    config = require(path.resolve(program.config))
  } catch (err) {
    console.log('  [error] '.red + 'Config file does not exist: ' + program.config)
    return
  }
}

var output = config.output || program.output

if (!output) {
  console.log('  [error] '.red + 'an `output` is required via --config or --output option')
  program.help()
  program.exit(1)
}

if (!globs.length) {
  console.log('  [error] '.red + 'missing argument: ')
  program.help()
  return
}

// Welcome message
console.log()
console.log('  i18next Parser'.yellow)
console.log('  --------------'.yellow)
console.log('  Input:  '.yellow + args.join(', '))
console.log('  Output: '.yellow + output)
if (!program.silent) {
  console.log()
}


var count = 0

vfs.src(globs)
.pipe(sort())
.pipe(
  new i18nTransform(config)
  .on('reading', function (file) {
    if (!program.silent) {
      console.log('  [read]  '.green + file.path)
    }
    count++
  })
  .on('data', function (file) {
    if (!program.silent) {
      console.log('  [write] '.green + file.path)
    }
  })
  .on('error', function (message, region) {
    if (typeof region === 'string') {
      message += ': ' + region.trim()
    }
    console.log('  [error] '.red + message)
  })
  .on('finish', function () {
    if (!program.silent) {
      console.log()
    }
    console.log('  Stats:  '.yellow + count + ' files were parsed')
  })
)
.pipe(vfs.dest(process.cwd()))
