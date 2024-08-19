# Changelog

# X.X.X

- Add skipIdenticals option #1036

# 9.0.2

- Fix cheerio dependency #1045
- Update dependencies

# 9.0.1

- Fix plurals not being detected when count is a CallExpression #1022 #1015
- Use utf-8 as default encoding to read files #992
- Update dependencies

# 9.0.0

- Custom contextSeparator fix #1008
- Remove VueLexer #1007 #617
- Fix t func in options #994 #779
- Support for Node 16 is dropped. Node 18, 20 and 22 are supported.

# 8.13.0

- Output the files in which a string is found in customValueTemplate #970
- Fix babel dependency #976 #975
- Update dependencies

# 8.12.0

- Fix --fail-on-update false negatives from new sort code #957 #955
- Update dependencies

# 8.11.0

- Fix a bug where keepRemoved wasn't failing when the catalog get sorted #926 #932

# 8.10.0

- Fix a bug where keepRemoved option makes the failOnUpdate fails without any update #948 #666
- Update dependencies

# 8.9.0

- Make tests work on Windows with non-English locale #931
- Update dependencies

# 8.8.0

- Handle attribute spreads #909 #908
- Fix index.d.ts #919
- Suppress warning about non-literal child when key/defaults are specified #900 #899
- Support custom namespaced functions and components #913 #912
- Update dependencies

# 8.7.0

- Add missing componentFunctions properties to JsxLexerConfig types #891 #842
- Fix unescape logic, expression props, and ICU format for Trans component #892 #886
- Update dependencies

# 8.6.0

- Emit warning on non-literal content inside of Trans #881
- Update dependencies

# 8.5.0

- Improve warnings #805
- Remove unused dependencies #877
- Update dependencies

# 8.4.0

- Fix extracting Trans component without key, but with default value #871 #249
- FIX type error in index.d.ts #873 #868
- Update dependencies

# 8.3.0

- Allow ignoring typecheck-helper functions around Trans tag variables #863
- Skip extracting dynamic children in Trans components #862
- Extract format parameter from Trans component interpolations #861
- Update dependencies

# 8.2.0

- Add support for patterns in the `keepRemoved` option #693 #700
- Improve namespace extraction from hook/HOC #854
- Update dependencies

# 8.1.0

- Allow to disable plural handling #825 #463
- Update dependencies

# 8.0.0

- Drop support for node 14
- Add support for node 20

# 7.9.0

- Add support for string concatenation in default values #817
- Update dependencies

# 7.8.0

- Add support for user-defined component functions #803 #804
- Update dependencies

# 7.7.0

- Added missing types property to package.json #774 #775
- Update dependencies

# 7.6.0

- Fix a bug: typeArguments may be undefined #764 #765
- Update dependencies

# 7.5.0

- Add type declaration to the build #694 #695

# 7.4.0

- Fix esm import in cjs project #761
- Update dependencies

# 7.3.0

- Parse namespace from t type arguments #703 #701
- Extract namespace for <Translation> render prop #702 #691
- Updae dependencies

# 7.2.0

- Allow for .mjs as a config file extension #733 #708
- Update dependencies

# 7.1.0

- Fix config loading on Windows #725 #698
- Update dependencies

# 7.0.3

- Fix a bug when using the cli and passing no config file #690
- Update dependencies

# 7.0.0

- BREAKING: change the API for `defaultValue`. Deprecate `skipDefaultValues` and `useKeysAsDefaultValues` options. #676
- Add support for `shouldUnescape` option in jsx-lexer #678
- Add support for .ts, .json and .yaml config #673
- Update dependencies

# 6.6.0

- Support custom yaml output options #626
- Do not fail on JSX spread attribute in Trans component #637
- Support TypeScript typecasts #604
- Add LICENSE.md
- Update dependencies

# 6.5.0

- Fix: coverage testing #586
- Fix: reset nested keys if default value is changed #582
- Update dependencies

# 6.4.0

- Fix a bug that was resetting a namespace when given an empty key #502

# 6.3.0

- Support keyPrefix of useTranslation hook #485 #486

# 6.2.0

- Fix stats of files added, removed and unique keys #546 #498 #489

# 6.1.0

- Add a `namespaceFunction` option to the Javascrip Lexer #512

# 6.0.1

- BREAKING: Drop support for Node 12

# 6.0.0

- BREAKING: Drop support for Node 13, 15. Add support for Node 18.
- BREAKING: This package is now pure ESM
- Update dependencies

# 5.4.0

- Set colors dependency to 1.4.0 #503

# 5.3.0

- Add i18nextOptions option to generate v3 plurals #462
- Update dependencies

# 5.2.0

- Add resetDefaultValueLocale option #451
- Update dependencies

# 5.1.0

- Typescript: Parse type details #457 #454
- Add fail-on-update option #471

# 5.0.0

