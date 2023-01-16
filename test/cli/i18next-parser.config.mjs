import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  input: ['**/*.html'],
  output: path.resolve(__dirname, 'locales/$LOCALE/$NAMESPACE.json'),
  sort: true,
}
