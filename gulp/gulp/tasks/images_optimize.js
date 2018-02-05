'use strict';

var gulp = require('gulp'),
    config = require('../config'),
    helpers = require('../helpers/images.js');

gulp.task('images:optimize', function(){
  return helpers.images_optimize(config.paths.images.src, config.paths.images.dst);
});
