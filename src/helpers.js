import _ from 'lodash'

/**
 * Turn an entry for the Parser and turn in into a hash,
 * turning the key path 'foo.bar' into an hash {foo: {bar: ""}}
 * The generated hash can be attached to an optional `target`.
 */
function dotPathToHash(entry, target = {}, options = {}) {
  let path = entry.key
  const separator = options.separator || '.'
  const value = entry.defaultValue || options.value || ''

  if (path.endsWith(separator)) {
    path = path.slice(0, -separator.length)
  }

  let result = {}
  const segments = path.split(separator)

  segments.reduce((hash, segment, index) => {
    if (!segment) {
      return hash
    }
    else if (index === segments.length - 1) {
      hash[segment] = value
    }
    else {
      hash[segment] = {}
    }
    return hash[segment]
  }, result)

  return _.merge(target, result)
}

/**
 * Takes a `source` hash and makes sure its value
 * is pasted in the `target` hash, if the target
 * hash has the corresponding key (or if `keepRemoved` is true).
 * @returns An `{ old, new }` object. `old` is a hash of
 * values that have not been merged into `target`. `new` is `target`.
 */
function mergeHashes(source, target, keepRemoved = false) {
  let old = {}
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
      if (Object.keys(nested.old).length) {
        old[key] = nested.old
      }
    }
    else {
      let isKeyMergeable
      if (target[key] !== undefined) {
        isKeyMergeable = (
          typeof source[key] === 'string' ||
          Array.isArray(source[key])
        )
      }
      else {
        // support for plural in keys
        const pluralMatch = /_plural(_\d+)?$/.test(key)
        const singularKey = key.replace(/_plural(_\d+)?$/, '')

        // support for context in keys
        const contextMatch = /_([^_]+)?$/.test(singularKey)
        const rawKey = singularKey.replace(/_([^_]+)?$/, '')

        isKeyMergeable = (
          (contextMatch && target[rawKey] !== undefined) ||
          (pluralMatch && target[singularKey] !== undefined) ||
          keepRemoved
        )
      }
      if (isKeyMergeable) {
        target[key] = source[key]
      } else {
        old[key] = source[key]
      }
    }
  }

  return { old, new: target }
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
