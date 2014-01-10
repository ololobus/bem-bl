var BEM = require('bem'),
    Q = BEM.require('q'),
    PATH = require('path'),
    SYS = require('util'),
    BEMHTML = require('../../../__html/lib/bemhtml'),

    readFile = BEM.require('./util').readFile;

exports.API_VER = 2;

exports.getBuildResultChunk = function(relPath, path, suffix) {

    return readFile(path)
        .then(function(c) {

            try {
                //try to parse BEMHTML. If it fails, bem-tools
                //will report error with original file offsets.
                BEMHTML.parse(c);
            } catch (e) {
                return Q.reject(new Error('Unable to parse ' + path + ': ' + e.message));

            }

            return [
                '/* ' + path + ': start */',
                c,
                '/* ' + path + ': end */',
                '\n'
            ].join('\n');

        });

};

exports.getBuildResult = function(files, suffix, output, opts) {

    var _this = this;
    return this.__base(files, suffix, output, opts)
        .then(function(sources) {
            sources = sources.join('\n');

            return BEMHTML.translate(sources, {
              devMode: process.env.BEMHTML_ENV == 'development',
              cache: process.env.BEMHTML_CACHE == 'on'
            });

        });

};

exports.getBuildSuffixesMap = function() {
    return {
        'bemhtml.js': ['bemhtml']
    };
}
