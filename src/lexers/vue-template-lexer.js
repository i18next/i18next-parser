/*
 * @Author: Bin
 * @Date: 2025-01-04
 * @FilePath: /i18next-parser/src/lexers/vue-template-lexer.js
 */
import HTMLLexer from './html-lexer.js'
import JavascriptLexer from './javascript-lexer.js'
import * as cheerio from 'cheerio'

export default class VueTemplateLexer extends HTMLLexer {
  constructor(options = {}) {
    super(options)
    this.vueBindAttr = options.vueBindAttr || true
    this.jsLexer = new JavascriptLexer(options)
  }

  extract(content, filename = '__default.vue') {
    const $ = cheerio.load(content)
    const jsLexer = this.jsLexer
    let keys = []

    // use HTMLLexer
    const HTMLkeys = super.extract(content)
    keys.push(...HTMLkeys)

    // use JavascriptLexer
    const JSKeys = jsLexer.extract(content, filename)
    keys.push(...JSKeys)

    // support vue bind attribute
    if (this.vueBindAttr) {
      // traverse all tags to filter bind attribute
      $('*').each((_, node) => {
        const attributes = node.attributes.filter(
          (item) => item.name.startsWith(':') || item.name.startsWith('v-bind:')
        )
        if (attributes.length > 0) {
          // there are calculation attributes.
          attributes.forEach((content) => {
            const items = jsLexer.extract(content.value, filename)
            keys.push(...items)
          })
        }
      })
    }

    return keys
  }
}
