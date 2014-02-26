var Transform = require('stream').Transform;
var util = require('util');
var fs = require('fs');


function FileBuffer(options) {
    options = options || {};
    options.objectMode = true;
    Transform.call(this, options);
}
util.inherits(FileBuffer, Transform);

FileBuffer.prototype._transform = function(data, encoding, done) {

    // Make sure it is a buffer
    if ( ! Buffer.isBuffer(data) && data.fullPath ) {
        console.log("[parse] ".green + data.fullPath);
        data = fs.readFileSync(data.fullPath);
    }

    this.push( data );
    done();
};

module.exports = function(options) {
    return new FileBuffer(options);
}
