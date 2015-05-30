var beautify = require('js-beautify').html,
	options = {
		"indent_size": 2,
		"wrap-line-length": 0,
		"preserve-newlines": false,
		"end-with-newline": false,
		"brace-style": "expand"
	};

function html(input, idx){
	return beautify(input.replace(/\r?\n|\r/g,""), options);
}

exports.name = "html_beautify";
exports.filter = html;