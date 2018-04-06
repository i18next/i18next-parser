import * as acorn from 'acorn-jsx';
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
   *
   * @param {string} string
   *
   * @returns string
   */
  eraseTags(string) {
    const children = this.simplify(acorn.parse(string, {plugins: {jsx: true}}).body[0].expression.children, string);

    const elemsToString = children => children.map((child, index) => {
      switch(child.type) {
        case 'text': return child.content;
        case 'js': return `<${index}>${child.content}</${index}>`;
        case 'tag': return `<${index}>${elemsToString(child.children)}</${index}>`;
        default: throw new ParsingError('Unknown parsed content: ' + child.type);
      }
    }).join('');

    return elemsToString(children);
  }

  /**
   * Simplify the bulky AST given by Acorn
   * @param {*} children An array of elements contained inside an html tag
   * @param {string} originalString The original string being parsed
   */
  simplify(children, originalString) {
    for (let i = 0; i < children.length; i ++) {
      const child = children[i];
      switch (child.type) {
        case 'JSXText': children[i] = {
          type: 'text',
          content: child.value.replace(/^(?:\s*(\n|\r)\s*)?(.*)(?:\s*(\n|\r)\s*)?$/, '$2')
        }; break
        case 'JSXElement': children[i] = {
          type: 'tag',
          children: this.simplify(child.children, originalString)
        }; break;
        case 'JSXExpressionContainer': children[i] = {
          type: 'js',
          content: originalString.slice(child.start, child.end)
        }; break;
        default: throw new ParsingError("Unknown ast element when parsing jsx: " + child.type)
      }
    }

    // Filter empty text elements. Using string.length instead of !string because
    // '0' is a valid text element, and '' is not, and !string doesn't make a difference
    // between the two.
    children = children.filter(child => !(child.type === 'text' && child.content.length === 0));

    return children;
  }
}
