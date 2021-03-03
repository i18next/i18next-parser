import { assert } from 'chai'
import VueLexer from '../../src/lexers/vue-lexer'

describe('VueLexer', () => {
  it('extracts keys from template & js', (done) => {
    const Lexer = new VueLexer()
    const content =
      "<template><p>{{ $t('first') }}</p><template><script>export default " +
      "{ mounted() { this.$i18n.t('second'); } }</script>"
    assert.deepEqual(Lexer.extract(content), [
      { key: 'second' },
      { key: 'first' },
    ])
    done()
  })

  it('extracts keys with interpolation from template & js', (done) => {
    const Lexer = new VueLexer()
    const content =
      "<template><p>{{ $t('first {test}', {test: 'station'}) }}</p><template>" +
      "<script>export default { mounted() { this.$i18n.t('second {test}', " +
      "{test: 'interpol'}); } }</script>"
    assert.deepEqual(Lexer.extract(content), [
      {
        key: 'second {test}',
        test: 'interpol',
      },
      {
        key: 'first {test}',
        test: 'station',
      },
    ])
    done()
  })

  it('extracts keys with plural from template & js', (done) => {
    const Lexer = new VueLexer()
    const content =
      "<template><p>{{ $t('first', {count: 5}) }}</p><template><script>export default " +
      "{ mounted() { this.$i18n.t('second', {count: 2}); } }</script>"
    assert.deepEqual(Lexer.extract(content), [
      {
        key: 'second',
        count: '2',
      },
      {
        key: 'first',
        count: '5',
      },
    ])
    done()
  })

  it('extracts custom options', (done) => {
    const Lexer = new VueLexer()
    const content =
      "<template><p>{{ $t('first', {description: 'test'}) }}</p><template><script>export default " +
      "{ mounted() { this.$i18n.t('second'); } }</script>"
    assert.deepEqual(Lexer.extract(content), [
      { key: 'second' },
      { key: 'first', description: 'test' },
    ])
    done()
  })

  it('Respect disable line comments', () => {
    const Lexer = new VueLexer()
    const content = `
      This unfortunately needs a first line
      // i18next-parser-disable-next-line
      i18n.t('First not parsed')
      i18n.t('First parsed')

      /* i18next-parser-disable-next-line */
      i18n.t('Second not parsed')
      i18n.t('Second parsed')

      /*
       * i18next-parser-disable-next-line
       */
      i18n.t('Third not parsed')
      i18n.t('Third parsed')
      `
    assert.deepEqual(Lexer.extract(content), [
      { key: 'First parsed' },
      { key: 'Second parsed' },
      { key: 'Third parsed' },
    ])
  })
})