- BREAKING: Format Json output conforming to i18next JSON v4 (see: https://www.i18next.com/misc/json-format) #423
- BREAKING: `sort` option as a function has changed signature #437
- Support sorting of plural keys in JSON v4 #437
- Support regex token character for `pluralSeparator` option #437

# 4.8.0

- Add template literal support for defaultValue as a second argument #419 #420
- Update dependencies

# 4.7.0

- CLI `silent` option is now fully silent #417
- `sort` option can now take a function #418

# 4.6.0

- Add support for array argument for useTranslation #389 #305

# 4.5.0

- Escape non-printable Unicode characters #413 #361
- Update dependencies

# 4.4.0

- Revert #361 #362
- Update dependencies

# 4.3.0 DO NOT USE THIS VERSION!

- Extract tagged templates in js and jsx lexers #376 #381
- Support unicode escape sequence in json #361 #362
- Update dependencies

# 4.2.0

- Improve warning for missing defaults #332

# 4.1.1

- Improve support for spread operator in JS #199

# 4.0.1

- Drop support for Node 10
- Update all dependencies
- Fix an error that was causing empty namespace catalogs to be created as `""` instead of `{}` #273

# 3.11.0

- Add a pluralSeparator option #300 #302

# 3.10.0

- defaultValue, useKeysAsDefaultValue and skipDefaultValues options support function #224 #299 #301

# 3.9.0

- Update to babel 7 #298

# 3.8.1

- Fix cli that wasn't running #295 #296

# 3.8.0

- Update dependencies

# 3.7.0

- Improve handling of string literals #261

# 3.6.0

- Fix a conflict in jsx lexer #254

# 3.5.0

- Stop trying to parse directories #252

# 3.4.0

- Support multiline output in YAML #251
- Fix bug with unicode escape sequences #227

# 3.3.0

- Fix customValueTemplate interpolation of ${key} #242
- Extract options as third parameter when second parameter is default value string #243 #241

# 3.2.0

- Fix defaultValue for plural forms #240 #212

# 3.1.0

- Parse default value from 'defaults' prop in Trans #238 #231 #206
- Fix mergeHashes keepRemoved option #237

# 3.0.1

- Add a `failOnWarnings` option and improve cli output #236

# 3.0.0

- `reactNamespace` option is gone #235

# 2.2.0

- Fix namespace parsing #233 #161

# 2.1.3

- Support unknow languages #230

# 2.1.2

- Support curly braces in jsx Trans elements #229

# 2.1.1

- Extract translation from comment in jsx #166 #223

# 2.1.0

- Support multiline literals #83
- Parse comments in js #215

# 2.0.0

- Drop support for node 6 and 8 (EOL) #208

# 1.0.7

- Add support for `withTranslation`

# 1.0.6

- Add support for `customValueTemplate` #211
- Add Prettier

# 1.0.5

- Add support for the `skipDefaultValues` option #216

# 1.0.4

- Revert support for node 6+

# 1.0.3

- Add support for custom lexers #213
- Fix CLI error obfuscation #193
- Drop Node 8 support #208
- Update dependencies

## 1.0.0-beta

- The changelog for the beta can be found in the [releases](https://github.com/i18next/i18next-parser/releases)

## 0.13.0

- Support `defaultValue` option along the translation key (#68)

## 0.12.0

- Support `prefix`, `suffix` and `extension` option on the CLI (#60)

## 0.11.1

- Add a new line at the end of file generated by the CLI (#54)

## 0.11.0

- Update dependencies

## 0.10.1

- Does not parse values from function that ends with a t (PR #52)

## 0.10.0

- Add option to silence the variable errors (PR #47)
- Support for passing a context via an object (PR #49)

## 0.9.0

- Handle strings with newlines, tabs and backslashes in them (PR #42)

## 0.8.2

- Fix the regex introduced in 0.8.1 that was throwing unexpected errors (for good)

## 0.8.1

- Fix the regex introduced in 0.8.1 that was throwing unexpected errors

## 0.8.0

- Throw an error when the translation function use a variable instead of a string

## 0.7.0

- Add --attributes option (cli & gulp)

## 0.6.0

- Add --keep-removed option (cli & gulp)
- Allow writeOld to be disable (cli)

## 0.5.0

- Add support for ES6 template strings: ` ` (closes #32)

## 0.4.0

- Add prefix, suffix and extension options (closes #31)
- Add writeOld option

## 0.3.8

- Add support for multiline array in catalog (fix #26)

## 0.3.7

- Fix the cli (fix #24)

## 0.3.6

- Transfer repository to i18next organization (fix #15)

## 0.3.5

- Fix the output path when using the cli (fix #22)

## 0.3.4

- Handle escaped quotes in translation keys (fix #21)

## 0.3.3

- Trailing separator in translation keys wasn't handled properly (fix #20)

## 0.3.2

- The translation key should be the first truthy match of the regex (fix #18)

## 0.3.1

- Improve support for `data-i18n` attributes in html

## 0.3.0

- Add support for context

## 0.2.0

- Add support for `data-i18n` attributes in html

## 0.1.xx

- Improve parser (0.1.11)
- [cli] namespace and key separator option (0.1.10)
- Add namespace and key separator options (0.1.9)
- Add support for plural keys (0.1.8)
- Catch JSON parsing errors (0.1.8)
- Improve the events emitted by the stream transform (0.1.7)
- [cli] Make sure input and output directory exist (0.1.6)
- [cli] Improve output (0.1.6)
- Fix #1 (0.1.5)
- Fix the regex to exclude functions that would end with `_t()` (0.1.4)

## 0.1.0 - Initial release
