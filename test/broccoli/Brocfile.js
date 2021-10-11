const path = require('path')
const Funnel = require('broccoli-funnel')
// In a real use case, it should be:
// const i18next = require('i18next-parser').broccoli
const i18nextParser = require('../../src/index').broccoli

const appRoot = path.resolve(__dirname, 'src')

const filesToParse = new Funnel(appRoot, {
  files: ['handlebars.hbs', 'javascript.js'],
  annotation: 'files for i18next-parser',
})

const i18n = new i18nextParser([filesToParse], {
  output: path.resolve(__dirname, 'src/locales/$LOCALE/$NAMESPACE.json'),
  sort: true,
  silent: true,
})

module.exports = i18n
