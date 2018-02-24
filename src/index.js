import {
  dotPathToHash,
  mergeHashes,
  populateHash
} from './helpers'
import { Transform } from 'stream'
import _ from 'lodash'
import eol from 'eol'
import fs from 'fs'
import Parser from './parser'
import path from 'path'
import VirtualFile from 'vinyl'
import YAML from 'yamljs'

export default class i18nTransform extends Transform {

  constructor(options = {}) {
    options.objectMode = true
    super(options)

    this.defaults = {
      contextSeparator: '_', // TODO
      createOldLibraries: true,
      defaultNamespace: 'translation',
      defaultValue: '',
      extension: '.json',
      filename: '$NAMESPACE',
      indentation: 2,
      keepRemoved: false,
      keySeparator: '.',
      lexers: {},
      lineEnding: 'auto',
      locales: ['en','fr'],
      namespaceSeparator: ':',
      output: 'locales',
      sort: false
    }

    this.options = {...this.defaults, ...options}
    this.entries = []

    this.parser = new Parser(this.options.lexers)
    this.parser.on('error', error => this.emit('error', error))
    this.parser.on('warning', warning => this.emit('warning', warning))

    this.localeRegex = /\$LOCALE/g
    this.namespaceRegex = /\$NAMESPACE/g
  }

  _transform(file, encoding, done) {
    let content
    if (file.isBuffer()) {
      content = file.contents
    }
    else {
      content = fs.readFileSync(file.path, encoding)
    }

    this.emit('reading', file)

    const extenstion = path.extname(file.path).substring(1)
    const entries = this.parser.parse(content, extenstion)

    entries.forEach(entry => {
      let key = entry.key
      const parts = key.split(this.options.namespaceSeparator)


      if (parts.length > 1) {
        entry.namespace = parts.shift()
      }
      else {
        entry.namespace = this.options.defaultNamespace
      }

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
        entry.key,
        this.options.keySeparator,
        entry.defaultValue || this.options.defaultValue,
        catalog
      )
    })

    this.options.locales.forEach(locale => {

      const outputPath = path.resolve(this.options.output, locale)

      Object.keys(catalog).forEach((namespace) => {
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

        let newCatalog
        let existingCatalog = this.getCatalog(namespacePath)
        let oldCatalog = this.getCatalog(namespaceOldPath)


        // merges existing translations with the new ones
        const {new: newKeys, old: oldKeys} = mergeHashes(
          existingCatalog,
          catalog[namespace],
          null,
          this.options.keepRemoved
        )

        // restore old translations if the key is empty
        newCatalog = populateHash(oldCatalog, newKeys)

        // add keys from the current catalog that are no longer used
        oldCatalog = _.extend(oldCatalog, oldKeys)

        // push files back to the stream
        this.pushFile(namespacePath, newCatalog)
        if ( this.options.createOldLibraries ) {
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
      existing = {...existing, ...entry}
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
    } else if (lineEnding === '\r\n' || lineEnding === 'crlf') {
      text = eol.crlf(text)
    } else if (lineEnding === '\r' || lineEnding === 'cr') {
      text = eol.cr(text)
    } else { // Defaults to LF, aka \n
      text = eol.lf(text)
    }

    const file = new VirtualFile({
      path,
      contents: Buffer.from(text)
    })
    this.push(file)
  }

}
