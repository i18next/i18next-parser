
function hashFromString(path, hash) {
    var parts   = path.split('.');
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
            old[key] = source[key]
        }
    });

    return {
        'new': target, 
        'old': old
    };
}

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