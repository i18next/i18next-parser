var Transform = require('stream').Transform;
var util = require('util');


function Parser(options, transformConfig) {
    transformConfig = transformConfig || {};
    transformConfig.objectMode = true;
    Transform.call(this, transformConfig);

    this.defaultNamespace = options.defaultNamespace;
    this.functions = options.functions;
    this.regex = options.regex;
}
util.inherits(Parser, Transform);

Parser.prototype._transform = function(data, encoding, done) {

    fnPattern = '(' + this.functions.join(')|(').replace('.', '\\.') + ')'
    pattern = '[^a-zA-Z0-9]('+fnPattern+')(\\(|\\s)\\s*((\'((\\\\\')?[^\']+)+[^\\\\]\')|("((\\\\")?[^"]+)+[^\\\\]"))'
    regex = new RegExp( this.regex || pattern, 'g' )
    this.functions

    matches = data.toString().match(regex) || []
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