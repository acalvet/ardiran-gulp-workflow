'use strict';

var gulp = require('gulp'),
    config = require('../config'),
    helpers = require('../helpers/scripts.js');

var RJS = config.project.rjs ? true : false;
var TS = config.project.js == 'TS' ? true : false;
var ES6 = config.project.js == 'ES6' ? true : false;

gulp.task('js:build', ['ts:compile', 'js:es6-to-es5'], function(){
  if(RJS)
    return helpers.rjs(config.paths.js.rjs, config.paths.js.dst)
  else if(TS || ES6)
    return helpers.js_concat(config.paths.js.cmp, config.paths.js.dst, config.names.js.default);
  else
    return helpers.js_concat(config.paths.js.js, config.paths.js.dst, config.names.js.default);
});
