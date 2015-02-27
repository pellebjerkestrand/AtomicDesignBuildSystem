/* Used like a specialized import: {% template frontpage %} */

var base = require('./atomic_include_base.js'),
    tag = 'template';

exports.tag = tag;

exports.compile = function(compiler, args){
    return base.compile(compiler, args, tag);
};

exports.parse = base.parse;