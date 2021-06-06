# Examples

## Changing the output directory

This will create the files in the specified folder.

### Command line
```
$ i18next /path/to/file/or/dir -o /translations/$LOCALE/$NAMESPACE.json
$ i18next /path/to/file/or/dir:/translations/$LOCALE/$NAMESPACE.json 
```

### Gulp

When using Gulp, note that the files are not created until `dest()` is called. 

```js
.pipe(i18next({ output: 'translations/$LOCALE/$NAMESPACE.json' }))
```

## Changing the locales

This will create a directory for each locale in the output folder:

```
locales/en/...
locales/de/...
locales/sp/...
```

### Command Line
```
$ i18next /path/to/file/or/dir -l en,de,sp
```

### Gulp 
```js
pipe(i18next({ locales: ['en', 'de', 'sp'] }))
```

## Changing the default namespace

This will add all the translation from the default namespace in the file `locales/en/{namespace}.json`

### Command line

```
$ i18next /path/to/file/or/dir -n my_default_namespace
```

### Gulp

```js
pipe(i18next({ namespace: 'my_default_namespace' }))
```

## Changing namespace and key separators

This will parse the translation keys as in the following:

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

### Command line
```
$ i18next /path/to/file/or/dir -s '?' -k '_'
```

### Gulp

```js
.pipe(i18next({namespaceSeparator: '?', keySeparator: '_'}))
```

## Changing the translation functions

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

Please note that:
- We don't match the closing parenthesis, as you might want to pass arguments to your translation function;
- The parser is smart about escaped quotes (single or double) you may have in your key.

### Command line

```
$ i18next /path/to/file/or/dir -f __,_e
```

You can also pass this option using the config file (`i18next-parser.config.js`). Just add the `function` property to the related lexer:
```js
{
  lexers: {
    js: [{
      lexer: 'JavascriptLexer',
      functions: ['t', 'TAPi18n.__', '__']
    }]
  }  
}
```

### Gulp

```js
.pipe(i18next({functions: ['__', '_e']}))`
```

## Changing the regex

If you use a custom regex, the `functions` option will be ignored. You need to write you regex to parse the functions you want parsed.

You must pass the regex as a string. That means that you will have to properly escape it. Also, the parser will consider the translation key to be the first truthy match of the regex; it means that you must use non capturing blocks `(?:)` for anything that is not the translation key.

The regex used by default is:

`[^a-zA-Z0-9_](?:t)(?:\\(|\\s)\\s*(?:(?:\'((?:(?:\\\\\')?[^\']+)+[^\\\\])\')|(?:"((?:(?:\\\\")?[^"]+)+[^\\\\])"))/g`

### Command line
```
$ i18next /path/to/file/or/dir -p "(.*)"
```

### Gulp
```js
.pipe(i18next({ parser: '(.*)' }))
```

## Filter files and folders

```
$ i18next /path/to/file/or/dir --fileFilter '*.hbs,*.js' --directoryFilter '!.git'
```

In recursive mode, this command will parse `*.hbs` and `*.js` files and skip `.git` folder. This options is passed to readdirp. To learn more, read [their documentation](https://github.com/thlorenz/readdirp#filters).

## Work with Meteor TAP-i18N (gulp)**

```js
.pipe(i18next({
    output: "i18n/$LOCALE/$NAMESPACE.$LOCALE.i18n.json",
    locales: ['en', 'de', 'fr', 'es'],
    functions: ['_'],
    namespace: 'client',
    writeOld: false
}))
```

This will output your files in the format `$LOCALE/client.$LOCALE.i18n.json` in a `i18n/` directory.
