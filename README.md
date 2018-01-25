# i18next Parser [![Build Status](https://travis-ci.org/i18next/i18next-parser.svg?branch=master)](https://travis-ci.org/i18next/i18next-parser)

[![NPM](https://nodei.co/npm/i18next-parser.png?downloads=true&stars=true)](https://www.npmjs.com/package/i18next-parser)

A simple command line and gulp plugin that lets you parse your code and extract the translations keys in it.

The idea is to parse code files to retrieve the translation keys and create a catalog. You can use the command line or run in the background with Gulp while coding. It removes the pain of maintaining your translation catalog.

## Features

- Parses a single file or a directory (recursively or not)
- Parses template files (support for jade, handlebars and data-i18n attribute in html)
- Creates one json file per locale and per namespace.
- Remove old keys your code doesn't use anymore and place them in a `namespace_old.json` file. It is useful to avoid losing translations you may want to reuse.
- Restore keys from the `_old` file if the one in the translation file is empty.
- Support most i18next features:
    - Handles context keys of the form `key_context`
    - Handles plural keys of the form `key_plural` and `key_plural_0`
    - Handles multiline array in catalog
- Is a stream transform (so it works with gulp)
- Supports es6 template strings (in addition to single/double quoted strings) with ${expression} placeholders


---

## Installation

```
npm install i18next-parser -g
```

## Tests

```
mocha --require babel-register --require babel-polyfill test/**/*.js
```

---

## Contribute

Any contribution is welcome. Just follow those quick guidelines:

1. Fork and clone the project
2. Create a branch `git checkout -b feature/my-feature` (use feature/ or hotfix/ branch prefixes accordingly)
3. Push to your fork
4. Write tests and documentation (I won't merge a PR without it)
5. Make a pull request from your repository `feature/my-feature` branch to this repository `master`. Do not create both an issue ticket and a Pull Request.
6. Wait, I am usually pretty fast to merge PRs :)

Thanks a lot to all the previous [contributors](https://github.com/i18next/i18next-parser/graphs/contributors).

---

## CLI Usage

`i18next /path/to/file/or/dir [-orapfnl]`

- **-o, --output <directory>**: Where to write the locale files.
- **-r, --recursive**: Is --output is a directory, parses files in sub directories.
- **-f, --functions <list>**: Function names to parse. Defaults to `t`
- **-a, --attributes <list>**: HTML attributes to parse. Defaults to `data-i18n`
- **-p, --parser <string>**: A custom regex for the parser to use.
- **-n, --namespace <string>**: Default namespace used in your i18next config. Defaults to `translation`
- **-s, --namespace-separator <string>**: Namespace separator used in your translation keys. Defaults to `:`
- **-k, --key-separator <string>**: Key separator used in your translation keys. Defaults to `.`
- **-c, --context-separator <string>**: Context separator used in your translation keys. Defaults to `_`
- **-l, --locales <list>**: The locales in your applications. Defaults to `en,fr`
- **--directoryFilter**: Globs of folders to filter
- **--fileFilter**: Globs of files to filter
- **--keep-removed**: Prevent keys no longer found from being removed
- **--write-old false**: Avoid saving the \_old files
- **--ignore-variables**: Don't fail when a variable is found
- **--prefix <string>**: Prefix filename for each locale, eg.: 'pre-$LOCALE-' will yield 'pre-en-default.json'
- **--suffix <string>**: Suffix filename for each locale, eg.: '-$suf-LOCALE' will yield 'default-suf-en.json'
- **--extension <string>**: Specify extension for filename for each locale, eg.: '.$LOCALE.i18n' will yield 'default.en.i18n'

---

## Gulp Usage

[Gulp](http://gulpjs.com/) defines itself as the streaming build system. Put simply, it is like Grunt, but performant and elegant.

```javascript
var i18next = require('i18next-parser');

gulp.task('i18next', function() {
    gulp.src('app/**')
        .pipe(i18next({
            locales: ['en', 'de'],
            functions: ['__', '_e'],
            output: '../locales'
        }))
        .pipe(gulp.dest('locales'));
});
```

- **output**: Where to write the locale files relative to the base (here `app/`). Defaults to `locales`
- **functions**: An array of functions names to parse. Defaults to `['t']`
- **attributes**: An array of html attributes to parse. Defaults to `['data-i18n']`
- **namespace**: Default namespace used in your i18next config. Defaults to `translation`
- **namespaceSeparator**: Namespace separator used in your translation keys. Defaults to `:`
- **keySeparator**: Key separator used in your translation keys. Defaults to `.`
- **locales**: An array of the locales in your applications. Defaults to `['en','fr']`
- **parser**: A custom regex for the parser to use.
- **writeOld**: Save the \_old files. Defaults to `true`
- **prefix**: Add a custom prefix in front of the file name.
- **suffix**: Add a custom suffix at the end of the file name.
- **extension**: Edit the extension of the files. Defaults to `.json`
- **keepRemoved**: Prevent keys no longer found from being removed
- **ignoreVariables**: Don't fail when a variable is found

You can inject the locale tag in either the prefix, suffix or extension using the `$LOCALE` variable.

### Note on paths (why your translations are not saved)

The way gulp works, it take a `src()`, applies some transformations to the files matched and then render the transformation using the `dest()` command to a path of your choice. With `i18next-parser`, the `src()` takes the path to the files to parse and the `dest()` takes the path where you want the catalogs of translation keys.

The problem is that the `i18next()` transform doesn't know about the path you specify in `dest()`. So it doesn't know where the catalogs are. So it can't merge the result of the parsing with the existing catalogs you may have there.

```
gulp.src('app/**')
    .pipe(i18next())
    .pipe(gulp.dest('custom/path'));
```

If you consider the code above, any file that match the `app/**` pattern will have of base set to `app/`. *As per the vinyl-fs [documentation](https://github.com/wearefractal/vinyl-fs#srcglobs-opt) (which powers gulp), the base is the folder relative to the cwd and defaults is where the glob begins.*

Bare with me, the `output` option isn't defined, it defaults to `locales`. So the `i18next()` transform will look for files in the `app/locales` directory (the base plus the output directory). But in reality they are located in `custom/path`. So for the `i18next-parser` to find your catalogs, you need the `output` option:

```
gulp.src('app/**')
    .pipe(i18next({output: '../custom/path'}))
    .pipe(gulp.dest('custom/path'));
```

The `output` option is relative to the base. In our case, we have `app/` as a base and we want `custom/path`. So the `output` option must be `../custom/path`.


### Events

The transform emit a `reading` event for each file it parses:

`.pipe( i18next().on('reading', function(path) {  }) )`

The transform emit a `writing` event for each file it passes to the stream:

`.pipe( i18next().on('reading', function(path) {  }) )`

The transform emit a `json_error` event if the JSON.parse on json files fail. It is passed the error name (like `SyntaxError`) and the error message (like `Unexpected token }`):

`.pipe( i18next().on('reading', function(name, message) {  }) )`

### Errors

- `i18next-parser does not support variables in translation functions, use a string literal`: i18next-parser can't parse keys if you use variables like `t(variable)`, you need to use strings like `t('string')`.

---

## Examples

**Change the output directory (cli and gulp)**

Command line (the options are identical):

`i18next /path/to/file/or/dir -o /output/directory`

`i18next /path/to/file/or/dir:/output/directory`

Gulp:

`.pipe(i18next({output: 'translations'}))`

It will create the file in the specified folder (in case of gulp it doesn't actually create the files until you call `dest()`):

```
/output/directory/en/translation.json
...
```



**Change the locales (cli and gulp)**

Command line:

`i18next /path/to/file/or/dir -l en,de,sp`

Gulp:

`.pipe(i18next({locales: ['en', 'de', 'sp']}))`

This will create a directory per locale in the output folder:

```
locales/en/...
locales/de/...
locales/sp/...
```



**Change the default namespace (cli and gulp)**

Command line:

`i18next /path/to/file/or/dir -n my_default_namespace`

Gulp:

`.pipe(i18next({namespace: 'my_default_namespace'}))`

This will add all the translation from the default namespace in the following file:

```
locales/en/my_default_namespace.json
...
```



**Change the namespace and key separators (cli and gulp)**

Command line:

`i18next /path/to/file/or/dir -s '?' -k '_'`

Gulp:

`.pipe(i18next({namespaceSeparator: '?', keySeparator: '_'}))`

This parse the translation keys as follow:

```
namespace?key_subkey

namespace.json
{
    key: {
        subkey: ''
    }
}
...
```



**Change the translation functions (cli and gulp)**

Command line:

`i18next /path/to/file/or/dir -f __,_e`

Gulp:

`.pipe(i18next({functions: ['__', '_e']}))`

This will parse any of the following function calls in your code and extract the key:

```
__('key'
__ 'key'
__("key"
__ "key"
_e('key'
_e 'key'
_e("key"
_e "key"
```

Note1: we don't match the closing parenthesis as you may want to pass arguments to your translation function.

Note2: the parser is smart about escaped single or double quotes you may have in your key.



**Change the regex (cli and gulp)**

Command line:

`i18next /path/to/file/or/dir -p "(.*)"`

Gulp:

`.pipe(i18next({parser: '(.*)'}))`

If you use a custom regex, the `functions` option will be ignored. You need to write you regex to parse the functions you want parsed.

You must pass the regex as a string. That means that you will have to properly escape it. Also, the parser will consider the translation key to be the first truthy match of the regex; it means that you must use non capturing blocks `(?:)` for anything that is not the translation key.

The regex used by default is:

`[^a-zA-Z0-9_](?:t)(?:\\(|\\s)\\s*(?:(?:\'((?:(?:\\\\\')?[^\']+)+[^\\\\])\')|(?:"((?:(?:\\\\")?[^"]+)+[^\\\\])"))/g`



**Filter files and folders (cli)**

`i18next /path/to/file/or/dir --fileFilter '*.hbs,*.js' --directoryFilter '!.git'`

In recursive mode, it will parse `*.hbs` and `*.js` files and skip `.git` folder. This options is passed to readdirp. To learn more, read [their documentation](https://github.com/thlorenz/readdirp#filters).



**Work with Meteor TAP-i18N (gulp)**

`.pipe(i18next({
    output: "i18n",
    locales: ['en', 'de', 'fr', 'es'],
    functions: ['_'],
    namespace: 'client',
    suffix: '.$LOCALE',
    extension: ".i18n.json",
    writeOld: false
}))`

This will output your files in the format `$LOCALE/client.$LOCALE.i18n.json` in a `i18n/` directory.
