const path = require('path')

module.exports = {
  input: ['**/*.html'],
  output: path.resolve(__dirname, 'locales/$LOCALE/$NAMESPACE.json'),
  sort: true,
}
