'use strict';

var gulp = require('gulp'),
    config = require('../config'),
    helpers = require('../helpers/scripts.js');

gulp.task('js:vendor:concat', function(){
  return helpers.js_concat(config.paths.js.vendor, config.paths.js.dst, config.names.js.vendor);
});
