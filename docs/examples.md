# Examples

**Change the output directory (cli and gulp)**

Command line (the options are identical):

`i18next /path/to/file/or/dir -o /translations/$LOCALE/$NAMESPACE.json`

`i18next /path/to/file/or/dir:/translations/$LOCALE/$NAMESPACE.json`

Gulp:

`.pipe(i18next({output: 'translations/$LOCALE/$NAMESPACE.json'}))`

It will create the file in the specified folder (in case of gulp it doesn't actually create the files until you call `dest()`):

```
/translations/en/translation.json
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

<!-- TODO removed -->

`i18next /path/to/file/or/dir --fileFilter '*.hbs,*.js' --directoryFilter '!.git'`

In recursive mode, it will parse `*.hbs` and `*.js` files and skip `.git` folder. This options is passed to readdirp. To learn more, read [their documentation](https://github.com/thlorenz/readdirp#filters).



**Work with Meteor TAP-i18N (gulp)**

`.pipe(i18next({
    output: "i18n/$LOCALE/$NAMESPACE.$LOCALE.i18n.json",
    locales: ['en', 'de', 'fr', 'es'],
    functions: ['_'],
    namespace: 'client',
    writeOld: false
}))`

This will output your files in the format `$LOCALE/client.$LOCALE.i18n.json` in a `i18n/` directory.
