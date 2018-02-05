'use strict';

var gulp = require('gulp'),
    config = require('../config'),
    helpers = require('../helpers/styles.js');

gulp.task('css:vendor:concat', function(){
  return helpers.css_concat(config.paths.css.vendor, config.paths.css.dst, config.names.css.vendor);
});
