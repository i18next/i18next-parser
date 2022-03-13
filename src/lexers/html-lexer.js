import BaseLexer from './base-lexer.js'
import cheerio from 'cheerio'

export default class HTMLLexer extends BaseLexer {
  constructor(options = {}) {
    super(options)

    this.attr = options.attr || 'data-i18n'
    this.optionAttr = options.optionAttr || 'data-i18n-options'
  }

  extract(content) {
    const that = this
    const $ = cheerio.load(content)
    $(`[${that.attr}]`).each((index, node) => {
      const $node = cheerio.load(node)

      // the attribute can hold multiple keys
      const keys = node.attribs[that.attr].split(';')
      let options = node.attribs[that.optionAttr]

      if (options) {
        try {
          options = JSON.parse(options)
        } finally {
        }
      }

      for (let key of keys) {
        // remove any leading [] in the key
        key = key.replace(/^\[[a-zA-Z0-9_-]*\]/, '')

        // if empty grab innerHTML from regex
        key = key || $node.text()

        if (key) {
          this.keys.push({ ...options, key })
        }
      }
    })

    return this.keys
  }
}
