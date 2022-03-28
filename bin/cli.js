#!/usr/bin/env node

import { pathToFileURL } from 'url'
import { promises as fsp } from 'fs'
import { program } from 'commander'
import colors from 'colors'
import path from 'path'
import sort from 'gulp-sort'
import vfs from 'vinyl-fs'

import i18nTransform from '../dist/transform.js'
;(async () => {
  const pkg = JSON.parse(
    await fsp.readFile(new URL('../package.json', import.meta.url), 'utf-8')
  )

  program
    .version(pkg.version)
    .option(
      '-c, --config <path>',
      'Path to the config file (default: i18next-parser.config.js)',
      'i18next-parser.config.js'
    )
    .option(
      '-o, --output <path>',
      'Path to the output directory (default: locales/$LOCALE/$NAMESPACE.json)'
    )
    .option('-s, --silent', 'Disable logging to stdout')
    .option('--fail-on-warnings', 'Exit with an exit code of 1 on warnings')
    .option(
      '--fail-on-update',
      'Exit with an exit code of 1 when translations are updated (for CI purpose)'
    )

  program.on('--help', function () {
    console.log('  Examples:')
    console.log('')
    console.log('    $ i18next "src/**/*.{js,jsx}"')
    console.log(
      '    $ i18next "/path/to/src/app.js" "/path/to/assets/index.html"'
    )
    console.log(
      '    $ i18next --config i18next-parser.config.js --output locales/$LOCALE/$NAMESPACE.json'
    )
    console.log('')
  })

  program.parse(process.argv)

  let config = {}
  try {
    config = (await import(pathToFileURL(path.resolve(program.opts().config))))
      .default
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.log(
        '  [error] '.red +
          'Config file does not exist: ' +
          program.opts().config
      )
    } else {
      throw err
    }
  }

  config.output =
    program.opts().output || config.output || 'locales/$LOCALE/$NAMESPACE.json'
  config.failOnWarnings =
    program.opts().failOnWarnings || config.failOnWarnings || false
  config.failOnUpdate =
    program.opts().failOnUpdate || config.failOnUpdate || false

  let args = program.args || []
  let globs

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
      } else {
        console.log(
          '  [error]   '.red +
            '`input` must be an array when specified in the config'
        )
        program.help()
        program.exit(1)
      }
    }

    globs = config.input.map(function (s) {
      var negate = ''
      if (s.startsWith('!')) {
        negate = '!'
        s = s.substr(1)
      }
      return (
        negate +
        path.resolve(path.dirname(path.resolve(program.opts().config)), s)
      )
    })
  }

  if (!globs || !globs.length) {
    console.log('  [error] '.red + 'missing argument: ')
    program.help()
    process.exit(0)
  }

  // Welcome message
  if (!program.opts().silent) {
    console.log()
    console.log('  i18next Parser'.cyan)
    console.log('  --------------'.cyan)
    console.log('  Input:  '.cyan + args.join(', '))
    console.log('  Output: '.cyan + config.output)
    console.log()
  }

  var count = 0

  vfs
    .src(globs)
    .pipe(sort())
    .pipe(
      new i18nTransform(config)
        .on('reading', function (file) {
          if (!program.opts().silent) {
            console.log('  [read]    '.green + file.path)
          }
          count++
        })
        .on('data', function (file) {
          if (!program.opts().silent) {
            console.log('  [write]   '.green + file.path)
          }
        })
        .on('error', function (message, region) {
          if (typeof region === 'string') {
            message += ': ' + region.trim()
          }
          console.log('  [error]   '.red + message)
        })
        .on('warning', function (message) {
          if (!program.opts().silent) {
            console.log('  [warning] '.yellow + message)
          }
        })
        .on('finish', function () {
          if (!program.opts().silent) {
            console.log()
            console.log('  Stats:  '.cyan + count + ' files were parsed')
          }
        })
    )
    .pipe(vfs.dest(process.cwd()))
})()
