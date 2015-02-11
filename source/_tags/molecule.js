/* Used like a specialized import: {% molecule links %} */

var base = require('./atomic_include_base.js'),
    tag = 'molecule';

exports.tag = tag;

exports.compile = function(compiler, args){
    return base.compile(compiler, args, tag);
};

exports.parse = base.parse;