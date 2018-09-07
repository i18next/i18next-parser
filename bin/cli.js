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
.option('-c, --config <path>', 'Path to the config file (default: i18next-parser.config.js)')
.option('-o, --output <path>', 'Path to the output directory (default: locales/$LOCALE/$NAMESPACE.json)')
.option('-s, --silent', 'Disable logging to stdout')

program.on('--help', function() {
  console.log('  Examples:')
  console.log('')
  console.log('    $ i18next "src/**/*.{js,jsx}"')
  console.log('    $ i18next "/path/to/src/app.js" "/path/to/assets/index.html"')
  console.log('    $ i18next --config i18next-parser.config.js --output locales/$LOCALE/$NAMESPACE.json')
  console.log('')
})

program.parse(process.argv)

var config = {}
if (program.config) {
  try {
    config = require(path.resolve(program.config))
  } catch (err) {
    console.log('  [error] '.red + 'Config file does not exist: ' + program.config)
    return
  }
}

config.output = config.output || program.output

var args = program.args || []
var globs

// prefer globs specified in the cli
if (args.length) {
  globs = args.map(function (s) {
    s = s.trim()
    if (s.match(/(^'.*'$|^".*"$)/)) {
      s = s.slice(1, -1)
    }
    return s
  })
}

// if config has an input parameter, try to use it
else if (config.input) {
  if (!Array.isArray(config.input)) {
    if (typeof config.input === 'string') {
      config.input = [config.input]
    }
    else {
      console.log('  [error] '.red + '`input` must be an array when specified in the config')
      program.help()
      program.exit(1)
    }
  }

  globs = config.input.map(function (s) {
    return path.resolve(path.dirname(path.resolve(program.config)), s)
  })
}

if (!config.output) {
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
console.log('  Output: '.yellow + config.output)
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
