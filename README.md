# i18next Parser

A simple command line and gulp plugin that lets you parse your code and extract the translations keys in it.

The idea is to parse code files to retrieve the translation keys and create a catalog. You can use the command line or run in the background with Gulp while coding. It removes the pain of maintaining your translation catalog.

## Features

- Parses a single file or a directory (recursively or not)
- Creates one json file per locale and per namespace.
- Remove old keys your code doesn't use anymore and place them in a `namespace_old.json` file. It is usefull to avoid losing translations you may want to reuse.
- Restore keys from the `_old` file if the one in the translation file is empty.
- Handles plural keys of the form `key_plural` and `key_plural_0`
- Is a stream transform (so it works with gulp)


---



## Installation

```
npm install i18next-parser -g
```

## Tests

```
mocha --reporter nyan test/test.js
```

---

## CLI Usage

`i18next /path/to/file/or/dir [-orpfnl]`

- **-o, --output <directory>**: Where to write the locale files.
- **-r, --recursive**: Is --output is a directory, parses files in sub directories.
- **-f, --function <list>**: Function names to parse. Defaults to `t`
- **-p, --parser <string>**: A custom regex for the parser to use.
- **-n, --namespace <string>**: Default namespace used in your i18next config. Defaults to `translation`
- **-s, --namespace-separator <string>**: Namespace separator used in your translation keys. Defaults to `:`
- **-k, --key-separator <string>**: Key separator used in your translation keys. Defaults to `.`
- **-l, --locales <list>**: The locales in your applications. Defaults to `en,fr`

---

## Gulp Usage

[Gulp](http://gulpjs.com/) defines itself as the streaming build system. Put simply, it is like Grunt, but performant and elegant.

```javascript
var i18next = require('i18next-parser');

gulp.task('i18next', function() {
    gulp.src('app/**')
        .pipe(i18next({locales: ['en', 'de'], functions: ['__', '_e']}))
        .pipe(gulp.dest('locales'));
});
```

- **output**: Where to write the locale files. Defaults to `locales`
- **functions**: An array of functions names to parse. Defaults to `['t']`
- **namespace**: Default namespace used in your i18next config. Defaults to `translation`
- **namespaceSeparator**: Namespace separator used in your translation keys. Defaults to `:`
- **keySeparator**: Key separator used in your translation keys. Defaults to `.`
- **locales**: An array of the locales in your applications. Defaults to `['en','fr']`
- **regex**: A custom regex for the parser to use.



**Events**

The transform emit a `reading` event for each file it parses:

`.pipe( i18next().on('reading', function(path) {  }) )`

The transform emit a `writing` event for each file it passes to the stream:

`.pipe( i18next().on('reading', function(path) {  }) )`

The transform emit a `json_error` event if the JSON.parse on json files fail. It is passed the error name (like `SyntaxError`) and the error message (like `Unexpected token }`):

`.pipe( i18next().on('reading', function(name, message) {  }) )`

---

## Exemples

**Change the output directory (cli and gulp)**

Command line:

`i18next /path/to/file/or/dir -o /output/directory`

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

`i18next /path/to/file/or/dir -r "(.*)"`

Gulp:

`.pipe(i18next({regex: '(.*)'}))`

You must pass the regex as a string. That means that you will have to properly escape it.

The regex used by default is:

`/[^a-zA-Z0-9](?:(?:t)|(?:i18n\.t))(?:\(|\s)\s*(?:(?:'((?:(?:\\')?[^']+)+[^\\])')|(?:"((?:(?:\\")?[^"]+)+[^\\])"))/g`



**Filter files and folders (cli)**

`i18next /path/to/file/or/dir -filterFolder *.hbs,*.js -filterFolder !.git`

In recursive mode, it will parse `*.hbs` and `*.js` files and skip `.git` folder. This options is passed to readdirp. To learn more, read [their documentation](https://github.com/thlorenz/readdirp#filters).
