var BEM = require('bem'),
    Q = BEM.require('q'),
    PATH = require('path'),
    SYS = require('util'),
    BEMHTML = require('../../../__html/lib/bemhtml'),

    readFile = BEM.require('./util').readFile;

exports.API_VER = 2;

exports.getBuildResultChunk = function(relPath, path, suffix) {
    var _this = this;

    return readFile(path)
        .then(function(c) {

            _this._chunks.push({
                file: path,
                offset: _this._lastOffset
            });

            var lines = c.split('\n').length;

            //add 4 more lines: 2 comments and 2 between chunks
            _this._lastOffset += lines + 4;

            return [
                '/* ' + path + ': start */',
                c,
                '/* ' + path + ': end */',
                '\n'
            ].join('\n');

        });

};

exports.getBuildResult = function(files, suffix, output, opts) {

    this._chunks = [];
    this._lastOffset = 0;

    var _this = this;
    return this.__base(files, suffix, output, opts)
        .then(function(sources) {
            sources = sources.join('\n');


            try {

                return BEMHTML.translate(sources, {
                  devMode: process.env.BEMHTML_ENV == 'development',
                  cache: process.env.BEMHTML_CACHE == 'on'
                });

            } catch (e) {
                if (e.line) {
                    var source = _this._getSource(e.line);
                    throw new Error(SYS.format('Unable to parse %s. Error at %d:%d',
                        source.file,
                        source.line,
                        e.column));
                }
                throw e;
            }

        });

};

exports._getSource = function _getSource(line) {
    if (this._chunks.length === 0) {
        return;
    } else if (this._chunks.length === 1) {
        return {
            file: this._chunks[0].file,
            offset: line - 1 //top comment line, added by tech
        };
    }

    var i = 0;

    while (line >= this._chunks[i + 1].offset) {
        i++;
    }

    return {
        file: this._chunks[i].file,
        //-1 = top comment line, added by tech
        line: line - this._chunks[i].offset - 1
    };
};

exports.getBuildSuffixesMap = function() {
    return {
        'bemhtml.js': ['bemhtml']
    };
}
