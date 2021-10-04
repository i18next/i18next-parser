const Funnel = require('broccoli-funnel')
const i18nextParser = require('../../dist/index').broccoli

const appRoot = 'src'

let i18n = new Funnel(appRoot, {
  files: ['handlebars.hbs', 'javascript.js'],
  annotation: 'i18next-parser',
})

i18n = new i18nextParser([i18n], {
  output: 'src/locales/$LOCALE/$NAMESPACE.json',
  sort: true,
})

module.exports = i18n
