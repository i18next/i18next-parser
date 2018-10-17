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
- 5 built in lexers: Javascript, JSX, HTML, Handlebars, and TypeScript+tsx
- Creates one catalog file per locale and per namespace
- Backs up the old keys your code doesn't use anymore in `namespace_old.json` catalog
- Restores keys from the `_old` file if the one in the translation file is empty
- Supports i18next features:
  - **Context**: keys of the form `key_context`
  - **Plural**: keys of the form `key_plural` and `key_plural_0`
- Tested on Node 6+

## DISCLAMER: `1.0.0-beta`

`1.x` is currently in beta. You can follow the pre-releases [here](https://github.com/i18next/i18next-parser/releases). It is a deep rewrite of this package that solves many issues, the main one being that it was slowly becoming unmaintainable. The [migration](docs/migration.md) contains all the breaking changes. Everything that follows is related to `1.x`. If you rely on a `0.x.x` version, you can still find the old documentation on its dedicated [branch](https://github.com/i18next/i18next-parser/tree/0.x.x).


## Usage

### CLI

You can use the CLI with the package installed locally but if you want to use it from anywhere, you better install it globally:

```
yarn global add i18next-parser@next
npm install -g i18next-parser@next
i18next 'app/**/*.{js,hbs}' 'lib/**/*.{js,hbs}' [-oc]
```

Multiple globbing patterns are supported to specify complex file selections. You can learn how to write globs [here](https://github.com/isaacs/node-glob). Note that glob must be wrapped with single quotes when passed as arguments.

**IMPORTANT NOTE**: If you pass the globs as CLI argument, they must be relative to where you run the command (aka relative to `process.cwd()`). If you pass the globs via the `input` option of the config file, they must be relative to the config file. 

- **-c, --config <path>**: Path to the config file (default: i18next-parser.config.js).
- **-o, --output <path>**: Path to the output directory (default: locales/$LOCALE/$NAMESPACE.json).
- **-S, --silent**: Disable logging to stdout.

### Gulp

Save the package to your devDependencies:

```
yarn add -D i18next-parser@next
npm install --save-dev i18next-parser@next
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
yarn add -D i18next-parser@next
npm install --save-dev i18next-parser@next
```

[Broccoli.js](https://github.com/broccolijs/broccoli) defines itself as a fast, reliable asset pipeline, supporting constant-time rebuilds and compact build definitions.

```javascript

const Funnel = require('broccoli-funnel')
const i18nextParser = require('i18next-parser').broccoli;

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

    js: ['JavascriptLexer'], // if you're writing jsx inside .js files, change this to JsxLexer
    jsx: ['JsxLexer'],
    mjs: ['JavascriptLexer'],

    ts: ['TypescriptLexer'],
    tsx: ['TypescriptLexer'],

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
  // Where to write the locale files relative to process.cwd()

  input: undefined,
  // An array of globs that describe where to look for source files
  // relative to the location of the configuration file

  reactNamespace: false,
  // For react file, extract the defaultNamespace - https://react.i18next.com/components/translate-hoc.html
  // Ignored when parsing a `.jsx` file and namespace is extracted from that file.

  sort: false,
  // Whether or not to sort the catalog

  verbose: false
  // Display info about the parsing including some stats
}
```

### Lexers

The `lexers` option let you configure which Lexer to use for which extension. Here is the default:

Note the presence of a `default` which will catch any extension that is not listed.
There are 5 lexers available: `HandlebarsLexer`, `HTMLLexer`, `JavascriptLexer`,
`JsxLexer`, and `TypescriptLexer`. Each has configurations of its own.
If you need to change the defaults, you can do it like so:

#### Javascript
The Javascript lexer uses [Acorn](https://github.com/acornjs/acorn) to walk through your code and extract references
translation functions. If your code uses features not supported natively by Acorn, you can enable support through
`injectors` and `plugins` configuration. Note that you must install these additional dependencies yourself through
`yarn` or `npm`; they are not included in this package. This is an example configuration that adds all non-jsx plugins supported by acorn
at the time of writing:
```javascript
const injectAcornStaticClassPropertyInitializer = require('acorn-static-class-property-initializer/inject');
const injectAcornStage3 = require('acorn-stage3/inject');
const injectAcornEs7 = require('acorn-es7');

// ...
  js: [{
    lexer: 'JavascriptLexer'
    functions: ['t'], // Array of functions to match

    // acorn config (for more information on the acorn options, see here: https://github.com/acornjs/acorn#main-parser)
    acorn: {
      injectors: [
          injectAcornStaticClassPropertyInitializer,
          injectAcornStage3,
          injectAcornEs7,
        ],
      plugins: {
        // The presence of these plugin options is important -
        // without them, the plugins will be available but not
        // enabled.
        staticClassPropertyInitializer: true,
        stage3: true,
        es7: true,
      }
    }
  }],
// ...
```

If you receive an error that looks like this:
```bash
TypeError: baseVisitor[type] is not a function
# rest of stack trace...
```
The problem is likely that you are missing a plugin that supports a feature that your code uses.

The default configuration is below:

```js
{
  // JavascriptLexer default config (js, mjs)
  js: [{
    lexer: 'JavascriptLexer'
    functions: ['t'], // Array of functions to match

    // acorn config (for more information on the acorn options, see here: https://github.com/acornjs/acorn#main-parser)
    acorn: {
      sourceType: 'module',
      ecmaVersion: 9, // forward compatibility
      // Allows additional acorn plugins via the exported injector functions
      injectors: [],
      plugins: {},
    }
  }],
}
```

#### Jsx
The JSX lexer builds off of the Javascript lexer, and additionally requires the `acorn-jsx` plugin. To use it, add `acorn-jsx` to your dev dependencies:
```bash
npm install -D acorn-jsx
# or
yarn add -D acorn-jsx
```

Default configuration:
```js
{
  // JsxLexer default config (jsx)
  // JsxLexer can take all the options of the JavascriptLexer plus the following
  jsx: [{
    lexer: 'JsxLexer',
    attr: 'i18nKey', // Attribute for the keys

    // acorn config (for more information on the acorn options, see here: https://github.com/acornjs/acorn#main-parser)
    acorn: {
      sourceType: 'module',
      ecmaVersion: 9, // forward compatibility
      injectors: [],
      plugins: {},
    }
  }],
}
```
#### Ts(x)
The Typescript lexer builds off of the JSX lexer, and additionally requires Typescript. To use it, add both `typescript` and `acorn-jsx` to your dev dependencies:
```bash
npm install -D typescript acorn-jsx
# or
yarn add -D typescript acorn-jsx
```
If you need additional plugins, you can install them in the same way as described in the Javascript lexer configuration.

Default configuration:
```js
{
  // TypescriptLexer default config (ts/x)
  // TypescriptLexer can take all the options of the JsxLexer in addition to
  // optional tsOptions to pass as compilerOptions to TypeScript.
  ts: [{
    lexer: 'TypescriptLexer',
    attr: 'i18nKey', // Attribute for the keys

    // compiler options (https://www.typescriptlang.org/docs/handbook/compiler-options.html)
    // note that jsx MUST be set to Preserve, or your strings will not be extracted.
    tsOptions: {
      jsx: 'Preserve',
      target: 'esnext'
    },
  }]
}
```

#### Handlebars
```js
{
  // HandlebarsLexer default config (hbs, handlebars)
  handlebars: [{
    lexer: 'HandlebarsLexer',
    functions: ['t'] // Array of functions to match
  }]
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

--------------

## Gold Sponsors

<p>
  <a href="https://locize.com/" target="_blank">
    <img src="https://raw.githubusercontent.com/i18next/i18next/master/assets/locize_sponsor_240.gif" width="240px">
  </a>
</p>
