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

### CLI

Add the `locales` option to the config file:

```js
{
  locales: ['en', 'de', 'sp']
}
```

### Gulp

```js
.pipe(i18next({ locales: ['en', 'de', 'sp'] })
```

## Changing the default namespace

This will add all the translation from the default namespace in the file `locales/en/my_default_namespace.json`

### Command line

Add the `namespace` option to the config file:

```js
{
  namespace: 'my_default_namespace'
}
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

Add the `namespaceSeparator` or `keySeparator` option to the config file:

```js
{
  namespaceSeparator: '?',
  keySeparator: '_'
}
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

Add the `function` property to the related lexer in the config file:

```js
{
  lexers: {
    js: [
      {
        lexer: 'JavascriptLexer',
        functions: ['t', 'TAPi18n.__', '__'],
      },
    ]
  }
}
```

Add the `parseGenerics` (as well as `typeMap`) if you want to parse the data from the generic types in typescript

```js
{
  lexers: {
    js: [
      {
        lexer: 'JavascriptLexer',
        parseGenerics: true,
        typeMap: { CountType: { count: '' } },
      },
    ]
  }
}
```

So that the parser can detect typescript code like :

```ts
const MyKey T<{count: number}>('my_key');

type CountType = {count : number};
const MyOtherKey = T<CountType>('my_other_key');

i18next.t(MyKey, {count: 1});
i18next.t(MyOtherKey, {count: 2});
```

and generate the correct keys

```js
{
  lexers: {
    js: [
      {
        lexer: 'JavascriptLexer',
        functions: ['t', 'TAPi18n.__', '__'],
      },
    ]
  }
}
```

Please note that:

- We don't match the closing parenthesis, as you might want to pass arguments to your translation function;
- The parser is smart about escaped quotes (single or double) you may have in your key.

## Work with Meteor TAP-i18N (gulp)\*\*

en', 'de', 'sp

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
