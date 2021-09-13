import { dotPathToHash, mergeHashes, transferValues } from './helpers'
import { Transform } from 'stream'
import eol from 'eol'
import fs from 'fs'
import Parser from './parser'
import path from 'path'
import VirtualFile from 'vinyl'
import yaml from 'js-yaml'
import i18next from 'i18next'

function getPluralSuffix(numberOfPluralForms, nthForm) {
  if (numberOfPluralForms.length > 2) {
    return nthForm // key_0, key_1, etc.
  } else if (nthForm === 1) {
    return 'plural'
  }
  return ''
}

export default class i18nTransform extends Transform {
  constructor(options = {}) {
    options.objectMode = true
    super(options)

    this.defaults = {
      contextSeparator: '_',
      createOldCatalogs: true,
      defaultNamespace: 'translation',
      defaultValue: '',
      indentation: 2,
      keepRemoved: false,
      keySeparator: '.',
      lexers: {},
      lineEnding: 'auto',
      locales: ['en', 'fr'],
      namespaceSeparator: ':',
      pluralSeparator: '_',
      output: 'locales/$LOCALE/$NAMESPACE.json',
      sort: false,
      useKeysAsDefaultValue: false,
      verbose: false,
      skipDefaultValues: false,
      customValueTemplate: null,
      failOnWarnings: false,
    }

    this.options = { ...this.defaults, ...options }
    if (this.options.keySeparator === false) {
      this.options.keySeparator = '__!NO_KEY_SEPARATOR!__'
    }
    if (this.options.namespaceSeparator === false) {
      this.options.namespaceSeparator = '__!NO_NAMESPACE_SEPARATOR!__'
    }
    this.entries = []

    this.parserHadWarnings = false
    this.parser = new Parser(this.options)
    this.parser.on('error', (error) => this.error(error))
    this.parser.on('warning', (warning) => this.warn(warning))

    this.localeRegex = /\$LOCALE/g
    this.namespaceRegex = /\$NAMESPACE/g

    i18next.init()
  }

  error(error) {
    this.emit('error', error)
    if (this.options.verbose) {
      console.error('\x1b[31m%s\x1b[0m', error)
    }
  }

  warn(warning) {
    this.emit('warning', warning)
    this.parserHadWarnings = true
    if (this.options.verbose) {
      console.warn('\x1b[33m%s\x1b[0m', warning)
    }
  }

