import _ from 'lodash'

// Turn an entry for the Parser and turn in into a hash,
// turning the key path 'foo.bar' into an hash {foo: {bar: ""}}
// The generated hash can be attached to an optional `target`.
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

// Takes a `source` hash and make sure its value
// are pasted in the `target` hash, if the target
// hash has the corresponding key (or if keepRemoved is true).
// If not, the value is added to an `old` hash.
function mergeHashes(source, target = {}, old, keepRemoved = false) {
  old = old || {}
  Object.keys(source).forEach(key => {
    const hasNestedEntries =
      typeof target[key] === 'object' && !Array.isArray(target[key])

    if (hasNestedEntries) {
      const nested = mergeHashes(
        source[key],
        target[key],
        old[key],
        keepRemoved
      )
      target[key] = nested.new
      old[key] = nested.old
    }
    else if (target[key] !== undefined) {
      if (typeof source[key] === 'string' || Array.isArray(source[key])) {
        target[key] = source[key]
      }
      else {
        old[key] = source[key]
      }
    }
    else {
      // support for plural in keys
      const pluralMatch = /_plural(_\d+)?$/.test(key)
      const singularKey = key.replace(/_plural(_\d+)?$/, '')

      // support for context in keys
      const contextMatch = /_([^_]+)?$/.test(singularKey)
      const rawKey = singularKey.replace(/_([^_]+)?$/, '')

      if (
        (contextMatch && target[rawKey] !== undefined) ||
        (pluralMatch && target[singularKey] !== undefined)
      ) {
        target[key] = source[key]
      }
      else if (keepRemoved) {
        target[key] = source[key]
        old[key] = source[key]
      }
      else {
        old[key] = source[key]
      }
    }
  })

  return { old, new: target }
}

// Takes a `target` hash and replace its empty
// values with the `source` hash ones if they
// exist
function populateHash(source, target = {}) {
  Object.keys(source).forEach(key => {
    if (target[key] !== undefined) {
      if (typeof source[key] === 'object') {
        target[key] = populateHash(source[key], target[key])
      }
      else if (target[key] === '') {
        target[key] = source[key]
      }
    }
  })

  return target
}


export {
  dotPathToHash,
  mergeHashes,
  populateHash
}
