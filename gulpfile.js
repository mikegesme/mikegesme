var util       = require('util'),
    exec       = require('child_process').exec;

var gulp       = require('gulp'),
    plumber    = require('gulp-plumber'),
    uglify     = require('gulp-uglify'),
    jshint     = require('gulp-jshint'),
    concat     = require('gulp-concat'),
    debug      = require('gulp-debug'),
    strip      = require('gulp-strip-line'),
    gulpif     = require('gulp-if'),
    prefix     = require('gulp-autoprefixer'),
    sass       = require('gulp-ruby-sass');
    livereload = require('gulp-livereload');
    minifyCss  = require('gulp-minify-css');

    require('es6-promise').polyfill();

var PROD       = process.env.ENV === 'PROD',
    QA         = process.env.ENV === 'QA',
    LOCAL      = process.env.ENV === 'LOCAL',
    DEBUG      = !!process.env.DEBUG;

if (PROD)  { process.stdout.write('PROD = ' + PROD + '\n');   }
if (QA)    { process.stdout.write('QA = ' + QA + '\n');       }
if (LOCAL) { process.stdout.write('LOCAL = ' + LOCAL + '\n'); }
if (DEBUG) { process.stdout.write('DEBUG = ' + DEBUG + '\n'); }

var files = {

    js: {
        name: 'main.js',
        src: [
            'build/js/components/**/*.js'
        ],
        dest: 'docs/assets/js'
    },

    css: {
        name: 'main.css',
        src:  'build/scss/**/**/*.scss',
        dest: 'docs/assets/css'
    },

    html: {
        src: [
            '**/*.php',
            '**/*.html',
        ]
    }

};

gulp.task('javascripts', function() {

    var js;

    js = gulp.src(files.js.src)
        .pipe(plumber())
        .pipe(gulpif(/\/app\//, jshint({es3: true})))
        .pipe(gulpif(/\/app\//, jshint.reporter('default')))
        .pipe(gulpif(/\/app\//, strip('__remove__')))         // remove any private methods from the public API
        .pipe(concat(files.js.name));

    if (DEBUG)
        js = js.pipe(debug({verbose: true}));

    if (!LOCAL)
        js = js.pipe(uglify());

    js.pipe(gulp.dest(files.js.dest))

});

gulp.task('stylesheets', function() {

    return sass(files.css.src, { verbose: false })
        .on('error', function (err) {
            console.error('Error!', err.message);
        })
        .pipe(prefix("last 2 versions"))
        .pipe(minifyCss())
        .pipe(gulp.dest(files.css.dest))
        .pipe(livereload());

});

gulp.task('code', function() {

    var html = gulp.src(files.html.src);

    html.pipe(livereload());

});

gulp.task('watch', function() {
    livereload.listen();
    gulp.watch(files.css.src,    ['stylesheets']);
    gulp.watch(files.js.src,     ['javascripts']);
    gulp.watch(files.html.src, ['code']);
});

gulp.task('build',   ['stylesheets', 'javascripts']);

gulp.task('default', ['build']);