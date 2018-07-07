import { dotPathToHash, mergeHashes, transferValues } from './helpers'
import { Transform } from 'stream'
import eol from 'eol'
import fs from 'fs'
import Parser from './parser'
import path from 'path'
import VirtualFile from 'vinyl'
import YAML from 'yamljs'
import BaseLexer from './lexers/base-lexer';

export default class i18nTransform extends Transform {
  constructor(options = {}) {
    options.objectMode = true
    super(options)

    this.defaults = {
      contextSeparator: '_',
      createOldCatalogs: true,
      defaultNamespace: 'translation',
      defaultValue: '',
      extension: '.json',
      filename: '$NAMESPACE',
      indentation: 2,
      keepRemoved: false,
      keySeparator: '.',
      lexers: {},
      lineEnding: 'auto',
      locales: ['en', 'fr'],
      namespaceSeparator: ':',
      output: 'locales',
      reactNamespace: false,
      sort: false
    }

    this.options = { ...this.defaults, ...options }
    if (this.options.keySeparator === false) {
      this.options.keySeparator = '__!NO_KEY_SEPARATOR!__'
    }
    if (this.options.namespaceSeparator === false) {
      this.options.namespaceSeparator = '__!NO_NAMESPACE_SEPARATOR!__'
    }
    this.entries = []

    this.parser = new Parser(this.options)
    this.parser.on('error', error => this.emit('error', error))
    this.parser.on('warning', warning => this.emit('warning', warning))

    this.localeRegex = /\$LOCALE/g
    this.namespaceRegex = /\$NAMESPACE/g
  }

  _transform(file, encoding, done) {
    let content
    if (file.isBuffer()) {
      content = file.contents.toString('utf8')
    }
    else {
      content = fs.readFileSync(file.path, encoding)
    }

    this.emit('reading', file)

    const extension = path.extname(file.path).substring(1)
    const entries = this.parser.parse(content, extension)

    entries.forEach(entry => {
      let key = entry.key
      const parts = key.split(this.options.namespaceSeparator)

      // make sure we're not pulling a 'namespace' out of a default value
      if (parts.length > 1 && key !== entry.defaultValue) {
        entry.namespace = parts.shift()
      }
      else if (extension === 'jsx' || this.options.reactNamespace) {
        entry.namespace = this.grabReactNamespace(content)
      }
      entry.namespace = entry.namespace || this.options.defaultNamespace

      key = parts.join(this.options.namespaceSeparator)
      key = key.replace(/\\('|"|`)/g, '$1')
      key = key.replace(/\\n/g, '\n')
      key = key.replace(/\\r/g, '\r')
      key = key.replace(/\\t/g, '\t')
      key = key.replace(/\\\\/g, '\\')
      entry.key = entry.namespace + this.options.keySeparator + key

      this.addEntry(entry)
    })

    done()
  }

  _flush(done) {
    let catalog = {}

    if (this.options.sort) {
      this.entries = this.entries.sort((a, b) => a.key.localeCompare(b.key))
    }

    this.entries.forEach(entry => {
      catalog = dotPathToHash(
        entry,
        catalog,
        {
          separator: this.options.keySeparator,
          value: this.options.defaultValue
        }
      )
    })

    this.options.locales.forEach(locale => {
      const outputPath = path.resolve(this.options.output, locale)

      Object.keys(catalog).forEach(namespace => {
        let filename = this.options.filename
        filename = filename.replace(this.localeRegex, locale)
        filename = filename.replace(this.namespaceRegex, namespace)

        let extension = this.options.extension
        extension = extension.replace(this.localeRegex, locale)
        extension = extension.replace(this.namespaceRegex, namespace)

        const oldFilename = filename + '_old' + extension
        filename += extension

        const namespacePath = path.resolve(outputPath, filename)
        const namespaceOldPath = path.resolve(outputPath, oldFilename)

        let existingCatalog = this.getCatalog(namespacePath)
        let oldCatalog = this.getCatalog(namespaceOldPath)

        // merges existing translations with the new ones
        const { new: newCatalog, old: oldKeys } = mergeHashes(
          existingCatalog,
          catalog[namespace],
          this.options.keepRemoved
        )

        // restore old translations if the key is empty
        mergeHashes(oldCatalog, newCatalog)

        // add keys from the current catalog that are no longer used
        transferValues(oldKeys, oldCatalog)

        // push files back to the stream
        this.pushFile(namespacePath, newCatalog)
        if (this.options.createOldCatalogs && Object.keys(oldCatalog).length) {
          this.pushFile(namespaceOldPath, oldCatalog)
        }
      })
    })

    done()
  }

  addEntry(entry) {
    let existing = this.entries.filter(x => x.key === entry.key)[0]
    if (!existing) {
      this.entries.push(entry)
    }
    else {
      existing = { ...existing, ...entry }
    }

    if (entry.context) {
      const contextEntry = Object.assign({}, entry)
      delete contextEntry.context
      contextEntry.key += this.options.contextSeparator + entry.context
      this.addEntry(contextEntry)
    }
  }

  getCatalog(path) {
    let content
    try {
      content = JSON.parse( fs.readFileSync( path ) )
    }
    catch (error) {
      if (error.code !== 'ENOENT') {
        this.emit('error', error)
      }
      content = {}
    }
    return content
  }

  pushFile(path, contents) {
    let text
    if (path.endsWith('yml')) {
      text = YAML.stringify(contents, null, this.options.indentation)
    }
    else {
      text = JSON.stringify(contents, null, this.options.indentation) + '\n'
    }

    if (this.options.lineEnding === 'auto') {
      text = eol.auto(text)
    }
    else if (this.options.lineEnding === '\r\n' || this.options.lineEnding === 'crlf') {
      text = eol.crlf(text)
    }
    else if (this.options.lineEnding === '\r' || this.options.lineEnding === 'cr') {
      text = eol.cr(text)
    }
    else {
      // Defaults to LF, aka \n
      text = eol.lf(text)
    }

    const file = new VirtualFile({
      path,
      contents: Buffer.from(text)
    })
    this.push(file)
  }

  grabReactNamespace(content) {
    const reactTranslateRegex = new RegExp(
      'translate\\((?:\\s*\\[?\\s*)(' + BaseLexer.stringPattern + ')'
    )
    const translateMatches = content.match(reactTranslateRegex)
    if (translateMatches) {
      return translateMatches[1].slice(1, -1)
    }
  }
}
