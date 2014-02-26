# i18next Parser

A simple command line that lets you parse a directory and extract the translations keys from it.

## Features

- Parse a single file or a directory (recursively or not)
- Write the one json file per locale and per namespace
- Remove old keys your code doesn't use anymore and place them in a file `namespace_old.json`.

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

---

## Next

- Parse more patterns
- Gulp plugin
