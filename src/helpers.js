/**
 * Take an entry for the Parser and turn it into a hash,
 * turning the key path 'foo.bar' into an hash {foo: {bar: ""}}
 * The generated hash can be merged with an optional `target`.
 * @returns An `{ target, duplicate, conflict }` object. `target` is the hash
 * that was passed as an argument or a new hash if none was passed. `duplicate`
 * indicates whether the entry already existed in the `target` hash. `conflict`
 * is `"key"` if a parent of the key was already mapped to a string (e.g. when
 * merging entry {one: {two: "bla"}} with target {one: "bla"}) or the key was
 * already mapped to a map (e.g. when merging entry {one: "bla"} with target
 * {one: {two: "bla"}}), `"value"` if the same key already exists with a
 * different value, or `false`.
 */
function dotPathToHash(entry, target = {}, options = {}) {
  let conflict = false
  let duplicate = false
  let path = entry.keyWithNamespace
  if (options.suffix) {
    path += options.suffix
  }

  const separator = options.separator || '.'

  const key = entry.keyWithNamespace.substring(
    entry.keyWithNamespace.indexOf(separator) + separator.length,
    entry.keyWithNamespace.length
  )

  // There is no key to process so we return an empty object
  if (!key) {
    if (!target[entry.namespace]) {
      target[entry.namespace] = {}
    }
    return { target, duplicate, conflict }
  }

  const defaultValue =
    typeof options.value === 'function'
      ? options.value(options.locale, entry.namespace, key)
      : options.value

  const skipDefaultValues =
    typeof options.skipDefaultValues === 'function'
      ? options.skipDefaultValues(options.locale, entry.namespace)
      : options.skipDefaultValues

  const useKeysAsDefaultValue =
    typeof options.useKeysAsDefaultValue === 'function'
      ? options.useKeysAsDefaultValue(options.locale, entry.namespace)
      : options.useKeysAsDefaultValue

  let newValue =
    entry[`defaultValue${options.suffix}`] ||
    entry.defaultValue ||
    defaultValue ||
    ''

  if (skipDefaultValues) {
    newValue = ''
  }

  if (useKeysAsDefaultValue) {
    newValue = key
  }

  if (path.endsWith(separator)) {
    path = path.slice(0, -separator.length)
  }

  const segments = path.split(separator)
  let inner = target
  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i]
    if (segment) {
      if (typeof inner[segment] === 'string') {
        conflict = 'key'
      }
      if (inner[segment] === undefined || conflict) {
        inner[segment] = {}
      }
      inner = inner[segment]
    }
  }

  const lastSegment = segments[segments.length - 1]
  const oldValue = inner[lastSegment]
  if (oldValue !== undefined && oldValue !== newValue) {
    if (typeof oldValue !== typeof newValue) {
      conflict = 'key'
    } else if (oldValue !== '') {
      if (newValue === '') {
        newValue = oldValue
      } else {
        conflict = 'value'
      }
    }
  }
  duplicate = oldValue !== undefined || conflict !== false

  if (options.customValueTemplate) {
    inner[lastSegment] = {}

    const entries = Object.entries(options.customValueTemplate)
    entries.forEach((valueEntry) => {
      if (valueEntry[1] === '${defaultValue}') {
        inner[lastSegment][valueEntry[0]] = newValue
      } else {
        inner[lastSegment][valueEntry[0]] =
          entry[valueEntry[1].replace(/\${(\w+)}/, '$1')] || ''
      }
    })
  } else {
    inner[lastSegment] = newValue
  }

  return { target, duplicate, conflict }
}

/**
 * Takes a `source` hash and makes sure its value
 * is pasted in the `target` hash, if the target
 * hash has the corresponding key (or if `options.keepRemoved` is true).
 * @returns An `{ old, new, mergeCount, pullCount, oldCount, reset, resetCount }` object.
 * `old` is a hash of values that have not been merged into `target`.
 * `new` is `target`. `mergeCount` is the number of keys merged into
 * `new`, `pullCount` is the number of context and plural keys added to
 * `new` and `oldCount` is the number of keys that were either added to `old` or
 * `new` (if `options.keepRemoved` is true and `target` didn't have the corresponding
 * key) and `reset` is the keys that were reset due to not matching default values,
 *  and `resetCount` which is the number of keys reset.
 */
