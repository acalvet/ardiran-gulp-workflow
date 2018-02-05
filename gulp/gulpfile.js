'use strict';

var gulp = require('gulp'),
    config = require('./gulp/config'),
    plugins = require('gulp-load-plugins')(),
    requireDir = require('require-dir'),
    tasks = requireDir('./gulp/tasks');

var PROD = config.env == 'PROD' ? true : false;
var SASS = config.project.styles == 'SASS' ? true : false;
var LESS = config.project.styles == 'LESS' ? true : false;
var TS = config.project.js == 'TS' ? true : false;
var ES6 = config.project.js == 'ES6' ? true : false;
var RJS = config.project.rjs ? true : false;
var JS = !TS && !ES6 ? true : false;

/****
** TAREAS
****/

gulp.task('build:prod', ['build:dev', 'images:optimize'], undefined);

gulp.task('build:dev', ['css:build', 'css:vendor:concat', 'js:build', 'js:vendor:concat'], undefined);

gulp.task('watch', function(){
  if(LESS) gulp.watch(config.watchers.css.less, ['css:build']);
  if(SASS) gulp.watch(config.watchers.css.sass, ['css:build']);
  if(TS) gulp.watch(config.watchers.js.ts, ['js:build']);
  if(ES6) gulp.watch(config.watchers.js.es6, ['js:build']);
  if(JS) gulp.watch(config.watchers.js.js, ['js:build']);
});
