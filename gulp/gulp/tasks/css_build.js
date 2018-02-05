'use strict';

var gulp = require('gulp');

gulp.task('css:build', ['less:compile', 'sass:compile'], undefined);
