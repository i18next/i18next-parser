# Migrating from `4.x` to `5.x`

## Breaking change

- The output format is now in [JSON v4](https://www.i18next.com/misc/json-format). To convert your existing translations to the new v4 format, have a look at [i18next-v4-format-converter](https://github.com/i18next/i18next-v4-format-converter) or [this web tool](https://i18next.github.io/i18next-v4-format-converter-web/).

---

# Migrating from `2.x` to `3.x`

## Breaking change

- `reactNamespace` option is gone. To use jsx in js file, [overwrite the lexer](https://github.com/i18next/i18next-parser#jsx).

---

# Migrating from `1.x` to `2.x`

## Breaking change

- Drop support for Node 6 and 8 (EOL)

---

# Migrating from `0.x` to `1.x`

## Breaking changes

- Jade is not being tested anymore. If this is something you need, please make a PR with a Lexer for it
- `regex` option was deprecated. If you need to support a custom file format, please make a PR with a Lexer for it
- `ignoreVariables` was deprecated. Keys that are not string litterals now emit a warning
- `writeOld` was renamed `createOldLibraries`. It defaults to `true`.
- `namespace` was renamed `defaultNamespace`. It defaults to `translation`.
- `prefix` was deprecated. Use `output`
- `suffix` was deprecated. Use `output`
- `filename` was deprecated. Use `output`
- `extension` was deprecated. Use `output`
- catalogs are no longer sorted by default. Set `sort` to `true` to enable this.

## Improvements

- `defaultValue`: replace empty keys with the given value
- `output` support for `$NAMESPACE` and `$LOCALE` variables
- `indentation` let you control the indentation of the catalogs
- `lineEnding` let you control the line ending of the catalogs
- `sort` let you enable sorting.

## Lexers

Instead of writing a single regex to match all use cases or to run many regexes on all files, the new version introduce the concept of "Lexer". Each file format has its own Lexer. It adds some code but reduces complexity a lot and improves maintainability.

## CLI

- `i18next input:output` syntax was deprecated. Use the `--output` option
- `recursive` was deprecated. You can now pass a glob
- `directoryFilter` was deprecated. You can now pass a glob
- `fileFilter` was deprecated. You can now pass a glob

### `0.x`

`i18next src --recursive --fileFilter '*.hbs,*.js' --directoryFilter '!.git'`

### `1.x`

`i18next 'src/**/*.{js,hbs}' '!.git'`
