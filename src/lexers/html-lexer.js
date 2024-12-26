import BaseLexer from './base-lexer.js'
import JavascriptLexer from './javascript-lexer.js'
import * as cheerio from 'cheerio'

export default class HTMLLexer extends BaseLexer {
  constructor(options = {}) {
    super(options)

    this.attr = options.attr || 'data-i18n'
    this.optionAttr = options.optionAttr || 'data-i18n-options'
    this.vueBindAttr = options.vueBindAttr || false
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

    // support vue bind attribute
    if (this.vueBindAttr) {
      let keys = []
      const jsLexer = new JavascriptLexer({ functions: this.functions })
      // traverse all tags to filter bind attribute
      $('*').each((index, node) => {
        const attributes = node.attributes.filter(
          (item) => item.name.startsWith(':') || item.name.startsWith('v-bind:')
        )
        if (attributes.length > 0) {
          // there are calculation attributes.
          attributes.forEach((content) => {
            const items = jsLexer.extract(content.value)
            keys.push(...items)
          })
        }
      })
      this.keys.push(...keys)
    }

    return this.keys
  }
}
