import path from 'path'
import { fileURLToPath } from 'url'
import Funnel from 'broccoli-funnel'
// In a real use case, it should be:
// import i18next from 'i18next-parser').broccol
import { broccoli as i18nextParser } from '../../src/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
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

export default i18n
