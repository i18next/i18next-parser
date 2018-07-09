/**
 * Take an entry for the Parser and turn it into a hash,
 * turning the key path 'foo.bar' into an hash {foo: {bar: ""}}
 * The generated hash can be merged with an optional `target`.
 * @returns An `{ target, duplicate }` object. `target` is the hash that
 * was passed as an argument or a new hash if none was passed. `duplicate`
 * indicates whether the entry already existed in the `target` hash.
 */
function dotPathToHash(entry, target = {}, options = {}) {
  let path = entry.key
  const separator = options.separator || '.'
  const newValue = entry.defaultValue || options.value || ''

  if (path.endsWith(separator)) {
    path = path.slice(0, -separator.length)
  }

  const segments = path.split(separator)
  let inner = target
  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i]
    if (segment) {
      if (inner[segment] === undefined) {
        inner[segment] = {}
      }
      inner = inner[segment]
    }
  }

  const lastSegment = segments[segments.length - 1];
  const oldValue = inner[lastSegment];
  const duplicate = oldValue !== undefined
  const conflict = oldValue !== undefined && oldValue !== newValue
  inner[lastSegment] = newValue

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
      const nested = mergeHashes(
        source[key],
        target[key],
        old[key],
        keepRemoved
      )
      mergeCount += nested.mergeCount
      pullCount += nested.pullCount
      if (Object.keys(nested.old).length) {
        old[key] = nested.old
        oldCount += nested.oldCount
      }
    }
    else {
      if (target[key] !== undefined) {
        if (
          typeof source[key] === 'string' ||
          Array.isArray(source[key])
        ) {
          target[key] = source[key]
          mergeCount += 1
        } else {
          old[key] = source[key]
          oldCount += 1
        }
      }
      else {
        // support for plural in keys
        const pluralRegex = /_plural(_\d+)?$/;
        const pluralMatch = pluralRegex.test(key)
        const singularKey = key.replace(pluralRegex, '')
    
        // support for context in keys
        const contextRegex = /_([^_]+)?$/;
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
    }
    else {
      target[key] = sourceValue;
    }
  }
}

class ParsingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ParsingError';
  }
}

export {
  dotPathToHash,
  mergeHashes,
  transferValues,
  ParsingError
}
