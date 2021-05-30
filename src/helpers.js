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
  if (options.suffix || options.suffix === 0) {
    path += `${options.pluralSeparator}${options.suffix}`
  }

  const separator = options.separator || '.'

  const key = entry.keyWithNamespace.substring(
    entry.keyWithNamespace.indexOf(separator) + separator.length,
    entry.keyWithNamespace.length
  )

  // There is no key to process so we return an empty object
  if (!key) {
    target[entry.namespace] = {}
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
    entry[`defaultValue_${options.suffix}`] ||
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
    conflict = typeof oldValue !== typeof newValue ? 'key' : 'value'
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
 * hash has the corresponding key (or if `keepRemoved` is true).
 * @returns An `{ old, new, mergeCount, pullCount, oldCount }` object.
 * `old` is a hash of values that have not been merged into `target`.
 * `new` is `target`. `mergeCount` is the number of keys merged into
 * `new`, `pullCount` is the number of context and plural keys added to
 * `new` and `oldCount` is the number of keys that were either added to `old` or
 * `new` (if `keepRemoved` is true and `target` didn't have the corresponding
 * key).
 */
function mergeHashes(source, target, keepRemoved = false) {
  let old = {}
  let mergeCount = 0
  let pullCount = 0
  let oldCount = 0
  for (const key in source) {
    const hasNestedEntries =
      typeof target[key] === 'object' && !Array.isArray(target[key])

    if (hasNestedEntries) {
      const nested = mergeHashes(source[key], target[key], keepRemoved)
      mergeCount += nested.mergeCount
      pullCount += nested.pullCount
      if (Object.keys(nested.old).length) {
        old[key] = nested.old
        oldCount += nested.oldCount
      }
    } else {
      if (target[key] !== undefined) {
        if (typeof source[key] === 'string' || Array.isArray(source[key])) {
          target[key] = source[key]
          mergeCount += 1
        } else {
          old[key] = source[key]
          oldCount += 1
        }
      } else {
        // support for plural in keys
        const pluralRegex = /(_plural)|(_\d+)$/
        const pluralMatch = pluralRegex.test(key)
        const singularKey = key.replace(pluralRegex, '')

        // support for context in keys
        const contextRegex = /_([^_]+)?$/
        const contextMatch = contextRegex.test(singularKey)
        const rawKey = singularKey.replace(contextRegex, '')

        if (
          (contextMatch && target[rawKey] !== undefined) ||
          (pluralMatch && target[singularKey] !== undefined)
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
  }

  return { old, new: target, mergeCount, pullCount, oldCount }
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

export { dotPathToHash, mergeHashes, transferValues }
