'use strict';

var gulp = require('gulp'),
    config = require('../config'),
    helpers = require('../helpers/styles.js');

var LESS = config.project.styles == 'LESS' ? true : false;

gulp.task('less:compile', function(){
  if(!LESS) return false;
  return helpers.less(config.paths.css.less, config.paths.css.dst, config.names.css.default);
});