function mergeHashes(source, target, options = {}, resetValues = {}) {
  let old = {}
  let reset = {}
  let mergeCount = 0
  let pullCount = 0
  let oldCount = 0
  let resetCount = 0

  const keepRemoved = options.keepRemoved || false
  const pluralSeparator = options.pluralSeparator || '_'

  for (const key in source) {
    const hasNestedEntries =
      typeof target[key] === 'object' && !Array.isArray(target[key])

    if (hasNestedEntries) {
      const nested = mergeHashes(source[key], target[key], options)
      mergeCount += nested.mergeCount
      pullCount += nested.pullCount
      oldCount += nested.oldCount
      if (Object.keys(nested.old).length) {
        old[key] = nested.old
      }
    } else if (target[key] !== undefined) {
      if (typeof source[key] !== 'string' && !Array.isArray(source[key])) {
        old[key] = source[key]
        oldCount += 1
      } else {
        if (
          (options.resetAndFlag &&
            !isPlural(key) &&
            typeof source[key] === 'string' &&
            source[key] !== target[key]) ||
          resetValues[key]
        ) {
          old[key] = source[key]
          oldCount += 1
          reset[key] = true
          resetCount += 1
        } else {
          target[key] = source[key]
          mergeCount += 1
        }
      }
    } else {
      // support for plural in keys
      const singularKey = getSingularForm(key, pluralSeparator)
      const pluralMatch = key !== singularKey

      // support for context in keys
      const contextRegex = /_([^_]+)?$/
      const contextMatch = contextRegex.test(singularKey)
      const rawKey = singularKey.replace(contextRegex, '')

      if (
        (contextMatch && target[rawKey] !== undefined) ||
        (pluralMatch &&
          hasRelatedPluralKey(`${singularKey}${pluralSeparator}`, target))
      ) {
        target[key] = source[key]
        pullCount += 1
      } else {
        if (keepRemoved) {
          target[key] = source[key]
        } else {
          old[key] = source[key]
        }
        oldCount += 1
      }
    }
  }

  return {
    old,
    new: target,
    mergeCount,
    pullCount,
    oldCount,
    reset,
    resetCount,
  }
}

/**
 * Merge `source` into `target` by merging nested dictionaries.
 */
function transferValues(source, target) {
  for (const key in source) {
    const sourceValue = source[key]
    const targetValue = target[key]
    if (
      typeof sourceValue === 'object' &&
      typeof targetValue === 'object' &&
      !Array.isArray(sourceValue)
    ) {
      transferValues(sourceValue, targetValue)
    } else {
      target[key] = sourceValue
    }
  }
}

const pluralSuffixes = ['zero', 'one', 'two', 'few', 'many', 'other']

function isPlural(key) {
  return pluralSuffixes.some((suffix) => key.endsWith(suffix))
}

function hasRelatedPluralKey(rawKey, source) {
  return pluralSuffixes.some(
    (suffix) => source[`${rawKey}${suffix}`] !== undefined
  )
}

function getSingularForm(key, pluralSeparator) {
  const pluralRegex = new RegExp(
    `(\\${pluralSeparator}(?:zero|one|two|few|many|other))$`
  )

  return key.replace(pluralRegex, '')
}

function getPluralSuffixPosition(key) {
  for (let i = 0, len = pluralSuffixes.length; i < len; i++) {
    if (key.endsWith(pluralSuffixes[i])) return i
  }

  return -1
}

function makeDefaultSort(pluralSeparator) {
  return function defaultSort(key1, key2) {
    const singularKey1 = getSingularForm(key1, pluralSeparator)
    const singularKey2 = getSingularForm(key2, pluralSeparator)

    if (singularKey1 === singularKey2) {
      return getPluralSuffixPosition(key1) - getPluralSuffixPosition(key2)
    }

    return singularKey1.localeCompare(singularKey2)
  }
}

export {
  dotPathToHash,
  mergeHashes,
  transferValues,
  hasRelatedPluralKey,
  getSingularForm,
  getPluralSuffixPosition,
  makeDefaultSort,
}
