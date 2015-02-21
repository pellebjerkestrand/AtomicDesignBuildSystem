var meta = require('./package.json');

var project = meta.name.toLowerCase();

var amd = require('amd-optimize'),
    del = require('del'),
    fs = require('fs'),
    gulp = require('gulp'),
    prefix = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    glob = require('gulp-css-globbing'),
    data = require('gulp-data'),
    jshint = require('gulp-jshint'),
    minify = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    swig = require('gulp-swig'),
    uglify = require('gulp-uglify'),
    path = require('path'),
    stylish = require('jshint-stylish'),
    atom = require('./source/_tags/atom.js'),
    molecule = require('./source/_tags/molecule.js'),
    organism = require('./source/_tags/organism.js'),
    template = require('./source/_tags/template.js');

var dist = './dist/' + meta.version + '/',
    source = './source/';

var paths = {
    dist: {
        css: dist,
        js: dist,
        pages: dist + 'pages/'
    },
    source: {
        data: source + 'data/',
        pages: source + 'pages/**/*.html',
        scripts: [
            source + '**/*.js',
            '!' + source + '_tags/*.js'
        ],
        styles: source + 'global/app.scss'
    },
    watch: {
        pages: [
            source + '**/*.html',
            '!' + source + '**/*.tmpl.html',
            source + 'data/**/*.json'
        ],
        scripts: [
            source + '**/*.js',
            source + '**/*.tmpl.html'
        ],
        styles: source + '**/*.scss'
    }
};

var options = {
    amd: {
        baseUrl: 'source',
        paths: {
            app: 'global/app',
            atoms: 'atoms',
            molecules: 'molecules',
            organisms: 'organisms',
            require: '../node_modules/requirejs/require',
            text: '../node_modules/requirejs-text/text',
            ko: '../node_modules/knockout/build/output/knockout-latest'
        }
    },
    prefix: {
        browsers: ['> 1%', 'last 2 versions', 'IE 9', 'Opera 12.1'],
        cascade: true
    },
    glob: {
        extensions: ['.scss']
    },
    swig: {
        setup: function(swig){
            swig.setTag(atom.tag, atom.parse, atom.compile);
            swig.setTag(molecule.tag, molecule.parse, molecule.compile);
            swig.setTag(organism.tag, organism.parse, organism.compile);
            swig.setTag(template.tag, template.parse, template.compile);
        }
    },
    minify: {
        keepSpecialComments: 0
    },
    sourcemaps: {
        includeContent: false,
        sourceRoot: './'
    }
};

var getJson = function(file){
    var dataFile = paths.source.data + path.basename(file.path, '.html') + '.json';

    if(fs.existsSync(dataFile)){
        return require(dataFile);
    }

    return {};
};

gulp.task('clean:css', function(){
    del.sync(paths.dist.css + '*.css');
});

gulp.task('build:css', ['clean:css'], function(){
    return gulp.src(paths.source.styles)
        .pipe(glob(options.glob))
        .pipe(sass())
        .pipe(prefix(options.prefix))
        .pipe(rename(project + '.css'))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(rename(project + '.min.css'))
        .pipe(minify(options.minify))
        .pipe(gulp.dest(paths.dist.css));
});

gulp.task('clean:js', function(){
    del.sync([
        paths.dist.js + '*.js',
        paths.dist.js + '*.map'
    ]);
});

gulp.task('build:js', ['clean:js'], function(){
    gulp.src(paths.source.scripts)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
        .pipe(amd('app', options.amd))
        .pipe(concat(project + '.js'))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({suffix:'.min'}))
        .pipe(sourcemaps.write('./', options.sourcemaps))
        .pipe(gulp.dest(paths.dist.js));
});

gulp.task('clean:html', function(){
    del.sync(paths.dist.pages);
});

gulp.task('build:html', ['clean:html'], function(){
    return gulp.src(paths.source.pages)
        .pipe(data(getJson))
        .pipe(swig(options.swig))
        .pipe(gulp.dest(paths.dist.pages));
});

gulp.task('clean:all', function(){
    del.sync(dist);
});

gulp.task('build:all', ['build:css', 'build:js', 'build:html']);

gulp.task('default', ['build:all']);

gulp.task('watch', function(){
    gulp.watch(paths.watch.pages, ['build:html']);
    gulp.watch(paths.watch.scripts, ['build:js']);
    gulp.watch(paths.watch.styles, ['build:css']);
});