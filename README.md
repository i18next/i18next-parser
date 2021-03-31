# i18next Parser [![Build Status](https://travis-ci.org/i18next/i18next-parser.svg?branch=master)](https://travis-ci.org/i18next/i18next-parser)

[![NPM](https://nodei.co/npm/i18next-parser.png?downloads=true&stars=true)](https://www.npmjs.com/package/i18next-parser)

When translating an application, maintaining the translation catalog by hand is painful. This package parses your code and automates this process.

Finally, if you want to make this process even less painful, I invite you to check [Locize](https://locize.com/). They are a sponsor of this project. Actually, if you use this package and like it, supporting me on [Patreon](https://www.patreon.com/karelledru) would mean a great deal!

<p>
  <a href="https://www.patreon.com/karelledru" target="_blank">
    <img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" alt="Become a Patreon">
  </a>
</p>

## Features

- Choose your weapon: A CLI, a standalone parser or a stream transform
- 6 built in lexers: Javascript, JSX, HTML, Handlebars, TypeScript+tsx and Vue
- Creates one catalog file per locale and per namespace
- Backs up the old keys your code doesn't use anymore in `namespace_old.json` catalog
- Restores keys from the `_old` file if the one in the translation file is empty
- Parses comments for static keys to support dynamic key translations.
- Supports i18next features:
  - **Context**: keys of the form `key_context`
  - **Plural**: keys of the form `key_plural` and `key_0`, `key_1` as described [here](https://www.i18next.com/translation-function/plurals)
- Tested on Node 10+. If you need support for 6 and 8, look at the `1.0.x` versions.

## Versions

You can find information about major releases on the [dedicated page](https://github.com/i18next/i18next-parser/releases). The [migration documentation](docs/migration.md) will help you figure out the breaking changes between versions.

For legacy users on `0.x`, the code has since been entirely rewritten and there is a dedicated [branch](https://github.com/i18next/i18next-parser/tree/0.x.x) for it. You are highly encouraged to upgrade!

## Usage

### CLI

You can use the CLI with the package installed locally but if you want to use it from anywhere, you better install it globally:

```
yarn global add i18next-parser
npm install -g i18next-parser
i18next 'app/**/*.{js,hbs}' 'lib/**/*.{js,hbs}' [-oc]
```

Multiple globbing patterns are supported to specify complex file selections. You can learn how to write globs [here](https://github.com/isaacs/node-glob). Note that glob must be wrapped with single quotes when passed as arguments.

**IMPORTANT NOTE**: If you pass the globs as CLI argument, they must be relative to where you run the command (aka relative to `process.cwd()`). If you pass the globs via the `input` option of the config file, they must be relative to the config file.

- **-c, --config <path>**: Path to the config file (default: i18next-parser.config.js).
- **-o, --output <path>**: Path to the output directory (default: locales/$LOCALE/$NAMESPACE.json).
- **-s, --silent**: Disable logging to stdout.
- **--fail-on-warnings**: Exit with an exit code of 1 on warnings

### Gulp

Save the package to your devDependencies:

```
yarn add -D i18next-parser
npm install --save-dev i18next-parser
```

[Gulp](http://gulpjs.com/) defines itself as the streaming build system. Put simply, it is like Grunt, but performant and elegant.

```javascript
const i18nextParser = require('i18next-parser').gulp;

gulp.task('i18next', function() {
  gulp.src('app/**')
    .pipe(new i18nextParser({
      locales: ['en', 'de'],
      output: 'locales/$LOCALE/$NAMESPACE.json'
    }))
    .pipe(gulp.dest('./'));
});
```

**IMPORTANT**: `output` is required to know where to read the catalog from. You might think that `gulp.dest()` is enough though it does not inform the transform where to read the existing catalog from.

### Broccoli

Save the package to your devDependencies:

```
yarn add -D i18next-parser
npm install --save-dev i18next-parser
```

[Broccoli.js](https://github.com/broccolijs/broccoli) defines itself as a fast, reliable asset pipeline, supporting constant-time rebuilds and compact build definitions.

```javascript
const Funnel = require('broccoli-funnel')
const i18nextParser = require('i18next-parser').broccoli

const appRoot = 'broccoli'

let i18n = new Funnel(appRoot, {
  files: ['handlebars.hbs', 'javascript.js'],
  annotation: 'i18next-parser'
})

i18n = new i18nextParser([i18n], {
  output: 'broccoli/locales/$LOCALE/$NAMESPACE.json'
})

module.exports = i18n
```

## Options

Using a config file gives you fine-grained control over how i18next-parser treats your files. Here's an example config showing all config options with their defaults.

```js
// i18next-parser.config.js

module.exports = {
  contextSeparator: '_',
  // Key separator used in your translation keys

  createOldCatalogs: true,
  // Save the \_old files

  defaultNamespace: 'translation',
  // Default namespace used in your i18next config

  defaultValue: '',
  // Default value to give to empty keys

  indentation: 2,
  // Indentation of the catalog files

  keepRemoved: false,
  // Keep keys from the catalog that are no longer in code

  keySeparator: '.',
  // Key separator used in your translation keys
  // If you want to use plain english keys, separators such as `.` and `:` will conflict. You might want to set `keySeparator: false` and `namespaceSeparator: false`. That way, `t('Status: Loading...')` will not think that there are a namespace and three separator dots for instance.

  // see below for more details
  lexers: {
    hbs: ['HandlebarsLexer'],
    handlebars: ['HandlebarsLexer'],

    htm: ['HTMLLexer'],
    html: ['HTMLLexer'],

    mjs: ['JavascriptLexer'],
    js: ['JavascriptLexer'], // if you're writing jsx inside .js files, change this to JsxLexer
    ts: ['JavascriptLexer'],
    jsx: ['JsxLexer'],
    tsx: ['JsxLexer'],

    default: ['JavascriptLexer']
  },

  lineEnding: 'auto',
  // Control the line ending. See options at https://github.com/ryanve/eol

  locales: ['en', 'fr'],
  // An array of the locales in your applications

  namespaceSeparator: ':',
  // Namespace separator used in your translation keys
  // If you want to use plain english keys, separators such as `.` and `:` will conflict. You might want to set `keySeparator: false` and `namespaceSeparator: false`. That way, `t('Status: Loading...')` will not think that there are a namespace and three separator dots for instance.

  output: 'locales/$LOCALE/$NAMESPACE.json',
  // Supports $LOCALE and $NAMESPACE injection
  // Supports JSON (.json) and YAML (.yml) file formats
  // Where to write the locale files relative to process.cwd()

  input: undefined,
  // An array of globs that describe where to look for source files
  // relative to the location of the configuration file

  sort: false,
  // Whether or not to sort the catalog

  skipDefaultValues: false,
  // Whether to ignore default values.

  useKeysAsDefaultValue: false,
  // Whether to use the keys as the default value; ex. "Hello": "Hello", "World": "World"
  // This option takes precedence over the `defaultValue` and `skipDefaultValues` options

  verbose: false,
  // Display info about the parsing including some stats

  failOnWarnings: false,
  // Exit with an exit code of 1 on warnings

  customValueTemplate: null
  // If you wish to customize the value output the value as an object, you can set your own format.
  // ${defaultValue} is the default value you set in your translation function.
  // Any other custom property will be automatically extracted.
  //
  // Example:
  // {
  //   message: "${defaultValue}",
  //   description: "${maxLength}", // t('my-key', {maxLength: 150})
  // }
}
```

### Lexers

The `lexers` option let you configure which Lexer to use for which extension. Here is the default:

Note the presence of a `default` which will catch any extension that is not listed.
There are 4 lexers available: `HandlebarsLexer`, `HTMLLexer`, `JavascriptLexer` and
`JsxLexer`. Each has configurations of its own. Typescript is supported via `JavascriptLexer` and `JsxLexer`.
If you need to change the defaults, you can do it like so:

#### Javascript

The Javascript lexer uses [Typescript compiler](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) to walk through your code and extract translation functions.

The default configuration is below:

```js
{
  // JavascriptLexer default config (js, mjs)
  js: [{
    lexer: 'JavascriptLexer',
    functions: ['t'], // Array of functions to match
  }],
}
```

#### Jsx

The JSX lexer builds off of the Javascript lexer and extends it with support for JSX syntax.

Default configuration:

```js
{
  // JsxLexer default config (jsx)
  // JsxLexer can take all the options of the JavascriptLexer plus the following
  jsx: [{
    lexer: 'JsxLexer',
    attr: 'i18nKey', // Attribute for the keys
  }],
}
```

If your JSX files have `.js` extension (e.g. create-react-app projects) you should override the default `js` lexer with `JsxLexer` to enable jsx parsing from js files:

```js
{
  js: [{
    lexer: 'JsxLexer'
  }],
}
```

#### Ts(x)

Typescript is supported via Javascript and Jsx lexers. If you are using Javascript syntax (e.g. with React), follow the steps in Jsx section, otherwise Javascript section.

#### Handlebars

```js
{
  // HandlebarsLexer default config (hbs, handlebars)
  handlebars: [
    {
      lexer: 'HandlebarsLexer',
      functions: ['t'] // Array of functions to match
    }
  ]
}
```

#### Html

```js
{
  // HtmlLexer default config (htm, html)
  html: [{
    lexer: 'HtmlLexer',
    attr: 'data-i18n' // Attribute for the keys
    optionAttr: 'data-i18n-options' // Attribute for the options
  }]
}
```

#### Custom lexers

You can provide function instead of string as a custom lexer.

```js
const CustomJsLexer = require('./CustomJsLexer');

// ...
{
  js: [CustomJsLexer],
  jsx: [{
    lexer: CustomJsLexer,
    customOption: true // Custom attribute passed to CustomJsLexer class constructor
  }]
}
// ...
```

### Caveats

While i18next extracts translation keys in runtime, i18next-parser doesn't run the code, so it can't interpolate values in these expressions:

```
t(key)
t('key' + id)
t(`key${id}`)
```

As a workaround you should specify possible static values in comments anywhere in your file:

```
// t('key_1')
// t('key_2')
t(key)

/*
t('key1')
t('key2')
*/
t('key' + id)
```

## Events

The transform emits a `reading` event for each file it parses:

`.pipe( i18next().on('reading', (file) => {}) )`

The transform emits a `error:json` event if the JSON.parse on json files fail:

`.pipe( i18next().on('error:json', (path, error) => {}) )`

The transform emits a `warning:variable` event if the file has a key that contains a variable:

`.pipe( i18next().on('warning:variable', (path, key) => {}) )`

## Contribute

Any contribution is welcome. Please [read the guidelines](docs/development.md) first.

Thanks a lot to all the previous [contributors](https://github.com/i18next/i18next-parser/graphs/contributors).

If you use this package and like it, supporting me on [Patreon](https://www.patreon.com/karelledru) is another great way to contribute!

<p>
  <a href="https://www.patreon.com/karelledru" target="_blank">
    <img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" alt="Become a Patreon">
  </a>
</p>

---

## Gold Sponsors

<p>
  <a href="https://locize.com/" target="_blank">
    <img src="https://raw.githubusercontent.com/i18next/i18next/master/assets/locize_sponsor_240.gif" width="240px">
  </a>
</p>
