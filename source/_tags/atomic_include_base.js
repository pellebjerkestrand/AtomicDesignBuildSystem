var base = require('../../node_modules/gulp-swig/node_modules/swig/lib/tags/include.js');

var ignore = 'ignore',
    missing = 'missing',
    only = 'only';

var types = [
    'atom',
    'molecule',
    'organism',
    'template'
];

exports.compile = function(compiler, args, type){
    if(types.indexOf(type) === -1){
        return '_output += "Unsupported type";';
    }

    var copy = args.slice();

    var file = copy.shift(),
        onlyIdx = copy.indexOf(only),
        onlyCtx = onlyIdx !== -1 ? copy.splice(onlyIdx, 1) : false,
        parentFile = (copy.pop() || '').replace(/\\/g, '\\\\'),
        ignore = copy[copy.length - 1] === missing ? (copy.pop()) : false,
        w = copy.join('');

    for(var i = 0; i < args.length; i++){
        if(args[i] === file){
            args[i] = file.slice(0, -1) + ".html\"";
        } else if(args[i] === parentFile){
            var slugs = args[i].split('/'),
                length = slugs.length;

            for(var j = length; j-- > 0;){
                if(slugs[j] !== 'source'){
                    slugs.pop();
                } else {
                    slugs.push(type + 's');
                    slugs.push('placeholder');
                    break;
                }
            }

            args[i] = slugs.join('/');
        }
    }

    return base.compile(compiler, args);
};

exports.parse = base.parse;