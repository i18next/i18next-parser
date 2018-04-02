import assert from 'assert'
import HTMLLexer from './html-lexer'
import BaseLexer from './base-lexer';
import { ParsingError } from '../helpers';

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
        attrs.options.defaultValue = this.eraseTags(matches[3]).replace(/\\s+/g, ' ')
      }

      if (key) {
        this.keys.push({ ...attrs.options, key })
      }
    }

    return this.keys
  }

  /**
   * Recursively convert html tags and js injections to tags with the child index in it
   *
   * @param {string} string
   *
   * @returns string
   */
  eraseTags(string) {
    return this.parseJsx(string).map((child, index) => {
      switch(child.type) {
        case 'text': return child.content;
        case 'js': return `<${index}>{${child.content}}</${index}>`;
        case 'tag': return `<${index}>${this.eraseTags(child.content)}</${index}>`;
        default: throw new ParsingError('Unknown parsed content: ' + child.type);
      }
    }).join('')
  }

  /**
   * Convert jsx into an array of children
   * @param {*} string
   */
  parseJsx(string) {
    if (string.length === 0) {
      return []
    }
    if (/^<[A-Z]/i.test(string)) {
      const tag  = this.parseTag(string)
      return [{...tag, type: 'tag'}, ...this.parseJsx(string.slice(tag.length))]
    }
    if (string[0] === '{') {
      const js = this.parseJsInHtml(string)
      return [{...js, type: 'js'}, ...this.parseJsx(string.slice(js.length))]
    }
    const nextJs = string.indexOf('{') === -1 ? Number.POSITIVE_INFINITY : string.indexOf('{')
    const nextTag = /<[A-Z]/i.test(string) ? /<[A-Z]/i.exec(string).index : Number.POSITIVE_INFINITY
    const textEnd = Math.min(nextJs, nextTag, string.length)
    // We trim the text content, only if there's a newline inside it
    const textContent = string.slice(0, textEnd).replace(/^(?:\s*(\n|\r)\s*)?(.*)(?:\s*(\n|\r)\s*)?$/, '$2');

    if (textContent.length === 0) {
      return this.parseJsx(string.slice(textEnd));
    } else {
      return [{content: textContent, length: textEnd, type: 'text'}, ...this.parseJsx(string.slice(textEnd))];
    }
  }

  /**
   *
   * @param {string} string A string beginning with an HTML tag
   * @returns {closingTag: boolean, tag: string, length: number, content: string}
   */
  parseTag(string) {
    // this.eraseTags checks this first, so should be ok
    assert(/^<[A-Z]/i.test(string), "The string must begin with an html tag")

    const tag = /[A-Z0-9-]+/i.exec(string)[0].toLowerCase()

    let currentIndex = tag.length+1

    while (currentIndex < string.length) {
      // Check end of self-closing tag's opening tag
      if (string[currentIndex] === ">") {
        let openTag = string.slice(0, currentIndex+1)
        let closeTagMatch = (new RegExp('</' + tag + '>', 'i')).exec(string.slice(openTag.length))

        if (!closeTagMatch) {
          throw new ParsingError("No matching closing tag for " + tag)
        }
        let closeTag = closeTagMatch[0]
        let content = string.slice(openTag.length, closeTagMatch.index+openTag.length)

        return {
          tag,
          content,
          closingTag: false,
          length: closeTagMatch.index + closeTag.length + openTag.length
        }
      }

      // Check end of closing tag
      if (string.slice(currentIndex, currentIndex+2) == "/>") {
        return {
          tag,
          content: '',
          closingTag: true,
          length: currentIndex+2
        }
      }

      const char = string[currentIndex]
      if (char == "'" || char == '"' || char == '`') {
        currentIndex += this.parseQuote(string.slice(currentIndex)).length
        continue
      }

      if (char == '{') {
        // This is a JS insertion in the JSX, with braces and parenthesis
        currentIndex += this.parseJsInHtml(string.slice(currentIndex)).length
        continue
      }

      currentIndex++
    }

    // Premature end
    throw new ParsingError(`The html tag ${tag} is not closed`)
  }

  parseJsInHtml(string) {
    assert(string.length > 0 && string[0] === '{', 'A js expression mixed in html must begin with {')

    const stack = ['}']
    let currentIndex = 1

    while (currentIndex < string.length) {
      switch (string[currentIndex]) {
        case '{': stack.unshift('}'); break
        case '(': stack.unshift(')'); break
        case '"':
        case "'":
        case "`": currentIndex += this.parseQuote(string.slice(currentIndex)).length; continue
        case '}':
        case ')': {
          if (stack[0] != string[currentIndex]) {
            throw new ParsingError(`Expected ${stack[0]}, got ${string[currentIndex]}`)
          }
          stack.shift()

          if (stack.length === 0) {
            return {length: currentIndex + 1, content: string.slice(1, currentIndex)}
          }
        }
        default: break
      }

      currentIndex++
    }

    throw new ParsingError('Unexpected end of js input')
  }

  parseQuote(string) {
    assert(string.length > 0 && (string[0] === '"' || string[0] === "'" || string[0] === '`'), "The string must begin with a quote")
    const char = string[0]

    // This is a quote, we go to the end quote
    const regex = new RegExp('^(?:' +
    [
      BaseLexer.singleQuotePattern,
      BaseLexer.doubleQuotePattern,
      BaseLexer.backQuotePattern
    ].join('|') +
    ')')

    const quoteStringMatch = regex.exec(string)

    if (!quoteStringMatch) {
      throw new ParsingError(`No end quote, closing ${char} expected`)
    }

    return {length: quoteStringMatch[0].length, content: quoteStringMatch.slice(1, quoteStringMatch[0].length - 1)}
  }
}
