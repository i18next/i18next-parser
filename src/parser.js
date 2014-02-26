var Transform = require('stream').Transform;
var util = require('util');


function Parser(options, transformConfig) {
    transformConfig = transformConfig || {};
    transformConfig.objectMode = true;
    Transform.call(this, transformConfig);

    this.defaultNamespace = options.defaultNamespace;
}
util.inherits(Parser, Transform);

Parser.prototype._transform = function(data, encoding, done) {

    matches = data.toString().match(/t\(\s*(('((\\')?[^']+)+[^\\]')|("((\\")?[^"]+)+[^\\]"))/g) || []
    self = this
    if (matches && matches.length) {
        matches = matches.map(function(match) {
            match = match.substring(3, match.length-1)

            // Ensure there is a namespace
            if (match.indexOf(':') == -1) {
                match = self.defaultNamespace+'.'+match
            }
            else {
                match = match.replace(':', '.');
            }

            return match
        });
    }

    this.push( matches );
    done();
};

module.exports = function(options, transformConfig) {
    return new Parser(options, transformConfig);
};