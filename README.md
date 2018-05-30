# i18next Parser [![Build Status](https://travis-ci.org/i18next/i18next-parser.svg?branch=master)](https://travis-ci.org/i18next/i18next-parser)

[![NPM](https://nodei.co/npm/i18next-parser.png?downloads=true&stars=true)](https://www.npmjs.com/package/i18next-parser)

When translating an application, maintaining the translation catalog by hand is painful. This package automates this process.



## Features

- Choose your weapon: A CLI, a standalone parser or a stream transform
- 4 built in lexers: Javascript, JSX, HTML and Handlebars
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

- **-o, --output <path>**: Where to write the locale files.
- **-c, --config <path>**: The config file with all the options
- **-S, --silent**: The config file with all the options

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
      output: 'locales'
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
  output: 'broccoli/locales'
})

module.exports = i18n
```

## Options

Option                   | Description                                           | Default
---------------------- | ----------------------------------------------------- | ---
**contextSeparator**     | Key separator used in your translation keys           | `_`
**createOldCatalogs**    | Save the \_old files                                  | `true`
**defaultNamespace**     | Default namespace used in your i18next config         | `translation`
**defaultValue**         | Default value to give to empty keys                   | `''`
**extension** <sup>1<sup>| Extenstion of the catalogs                            | `.json`
**filename**  <sup>1<sup>| Filename of the catalogs                              | `'$NAMESPACE'`
**indentation**          | Indentation of the catalog files                      | `2`
**keepRemoved**          | Keep keys from the catalog that are no longer in code | `false`
**keySeparator** <sup>2<sup>| Key separator used in your translation keys           | `.`
**lexers**               | See below for details                                 | `{}`
**lineEnding**           | Control the line ending. See options at [eol](https://github.com/ryanve/eol) | `auto`
**locales**              | An array of the locales in your applications          | `['en','fr']`
**namespaceSeparator** <sup>2<sup>| Namespace separator used in your translation keys     | `:`
**output**               | Where to write the locale files relative to the base  | `locales`
**reactNamespace** <sup>3<sup>| For react file, extract the [defaultNamespace](https://react.i18next.com/components/translate-hoc.html)          | `false`
**sort**                 | Whether or not to sort the catalog                    | `false`

1. Both `filename` and `extension` options support injection of `$LOCALE` and `$NAMESPACE` variables. The file output is JSON by default, if you want YAML, the `extension` must end with `yml`.
2. If you want to use plain english keys, separators such as `.` and `:` will conflict. You might want to set `keySeparator: false` and `namespaceSeparator: false`. That way, `t('Status: Loading...')` will not think that there are a namespace and three separator dots for instance.
3. If the file being parsed has a `.jsx` extension, this option is ignored and the namespace is being extracted.


### Lexers

The `lexers` option let you configure which Lexer to use for which extension. Here is the default:

```js
{
  lexers: {
    hbs: ['HandlebarsLexer'],
    handlebars: ['HandlebarsLexer'],

    htm: ['HTMLLexer'],
    html: ['HTMLLexer'],

    js: ['JavascriptLexer'],
    jsx: ['JavascriptLexer', 'JsxLexer'],
    mjs: ['JavascriptLexer'],

    default: ['JavascriptLexer']
  }
}
```

Note the presence of a `default` which will catch any extension that is not listed. There are 3 lexers available: `HandlebarsLexer`, `HTMLLexer` and `JavascriptLexer`. Each has configurations of its own. If you need to change the defaults, you can do it like so:

```js
{
  lexers: {
    hbs: [
      {
        lexer: 'HandlebarsLexer',
        functions: ['translate', '__']
      }
    ],
    // ...
  }
}
```

**`HandlebarsLexer` options**

Option        | Description                 | Default
------------- | --------------------------- | -------
**functions** | Array of functions to match | `['t']`

**`HTMLLexer` options**

Option         | Description                 | Default
-------------- | --------------------------- | -------
**attr**       | Attribute for the keys      | `'data-i18n'`
**optionAttr** | Attribute for the options   | `'data-i18n-options'`

**`JavscriptLexer` options**

Option        | Description                 | Default
------------- | --------------------------- | -------
**functions** | Array of functions to match | `['t']`
**acorn**     | Options to pass to acorn    | `{}`

**`JsxLexer` options**

Option        | Description            | Default
------------- | ---------------------- | -------
**attr**      | Attribute for the keys | `i18nKey`



## Events

The transform emits a `reading` event for each file it parses:

`.pipe( i18next().on('reading', (file) => {}) )`

The transform emits a `error:json` event if the JSON.parse on json files fail:

`.pipe( i18next().on('error:json', (path, error) => {}) )`

The transform emits a `warning:variable` event if the file has a key that contains a variable:

`.pipe( i18next().on('warning:variable', (path, key) => {}) )`



## Contribute

Any contribution is welcome. Please [read the guidelines](doc/development.md) first.

Thanks a lot to all the previous [contributors](https://github.com/i18next/i18next-parser/graphs/contributors).