  _transform(file, encoding, done) {
    let content
    if (file.isBuffer()) {
      content = file.contents.toString('utf8')
    } else if (fs.lstatSync(file.path).isDirectory()) {
      const warning = `${file.path} is a directory: skipping`
      this.warn(warning)
      done()
      return
    } else {
      content = fs.readFileSync(file.path, encoding)
    }

    this.emit('reading', file)
    if (this.options.verbose) {
      console.log(`Parsing ${file.path}`)
    }

    const filename = path.basename(file.path)
    const entries = this.parser.parse(content, filename)

    for (const entry of entries) {
      let key = entry.key
      const parts = key.split(this.options.namespaceSeparator)

      // make sure we're not pulling a 'namespace' out of a default value
      if (parts.length > 1 && key !== entry.defaultValue) {
        entry.namespace = parts.shift()
      }
      entry.namespace = entry.namespace || this.options.defaultNamespace

      key = parts.join(this.options.namespaceSeparator)
      key = key.replace(/\\('|"|`)/g, '$1')
      key = key.replace(/\\n/g, '\n')
      key = key.replace(/\\r/g, '\r')
      key = key.replace(/\\t/g, '\t')
      key = key.replace(/\\\\/g, '\\')
      entry.key = key
      entry.keyWithNamespace = entry.namespace + this.options.keySeparator + key

      this.addEntry(entry)
    }

    done()
  }

  _flush(done) {
    if (this.options.sort) {
      this.entries = this.entries.sort((a, b) => a.key.localeCompare(b.key))
    }

    for (const locale of this.options.locales) {
      const catalog = {}
      const pluralRule = i18next.services.pluralResolver.getRule(locale)
      const numbers = (pluralRule && pluralRule.numbers) || [1, 2]

      let countWithPlurals = 0
      let uniqueCount = this.entries.length

      const transformEntry = (entry, suffix) => {
        const { duplicate, conflict } = dotPathToHash(entry, catalog, {
          suffix,
          locale,
          separator: this.options.keySeparator,
          pluralSeparator: this.options.pluralSeparator,
          value: this.options.defaultValue,
          useKeysAsDefaultValue: this.options.useKeysAsDefaultValue,
          skipDefaultValues: this.options.skipDefaultValues,
          customValueTemplate: this.options.customValueTemplate,
        })

        if (duplicate) {
          uniqueCount -= 1
          if (conflict === 'key') {
            const warning = `Found translation key already mapped to a map or parent of new key already mapped to a string: ${entry.key}`
            this.warn(warning)
          } else if (conflict === 'value') {
            const warning = `Found same keys with different values: ${entry.key}`
            this.warn(warning)
          }
        } else {
          countWithPlurals += 1
        }
      }

      // generates plurals according to i18next rules: key, key_plural, key_0, key_1, etc.
      for (const entry of this.entries) {
        if (entry.count !== undefined) {
          numbers.forEach((_, i) => {
            transformEntry(entry, getPluralSuffix(numbers, i))
          })
        } else {
          transformEntry(entry)
        }
      }

      const outputPath = path.resolve(this.options.output)

      for (const namespace in catalog) {
        let namespacePath = outputPath
        namespacePath = namespacePath.replace(this.localeRegex, locale)
        namespacePath = namespacePath.replace(this.namespaceRegex, namespace)

        let parsedNamespacePath = path.parse(namespacePath)

        const namespaceOldPath = path.join(
          parsedNamespacePath.dir,
          `${parsedNamespacePath.name}_old${parsedNamespacePath.ext}`
        )

        let existingCatalog = this.getCatalog(namespacePath)
        let existingOldCatalog = this.getCatalog(namespaceOldPath)

        // merges existing translations with the new ones
        const {
          new: newCatalog,
          old: oldKeys,
          mergeCount,
          oldCount,
        } = mergeHashes(
          existingCatalog,
          catalog[namespace],
          this.options.keepRemoved
        )

        // restore old translations
        const { old: oldCatalog, mergeCount: restoreCount } = mergeHashes(
          existingOldCatalog,
          newCatalog
        )

        // backup unused translations
        transferValues(oldKeys, oldCatalog)

        if (this.options.verbose) {
          console.log(`[${locale}] ${namespace}\n`)
          console.log(
            `Unique keys: ${uniqueCount} (${countWithPlurals} with plurals)`
          )
          const addCount = countWithPlurals - mergeCount
          console.log(`Added keys: ${addCount}`)
          console.log(`Restored keys: ${restoreCount}`)
          if (this.options.keepRemoved) {
            console.log(`Unreferenced keys: ${oldCount}`)
          } else {
            console.log(`Removed keys: ${oldCount}`)
          }
          console.log()
        }

        if (this.options.failOnWarnings && this.parserHadWarnings) {
          continue
        }

        // push files back to the stream
        this.pushFile(namespacePath, newCatalog)
        if (
          this.options.createOldCatalogs &&
          (Object.keys(oldCatalog).length || existingOldCatalog)
        ) {
          this.pushFile(namespaceOldPath, oldCatalog)
        }
      }
    }

    if (this.options.failOnWarnings && this.parserHadWarnings) {
      this.emit(
        'error',
        'Warnings were triggered and failOnWarnings option is enabled. Exiting...'
      )
      process.exit(1)
    }

    done()
  }

  addEntry(entry) {
    if (entry.context) {
      const contextEntry = Object.assign({}, entry)
      delete contextEntry.context
      contextEntry.key += this.options.contextSeparator + entry.context
      contextEntry.keyWithNamespace +=
        this.options.contextSeparator + entry.context
      this.entries.push(contextEntry)
    } else {
      this.entries.push(entry)
    }
  }

  getCatalog(path) {
    try {
      let content
      if (path.endsWith('yml')) {
        content = yaml.load(fs.readFileSync(path).toString())
      } else {
        content = JSON.parse(fs.readFileSync(path))
      }
      return content
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.emit('error', error)
      }
    }

    return null
  }

  pushFile(path, contents) {
    let text
    if (path.endsWith('yml')) {
      text = yaml.dump(contents, {
        indent: this.options.indentation,
      })
    } else {
      text = JSON.stringify(contents, null, this.options.indentation) + '\n'
      // Convert non-printable Unicode characters to unicode escape sequence
      // https://unicode.org/reports/tr18/#General_Category_Property
      text = text.replace(/[\p{Z}\p{Cc}\p{Cf}]/gu, (chr) => {
        const n = chr.charCodeAt(0)
        return n < 128 ? chr : `\\u${`0000${n.toString(16)}`.substr(-4)}`
      })
    }

    if (this.options.lineEnding === 'auto') {
      text = eol.auto(text)
    } else if (
      this.options.lineEnding === '\r\n' ||
      this.options.lineEnding === 'crlf'
    ) {
      text = eol.crlf(text)
    } else if (
      this.options.lineEnding === '\r' ||
      this.options.lineEnding === 'cr'
    ) {
      text = eol.cr(text)
    } else {
      // Defaults to LF, aka \n
      text = eol.lf(text)
    }

    const file = new VirtualFile({
      path,
      contents: Buffer.from(text),
    })
    this.push(file)
  }
}
