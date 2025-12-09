/*
 * @Author: Bin
 * @Date: 2025-01-04
 * @FilePath: /i18next-parser/test/lexers/vue-template-lexer.test.js
 */
import { assert } from 'chai'
import VueTemplateLexer from '../../src/lexers/vue-template-lexer.js'

describe('VueTemplateLexer', () => {
  it('supports vue bind attributes', (done) => {
    const Lexer = new VueTemplateLexer({
      functions: ['t', '$t'],
      vueBindAttr: true,
    })
    const content = `
    <template>
      <button :aria-label="t('b_a_l', 'button aria label')">
        button label
      </button>
      <button v-bind:aria-label="$t('button v-bind aria label')">
        button label form v-bind
      </button>
    </template>
    `
    assert.deepEqual(Lexer.extract(content), [
      { key: 'b_a_l', defaultValue: 'button aria label' },
      { key: 'button v-bind aria label' },
    ])
    done()
  })
})
