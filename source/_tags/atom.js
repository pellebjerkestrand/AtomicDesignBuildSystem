/* Used like a specialized import: {% atom link %} */

var base = require('./atomic_include_base.js'),
    tag = 'atom';

exports.tag = tag;

exports.compile = function(compiler, args){
    return base.compile(compiler, args, tag);
};

exports.parse = base.parse;