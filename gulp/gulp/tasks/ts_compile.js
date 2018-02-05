'use strict';

var gulp = require('gulp'),
    config = require('../config'),
    helpers = require('../helpers/scripts.js');

var TS = config.project.js == 'TS' ? true : false;

gulp.task('ts:compile', function(){
  if(!TS) return false;
  return helpers.ts(config.paths.js.ts, config.paths.js.cmp_dst);
});
