'use strict';

var gulp = require('gulp'),
    config = require('../config'),
    helpers = require('../helpers/styles.js');

var SASS = config.project.styles == 'SASS' ? true : false;

gulp.task('sass:compile', function(){
  if(!SASS) return false;
  return helpers.sass(config.paths.css.sass, config.paths.css.dst, config.names.css.default);
});
