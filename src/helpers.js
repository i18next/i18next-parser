// Takes a `path` of the form 'foo.bar' and
// turn it into a hash {foo: {bar: ""}}.
// The generated hash can be attached to an
// optional `hash`.
function hashFromString(path, separator, hash) {
    var parts   = path.split( separator || '.' );
    var tmp_obj = hash || {};
    var obj     = tmp_obj;

    for( var x = 0; x < parts.length; x++ ) {
        if ( x == parts.length - 1 ) {
            tmp_obj[parts[x]] = '';
        }
        else if ( ! tmp_obj[parts[x]] ) {
            tmp_obj[parts[x]] = {};
        }
        tmp_obj = tmp_obj[parts[x]];
    };
    return obj;
}


// Takes a `source` hash and make sure its value
// are pasted in the `target` hash, if the target
// hash has the corresponding key. If not, the
// value is added to an `old` hash.
function mergeHash(source, target, old) {
    var target = target || {};
    var old    = old || {};

    Object.keys(source).forEach(function (key) {
        if ( target[key] !== undefined ) {
            if (typeof source[key] === 'object') {
                var nested = mergeHash( source[key], target[key], old[key] );
                target[key] = nested['new']
                old[key] = nested['old']
            }
            else {
                target[key] = source[key]
            }
        }
        else {
            pluralMatch = /_plural(_\d+)?$/.test( key );
            singularKey = key.replace( /_plural(_\d+)?$/, '' );

            if ( pluralMatch && target[singularKey] !== undefined ) {
                target[key] = source[key]
            }
            else {
                old[key] = source[key]
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
    var target = target || {};

    Object.keys(source).forEach(function (key) {
        if ( target[key] !== undefined ) {
            if (typeof source[key] === 'object') {
                var nested = replaceEmpty( source[key], target[key] );
                target[key] = nested
            }
            else if ( target[key] === '' ) {
                target[key] = source[key]
            }
        }
    });

    return target;
}



module.exports = {
    hashFromString: hashFromString,
    mergeHash: mergeHash,
    replaceEmpty: replaceEmpty
}