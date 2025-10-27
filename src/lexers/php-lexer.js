import BaseLexer from './base-lexer.js'

export default class PhpLexer extends BaseLexer {
  constructor(options = {}) {
    super(options)
    this.functions = options.functions || ['t']
  }

  extract(content, filename) {
    const keys = []

    // Regular expression to capture translation function calls in PHP files
    const functionPattern = new RegExp(
      // Optionally match the @ at the beginning of the function
      `(?:@)?` +
        // Capture the name of the translation function, such as '__', 'trans', 'trans_choice'
        `(${this.functions.join('|')})` + // matches[1] → function name
        // Open a parenthesis and capture the whitespace before the argument
        `\\(\\s*` +
        // Capture the argument in single or double quotes, escaping supported (e.g., \' or \")
        `(?:` +
        `'((?:\\\\'|[^'])*)'` + // matches[2] → content between single quotes
        `|` +
        `"((?:\\\\"|[^"])*)"` + // matches[3] → content between double quotes
        `)` +
        // Ensure there is no concatenation after the function (no '+' or '.')
        `(?!\\s*\\.)`,
      'g'
    )

    // Iterate over the matches and extract the keys
    let matches
    while ((matches = functionPattern.exec(content)) !== null) {
      // Get the key from the match
      let key = matches[2] || matches[3]

      // If the key is not found, continue to the next match
      if (!key) continue

      // Remove the escaping from the key
      key = key.replace(/\\'/g, "'").replace(/\\"/g, '"')

      // Push the key into the keys array
      keys.push({ key })
    }

    // Return the keys found in the content
    return keys
  }
}
