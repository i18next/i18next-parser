// Takes a `path` of the form 'foo.bar' and
// turn it into a hash {foo: {bar: ""}}.
// The generated hash can be attached to an
// optional `hash`.
function hashFromString(path, separator, value, hash) {
    separator = separator || '.';

    if ( path.indexOf( separator, path.length - separator.length ) >= 0 ) {
        path = path.slice( 0, -separator.length );
    }

    var parts   = path.split( separator );
    var tmp_obj = hash || {};
    var obj     = tmp_obj;

    for( var x = 0; x < parts.length; x++ ) {
        if ( x == parts.length - 1 ) {
            tmp_obj[parts[x]] = value || '';
        }
        else if ( ! tmp_obj[parts[x]] ) {
            tmp_obj[parts[x]] = {};
        }
        tmp_obj = tmp_obj[parts[x]];
    }
    return obj;
}


// Takes a `source` hash and make sure its value
// are pasted in the `target` hash, if the target
// hash has the corresponding key (or if keepRemoved is true).
// If not, the value is added to an `old` hash.
function mergeHash(source, target, old, keepRemoved) {
    target = target || {};
    old    = old || {};

    Object.keys(source).forEach(function (key) {
        if ( target[key] !== undefined ) {
            if (typeof source[key] === 'object' && source[key].constructor !== Array) {
                var nested = mergeHash( source[key], target[key], old[key], keepRemoved );
                target[key] = nested.new;
                old[key] = nested.old;
            }
            else {
                target[key] = source[key];
            }
        }
        else {
            // support for plural in keys
            pluralMatch = /_plural(_\d+)?$/.test( key );
            singularKey = key.replace( /_plural(_\d+)?$/, '' );

            // support for context in keys
            contextMatch = /_([^_]+)?$/.test( singularKey );
            rawKey = singularKey.replace( /_([^_]+)?$/, '' );

            if (
              ( contextMatch && target[rawKey] !== undefined ) ||
              ( pluralMatch && target[singularKey] !== undefined )
            ) {
                target[key] = source[key];
            }
            else {
                if (keepRemoved) {
                  target[key] = source[key];
                }
                old[key] = source[key];
            }
        }
    });

    return {
        'new': target,
        'old': old
    };
}


// Takes a `target` hash and replace its empty
// values with the `source` hash ones if they
// exist
function replaceEmpty(source, target) {
    target = target || {};

    Object.keys(source).forEach(function (key) {
        if ( target[key] !== undefined ) {
            if (typeof source[key] === 'object') {
                var nested = replaceEmpty( source[key], target[key] );
                target[key] = nested;
            }
            else if ( target[key] === '' ) {
                target[key] = source[key];
            }
        }
    });

    return target;
}



module.exports = {
    hashFromString: hashFromString,
    mergeHash: mergeHash,
    replaceEmpty: replaceEmpty
};
