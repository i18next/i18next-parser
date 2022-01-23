import fse from 'fs-extra'
import Plugin from 'broccoli-plugin'
import rsvp from 'rsvp'
import sort from 'gulp-sort'
import vfs from 'vinyl-fs'

import i18nTransform from './transform.js'

const Promise = rsvp.Promise

export default class i18nextParser extends Plugin {
  constructor(inputNodes, options = {}) {
    super(...arguments)
    this.options = options
  }

  build() {
    const outputPath = this.outputPath
    return new Promise((resolve, reject) => {
      const files = []
      let count = 0

      vfs
        .src(this.inputPaths.map((x) => x + '/**/*.{js,hbs}'))
        .pipe(sort())
        .pipe(
          new i18nTransform(this.options)
            .on('reading', function (file) {
              if (!this.options.silent) {
                console.log('  [read]  '.green + file.path)
              }
              count++
            })
            .on('data', function (file) {
              files.push(fse.outputFile(file.path, file.contents))
              if (!this.options.silent) {
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
              if (!this.options.silent) {
                console.log()
                console.log('  Stats:  '.yellow + count + ' files were parsed')
              }

              Promise.all(files).then(() => {
                resolve(files)
              })
            })
        )
    })
  }
}
