var meta = require('./package.json');

var project = meta.name.toLowerCase();

var amd = require('amd-optimize'),
    del = require('del'),
    fs = require('fs'),
    gulp = require('gulp'),
    prefix = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    file = require('gulp-file'),
    glob = require('gulp-css-globbing'),
    data = require('gulp-data'),
    filter = require('gulp-filter'),
    jshint = require('gulp-jshint'),
    minify = require('gulp-minify-css'),
    order = require('gulp-order'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    swig = require('gulp-swig'),
    uglify = require('gulp-uglify'),
    path = require('path'),
    stylish = require('jshint-stylish'),
    html_beautify = require('./source/_filters/html-beautify.js'),
    atom = require('./source/_tags/atom.js'),
    molecule = require('./source/_tags/molecule.js'),
    organism = require('./source/_tags/organism.js'),
    template = require('./source/_tags/template.js');

var dist = './dist/',
    version = dist + meta.version + '/',
    latest = 'latest.json',
    source = './source/';

var paths = {
    dist: {
        latest: dist + latest,
        css: version,
        js: version,
        pages: version + 'pages/',
        images: version + 'images/',
        guide: {
            css: version + 'guide/',
            root: version + 'guide/',
            index: version + 'guide/index.html',
            atoms: version + 'guide/atoms.html',
            molecules: version + 'guide/molecules.html',
            organisms: version + 'guide/organisms.html'
        }
    },
    source: {
        data: source + 'data/',
        pages: source + 'pages/**/*.html',
        scripts: [
            source + '**/*.js',
            '!' + source + '_filters/*.js',
            '!' + source + '_guide/*.js',
            '!' + source + '_tags/*.js'
        ],
        styles: source + 'global/app.scss',
        images: source + 'images/**/*.*',
        guide: {
            styles: source + '_guide/style.scss',
            index: source + '_guide/index.html',
            html: source + '_guide/components.html',
            scripts: source + '_guide/*.js'
        },
        index: source + 'index/*.*'
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
            ko: '../node_modules/knockout/build/output/knockout-latest',
            components: 'components',
            modules: 'modules'
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
            swig.setDefaults({
                cache: false
            });

            swig.setFilter(html_beautify.name, html_beautify.filter);
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

var getComponents = function(componentDirectory, componentType){
    var files = fs.readdirSync(componentDirectory),
        components = [];

    files = files.filter(function(element, index, array){
        return element.indexOf('.json') > -1;
    });

    for(var i = 0; i < files.length; i++){
        var filePath = componentDirectory + '/' + files[i];
        if(fs.existsSync(filePath)){
            var component = require(filePath);

            components.push({
                name:  component.name || files[i].replace('.json', ''),
                description: component.description || '',
                file: '../' + componentType + 's/' + files[i].replace('json', 'html'),
                variations: component.variations || []
            });
        }
    }

    return components;
};

gulp.task('clean:css', function(){
    del.sync(paths.dist.css + '*.css');
});

gulp.task('build:css', ['clean:css'], function(){
    return gulp.src(paths.source.styles)
        .pipe(plumber())
        .pipe(glob(options.glob))
        .pipe(sass())
        .pipe(prefix(options.prefix))
        .pipe(rename(project + '.css'))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(rename(project + '.min.css'))
        .pipe(minify(options.minify))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(filter('**/*.css'));
});

gulp.task('clean:js', function(){
    del.sync([
        paths.dist.js + '*.js',
        paths.dist.js + '*.map'
    ]);
});

gulp.task('build:js', ['clean:js'], function(){
    gulp.src(paths.source.scripts)
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
        .pipe(amd('app', options.amd))
        .pipe(order([
            '**/require.js',
            '**/*.js'
        ]))
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
        .pipe(plumber())
        .pipe(data(getJson))
        .pipe(swig(options.swig))
        .pipe(gulp.dest(paths.dist.pages));
});

gulp.task('clean:images', function(){
    del.sync(paths.dist.images);
});

gulp.task('build:images', ['clean:images'], function(){
    return gulp.src(paths.source.images)
        .pipe(plumber())
        .pipe(gulp.dest(paths.dist.images));
});

gulp.task('clean:atoms', function(){
    del.sync(paths.dist.guide.atoms);
});

gulp.task('build:atoms', ['clean:atoms'], function(){
    var components = getComponents('./source/atoms', 'atom');

    return gulp.src(paths.source.guide.html)
        .pipe(plumber())
        .pipe(data(function(){
            return {
                id: 'atoms',
                title: 'Atoms',
                components: components
            };
        }))
        .pipe(swig(options.swig))
        .pipe(rename('atoms.html'))
        .pipe(gulp.dest(paths.dist.guide.root));
});

gulp.task('clean:molecules', function(){
    del.sync(paths.dist.guide.molecules);
});

gulp.task('build:molecules', ['clean:molecules'], function(){
    var components = getComponents('./source/molecules', 'molecule');

    return gulp.src(paths.source.guide.html)
        .pipe(plumber())
        .pipe(data(function(){
            return {
                id: 'molecules',
                title: 'Molecules',
                components: components
            };
        }))
        .pipe(swig(options.swig))
        .pipe(rename('molecules.html'))
        .pipe(gulp.dest(paths.dist.guide.root));
});

gulp.task('clean:organisms', function(){
    del.sync(paths.dist.guide.organisms);
});

gulp.task('build:organisms', ['clean:organisms'], function(){
    var components = getComponents('./source/organisms', 'organism');

    return gulp.src(paths.source.guide.html)
        .pipe(plumber())
        .pipe(data(function(){
            return {
                id: 'organisms',
                title: 'Organisms',
                components: components
            };
        }))
        .pipe(swig(options.swig))
        .pipe(rename('organisms.html'))
        .pipe(gulp.dest(paths.dist.guide.root));
});

gulp.task('clean:guide-css', function(){
    del.sync(paths.dist.guide.css + '*.css');
});

gulp.task('build:guide-css', ['clean:guide-css'], function(){
    return gulp.src(paths.source.guide.styles)
        .pipe(plumber())
        .pipe(glob(options.glob))
        .pipe(sass())
        .pipe(prefix(options.prefix))
        .pipe(rename('guide.css'))
        .pipe(gulp.dest(paths.dist.guide.css))
        .pipe(rename('guide.min.css'))
        .pipe(minify(options.minify))
        .pipe(gulp.dest(paths.dist.guide.css))
        .pipe(filter('**/*.css'));
});

gulp.task('clean:guide-js', function(){
    del.sync(paths.dist.guide.root + '*.js');
});

gulp.task('build:guide-js', ['clean:guide-js'], function(){
    gulp.src(paths.source.guide.scripts)
        .pipe(plumber())
        .pipe(concat('guide.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist.guide.root));
});

gulp.task('clean:guide-index', function(){
    del.sync(paths.dist.guide.index);
});

gulp.task('build:guide-index', ['clean:guide-index'], function(){
    return gulp.src(paths.source.guide.index)
        .pipe(plumber())
        .pipe(data(function(){
            return {
                id: 'home',
                title: 'Home',
                version: meta.version,
                css: '../' + project + '.min.css',
                js: '../' + project + '.min.js'
            };
        }))
        .pipe(swig(options.swig))
        .pipe(gulp.dest(paths.dist.guide.root));
});

gulp.task('build:guide', ['build:atoms', 'build:molecules', 'build:organisms', 'build:guide-css', 'build:guide-js', 'build:guide-index']);

gulp.task('clean:all', function(){
    del.sync(dist);
});

gulp.task('clean:latest', function(){
    del.sync(paths.dist.latest);
});

gulp.task('build:latest', ['clean:latest'], function(){
    file(latest, JSON.stringify({
            name: meta.name,
            version: meta.version,
            css: meta.version + '/' + project + '.min.css',
            js: meta.version + '/' + project + '.min.js'
        }), { src: true })
        .pipe(gulp.dest(dist));
});

gulp.task('clean:index', function(){
    del.sync([dist + '*.*', '!' + paths.dist.latest], { nodir: true });
});

gulp.task('build:index', ['clean:index'], function(){
    return gulp.src(paths.source.index)
        .pipe(gulp.dest(dist));
});

gulp.task('build:all', ['build:css', 'build:js', 'build:html', 'build:images', 'build:latest', 'build:guide', 'build:index']);

gulp.task('default', ['build:all']);

gulp.task('watch', function(){
    gulp.watch(paths.watch.pages, ['build:html', 'build:atoms', 'build:molecules', 'build:organisms', 'build:guide-index']);
    gulp.watch(paths.watch.scripts, ['build:js']);
    gulp.watch(paths.watch.styles, ['build:css']);
    gulp.watch('./package.json', ['build:latest']);    
    gulp.watch(paths.source.guide.styles, ['build:guide-css']);
    gulp.watch(paths.source.index, ['build:index']);
});

gulp.task('dev', ['build:all', 'watch']);
