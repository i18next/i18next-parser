import * as walk from 'acorn/dist/walk'
import assert from 'assert'
import { ParsingError } from '../helpers'

export const JSXParserExtension = Object.assign({}, walk.base, {
  JSXText(node, st, c) {
    // We need this catch, but we don't need the catch to do anything.
  },
  JSXElement(node, st, c) {
      node.openingElement.attributes.forEach((attr) => {
          c(attr, st, attr.type);
      });
      node.children.forEach((child) => {
          c(child, st, child.type);
      });
  },
  JSXExpressionContainer(node, st, c) {
      c(node.expression, st, node.expression.type);
  },
  JSXAttribute(node, st, c) {
      if (node.value !== null) {
          c(node.value, st, node.value.type);
      }
  },
  JSXSpreadAttribute(node, st, c) {
      c(node.argument, st, node.argument.type);
  }
});

export function nodeToString(ast, string) {
  const children = parseAcornPayload(ast.children, string)

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

function parseAcornPayload(children, originalString) {
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
        children: parseAcornPayload(child.children, originalString)
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