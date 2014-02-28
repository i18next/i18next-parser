# i18next Parser

A simple command line that lets you parse your code and extract the translations keys in it.

## Features

- Parses a single file or a directory (recursively or not)
- Creates one json file per locale and per namespace.
- Remove old keys your code doesn't use anymore and place them in a `namespace_old.json` file. It is usefull to avoid losing translations you may want to reuse.

## Installation

```
npm install i18next-parser -g
```

---

## Usage

`i18next /path/to/file/or/dir [-orpfnl]`

- **-o, --output <directory>**: Where to write the locale files.
- **-r, --recursive**: Is --output is a directory, parses files in sub directories.
- **-f, --function <list>**: Function names to parse. Defaults to `t,i18n.t`
- **-p, --parser <string>**: A custom regex for the parser to use.
- **-n, --namespace <string>**: Default namespace in i18next. Defaults to `translation`
- **-l, --locales <list>**: The locales in your applications. Defaults to `en,fr`

---

## Exemples

**Parse single file or directory**

`i18next /path/to/file/or/dir`

It will create the following files in the directory from which you run the command:

```
locales/en/translation.json
locales/en/namespace1.json
locales/en/translation_old.json
locales/en/namespace1_old.json
locales/fr/translation.json
locales/fr/namespace1.json
locales/fr/translation_old.json
locales/fr/namespace1_old.json
...
```

**Change the output directory**

`i18next /path/to/file/or/dir -o /output/directory`

It will create the file in the specified folder:

```
/output/directory/en/translation.json
...
```

**Change the locales**

`i18next /path/to/file/or/dir -l en,de,sp`

This will create a directory per locale in the output folder:

```
locales/en/...
locales/de/...
locales/sp/...
```

**Change the default namespace**

`i18next /path/to/file/or/dir -n my_default_namespace`

This will add all the translation from the default namespace in the following file:

```
locales/en/my_default_namespace.json
...
```

**Filter files and folders**

`i18next /path/to/file/or/dir -filterFolder *.hbs,*.js -filterFolder !.git`

In recursive mode, it will parse `*.hbs` and `*.js` files and skip `.git` folder. This options is passed to readdirp. To learn more, read [their documentation](https://github.com/thlorenz/readdirp#filters).

**Change the translation functions**

`i18next /path/to/file/or/dir -f __,_e`

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

**Change the regex**

`i18next /path/to/file/or/dir -r "(.*)"`

You must pass the regex as a string. That means that you will have to properly escape it.

The regex used by default is:

`/[^a-zA-Z0-9]((t)|(i18n\.t))(\(|\s)\s*(('((\\')?[^']+)+[^\\]')|("((\\")?[^"]+)+[^\\]"))/g`


---

## Next

- Gulp plugin
