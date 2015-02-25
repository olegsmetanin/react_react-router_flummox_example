'use strict';

var gulp = require('gulp'),
    babel = require('gulp-babel'),
    browserify = require('browserify'),
    babelify = require("babelify"),
    source = require('vinyl-source-stream'),
    exorcist = require('exorcist'),
    uglifyify = require('uglifyify'),
    jshint = require("gulp-jshint"),
    gulpsass = require('gulp-sass'),
    sketch = require("gulp-sketch"),
    iconfont = require('gulp-iconfont'),
    bourbon = require('node-bourbon').includePaths,
    deploypages = require('gulp-gh-pages');

var dest = './dest',
    fontName = 'appfont';

gulp.task('apps', function() {

    var bundler = browserify({
            debug: true
        })
        .transform(babelify.configure({
            experimental: true
        }))
        .require('./src/assets/js/apps/apps.js', {
            expose: 'apps'
        })
        .external('babel/polyfill')
        .external('react')
        .external('react-router')
        .external('flummox')
        .external('superagent')
        .external('cheerio')


    return bundler.bundle()
        .on('error', function(err) {
            console.log(err.toString());
            this.emit('end');
        })
        .pipe(exorcist(dest + '/assets/js/apps.js.map'))
        .pipe(source('apps.js'))
        .pipe(gulp.dest(dest + '/assets/js'));

});

gulp.task('lib', function() {

    var bundler = browserify({
            debug: false
        })
        .transform({
            global: true
        }, 'uglifyify')
        .require('./node_modules/babel/polyfill.js', {
            expose: 'babel/polyfill'
        })
        .require('./node_modules/react/dist/react.js', {
            expose: 'react'
        })
        .require('./node_modules/react-router/lib/index.js', {
            expose: 'react-router'
        })
        .require('./node_modules/flummox/lib/Flux.js', {
            expose: 'flummox'
        })
        .require('./node_modules/superagent/lib/client.js', {
            expose: 'superagent'
        })
        .require('./node_modules/cheerio/index.js', {
            expose: 'cheerio'
        });

    return bundler.bundle()
        .on('error', function(err) {
            console.log(err.toString());
            this.emit('end');
        })
        .pipe(exorcist(dest + '/assets/js/lib.js.map'))
        .pipe(source('lib.js'))
        .pipe(gulp.dest(dest + '/assets/js'));

});

gulp.task('styles', function() {
    return gulp.src([
            './src/assets/scss/app.scss'
        ])
        .pipe(gulpsass({
            outputStyle: 'expanded',
            includePaths: [
                './src/assets/scss'
            ].concat(bourbon),
            errLogToConsole: true
        }))
        .pipe(gulp.dest(dest + '/assets/css'));
});

gulp.task('iconfont', function() {
    return gulp.src('./src/assets/icons/symbol-font-16px.sketch') // you can also choose 'symbol-font-16px.sketch'
        .pipe(sketch({
            export: 'artboards',
            formats: 'svg'
        }))
        .pipe(iconfont({
            fontName: fontName,
            appendCodepoints: true,
            descent: 80
        }))
        .pipe(gulp.dest(dest + '/assets/fonts'))

});

gulp.task('html', function() {
    return gulp.src(['./src/**', '!./src/assets/**'])
        .pipe(gulp.dest(dest));
});

gulp.task("prelint", function() {
    return gulp.src('./src/assets/js/apps/**')
        .pipe(babel({
            experimental: true
        }))
        .pipe(gulp.dest('./tmp/src'));
});

gulp.task('lint', ['prelint'], function() {
    return gulp.src('./tmp/src/**')
        .pipe(jshint())
        .pipe(jshint.reporter("default", {
            verbose: true
        }))
        .pipe(jshint.reporter("fail"));
});

gulp.task('deploypages', function() {
    return gulp.src('./dest/**/*')
        .pipe(deploypages());
});

gulp.task('watch', function() {
    gulp.watch('./src/assets/js/apps/**', ['apps']);
    gulp.watch('./src/assets/js/lib/**', ['lib']);
    gulp.watch('./src/assets/scss/**', ['styles']);
    gulp.watch('./src/assets/icons/**', ['iconfont']);
    gulp.watch(['./src/**', '!./src/assets/**'], ['html']);
});

gulp.task('default', ['apps', 'lib', 'lint', 'styles', 'html', 'watch']);