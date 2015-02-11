/* Used like a specialized import: {% organism menu %} */

var base = require('./atomic_include_base.js'),
    tag = 'organism';

exports.tag = tag;

exports.compile = function(compiler, args){
    return base.compile(compiler, args, tag);
};

exports.parse = base.parse;