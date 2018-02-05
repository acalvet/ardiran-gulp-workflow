'use strict';

var gulp = require('gulp'),
    config = require('../config'),
    helpers = require('../helpers/scripts.js');

var ES6 = config.project.js == 'ES6' ? true : false;

gulp.task('js:es6-to-es5', function(){
  if(!ES6) return false;
  return helpers.es6_to_es5(gulp.src(config.paths.js.es6), config.paths.js.cmp_dst);
});
