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
    const regex = new RegExp(
      '<Trans([^>]*\\s' + this.attr + '[^>]*)>(?:((?:\\s|.)*?)<\\/Trans>)?',
      'gi'
    )

    while (matches = regex.exec(content)) {
      const attrs = this.parseAttributes(matches[1])
      const key = attrs.keys

      if (matches[2] && !attrs.options.defaultValue) {
        attrs.options.defaultValue = matches[2].trim()
      }

      if (key) {
        this.keys.push({ ...attrs.options, key })
      }
    }

    return this.keys
  }
}
