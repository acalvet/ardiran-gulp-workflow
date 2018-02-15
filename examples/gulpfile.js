/*------------------------------------*\
  #CONFIG ARDIRAN
\*------------------------------------*/

var ardiran = require('../gulpfile');

ardiran.configFile.project.styles = 'LESS';
ardiran.configFile.project.scripts = 'ES6';

ardiran.configFile.paths.less.dst = "./assets/styles/public/";

ardiran.configFile.dependencies.copy.src = [ ];

ardiran.configFile.dependencies.css = [ ];

ardiran.configFile.paths.es6.dst = "./assets/scripts/public/";

ardiran.configFile.dependencies.js = [ ];

ardiran.init();

/*------------------------------------*\
  #TASKS
\*------------------------------------*/

var gulp = require('gulp');

gulp.task('build:styles', gulp.series('ardiran:styles:build'));

gulp.task('build:scripts', gulp.series('ardiran:scripts:build'));

gulp.task('build', gulp.series('ardiran:build'));

gulp.task('watch', gulp.series('ardiran:watch'));

gulp.task('deploy', gulp.series('ardiran:deploy'));
