var Transform = require('stream').Transform;
var util = require('util');
var fs = require('fs');


function IsFile(options) {
    options = options || {};
    options.objectMode = true;
    Transform.call(this, options);
}
util.inherits(IsFile, Transform);

IsFile.prototype._transform = function(data, encoding, done) {

    // Make sure it is a buffer
    if ( ! Buffer.isBuffer(data) && data.fullPath ) {
        data = fs.readFileSync(data.fullPath);
    }

    this.push( data );
    done();
};

module.exports = new IsFile();