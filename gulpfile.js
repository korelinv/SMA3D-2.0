'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const insert = require('gulp-insert');
const minify = require('gulp-jsmin');
const clean = require('gulp-clean');
const gulpSequence = require('gulp-sequence');

gulp.task('auth-server-object', function() {
    return gulp.src([
            './authorizationServer/back/configuration/*.js',
            './authorizationServer/back/common/*.js',
            './authorizationServer/back/api/*.js'
        ])
        .pipe(concat('_temp_module.js'))
        .pipe(insert.wrap('const wrapper = function() {\n','}\n\nmodule.exports = new wrapper();'))
        .pipe(gulp.dest('./authorizationServer/temp/'));
});

gulp.task('auth-server-final', function() {
    return gulp.src([
            './authorizationServer/back/dependencies/*.js',
            './authorizationServer/temp/_temp_module.js'
        ])
        .pipe(concat('server.js'))
        .pipe(insert.wrap('\'use strict\';\n\n',''))
        .pipe(minify())
        .pipe(gulp.dest('./authorizationServer/'));
});

gulp.task('auth-server-cleanup', function() {
    return gulp.src('./authorizationServer/temp', {read: false})
        .pipe(clean());
});

gulp.task('auth-server',gulpSequence('auth-server-object','auth-server-final','auth-server-cleanup'));




gulp.task('main-server-object', function() {
    return gulp.src([
            './mainServer/back/configuration/*.js',
            './mainServer/back/common/*.js',
            './mainServer/back/api/*.js'
        ])
        .pipe(concat('_temp_module.js'))
        .pipe(insert.wrap('const wrapper = function() {\n','}\n\nmodule.exports = new wrapper();'))
        .pipe(gulp.dest('./mainServer/temp/'));
});

gulp.task('main-server-final', function() {
    return gulp.src([
            './mainServer/back/dependencies/*.js',
            './mainServer/temp/_temp_module.js'
        ])
        .pipe(concat('server.js'))
        .pipe(insert.wrap('\'use strict\';\n\n',''))
        //.pipe(minify())
        .pipe(gulp.dest('./mainServer/'));
});

gulp.task('main-server-cleanup', function() {
    return gulp.src('./mainServer/temp', {read: false})
        .pipe(clean());
});

gulp.task('default', gulpSequence('main-server-object','main-server-final','main-server-cleanup'));
