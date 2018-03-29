import HTMLLexer from './html-lexer'

export default class JsxLexer extends HTMLLexer {
  constructor(options = {}) {
    options.attr = options.attr || 'i18nKey'
    super(options)
  }

  extract(content) {
    this.extractInterpolate(content)
    this.extractTrans(content)
    return this.keys
  }

  extractInterpolate(content) {
    let matches
    const regex = new RegExp(
      '<Interpolate([^>]*\\s' + this.attr + '[^>]*)\\/?>',
      'gi'
    )

    while (matches = regex.exec(content)) {
      const attrs = this.parseAttributes(matches[1])
      const key = attrs.keys
      if (key) {
        this.keys.push({ ...attrs.options, key })
      }
    }

    return this.keys
  }

  extractTrans(content) {
    let matches
    const closingTagPattern = '(?:<Trans([^>]*\\s' + this.attr + '[^>]*?)\\/>)'
    const selfClosingTagPattern = '(?:<Trans([^>]*\\s' + this.attr + '[^>]*?)>((?:\\s|.)*?)<\\/Trans>)'
    const regex = new RegExp(
      [closingTagPattern, selfClosingTagPattern].join('|'),
      'gi'
    )

    while (matches = regex.exec(content)) {
      const attrs = this.parseAttributes(matches[1] || matches[2])
      const key = attrs.keys

      if (matches[3] && !attrs.options.defaultValue) {
        attrs.options.defaultValue = matches[3].trim()
      }

      if (key) {
        this.keys.push({ ...attrs.options, key })
      }
    }

    return this.keys
  }
}
