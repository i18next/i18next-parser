import * as acorn from 'acorn-jsx'
import assert from 'assert'
import HTMLLexer from './html-lexer'
import BaseLexer from './base-lexer'
import { ParsingError } from '../helpers'

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

  /**
  * Extract tags and content from the Trans component.
  * @param {string} string
  * @returns {array} Array of key options
  */
  extractTrans(content) {
    let matches
    const selfClosingTagPattern = '(?:<\\s*Trans([^>]*)?/>)'
    const closingTagPattern = '(?:<\\s*Trans([^>]*)?>((?:(?!</\\s*Trans\\s*>)[^])*)</\\s*Trans\\s*>)'
    const regex = new RegExp(
      [selfClosingTagPattern, closingTagPattern].join('|'),
      'gi'
    )

    while (matches = regex.exec(content)) {
      const attrs = this.parseAttributes(matches[1] || matches[2])
      const key = attrs.keys || matches[3]

      if (matches[3] && !attrs.options.defaultValue) {
        attrs.options.defaultValue = this.eraseTags(matches[0]).replace(/\s+/g, ' ')
      }

      if (key) {
        this.keys.push({ ...attrs.options, key })
      }
    }

    return this.keys
  }

  /**
   * Recursively convert html tags and js injections to tags with the child index in it
   * @param {string} string
   *
   * @returns string
   */
  eraseTags(string) {
    const acornAst = acorn.parse(string, {plugins: {jsx: true}})
    const acornTransAst = acornAst.body[0].expression
    const children = this.parseAcornPayload(acornTransAst.children, string)

    const elemsToString = children => children.map((child, index) => {
      switch(child.type) {
        case 'text': return child.content
        case 'js': return `<${index}>${child.content}</${index}>`
        case 'tag': return `<${index}>${elemsToString(child.children)}</${index}>`
        default: throw new ParsingError('Unknown parsed content: ' + child.type)
      }
    }).join('')

    return elemsToString(children)
  }

  /**
   * Simplify the bulky AST given by Acorn
   * @param {*} children An array of elements contained inside an html tag
   * @param {string} originalString The original string being parsed
   */
  parseAcornPayload(children, originalString) {
    return children.map(child => {
      if (child.type === 'JSXText') {
        return {
          type: 'text',
          content: child.value.replace(/^(?:\s*(\n|\r)\s*)?(.*)(?:\s*(\n|\r)\s*)?$/, '$2')
        }
      }
      else if (child.type === 'JSXElement') {
        return {
          type: 'tag',
          children: this.parseAcornPayload(child.children, originalString)
        }
      }
      else if (child.type === 'JSXExpressionContainer') {
        return {
          type: 'js',
          content: originalString.slice(child.start, child.end)
        }
      }
      else {
        throw new ParsingError('Unknown ast element when parsing jsx: ' + child.type)
      }
    }).filter(child => child.type !== 'text' || child.content)
  }
}
