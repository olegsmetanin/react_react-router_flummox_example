'use strict';

var gulp = require('gulp'),
    browserify = require('browserify'),
    babelify = require("babelify"),
    source = require('vinyl-source-stream'),
    exorcist = require('exorcist');

var dest = './dest';

gulp.task('apps', function() {

    var bundler = browserify({
            debug: true
        })
        .transform(babelify.configure({
            experimental: true,
            optional: ['asyncToGenerator']
        }))
        .require('./src/assets/js/apps/apps.js', {
            expose: 'apps'
        })
        .external('react')
        .external('react-router')
        .external('flummox')

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
            debug: true
        })
        .require('./node_modules/react/dist/react.js', {
            expose: 'react'
        })
        .require('./node_modules/react-router/modules/index.js', {
            expose: 'react-router'
        })
        .require('./node_modules/flummox/lib/Flux.js', {
            expose: 'flummox'
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

gulp.task('html', function() {
    return gulp.src(['./src/**', '!./src/assets/**'])
        .pipe(gulp.dest(dest));
});

gulp.task('watch', function() {
    gulp.watch('./src/assets/js/apps/**', ['apps']);
    gulp.watch('./src/assets/js/lib/**', ['lib']);
    gulp.watch(['./src/**', '!./src/assets/**'], ['html']);
});

gulp.task('default', ['apps', 'lib', 'html', 'watch']);