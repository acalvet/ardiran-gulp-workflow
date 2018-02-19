var gulp = require('gulp')
var params = require('yargs').argv;
var less = require('gulp-less');
var del = require('del');
var gulpif = require('gulp-if');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var cleanCss = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var rewriteCSS = require('gulp-rewrite-css');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var ts = require('gulp-typescript');
var gulpCopy = require('gulp-copy');
var kraken = require('gulp-kraken');
var Observable = require('rx').Observable;

var configFile = require('./gulpfile.config');

/*------------------------------------*\
  #NPM MODULE
\*------------------------------------*/

var ardiran = module.exports = {
  configFile: configFile,
  init: build,
};

function build() {

  /*------------------------------------*\
    #CONFIG
  \*------------------------------------*/

  var config = {};

  config.isProd = params.prod != undefined ? true : false;

  config.styles = ardiran.configFile.project.styles != undefined ? ardiran.configFile.project.styles : '';
  config.scripts = ardiran.configFile.project.scripts != undefined ? ardiran.configFile.project.scripts : '';

  /*------------------------------------*\
    #HELPERS
  \*------------------------------------*/

  /* Clean folder */

  function clean(src) {
    return del(src);
  }

  /* Copy dependencies */

  function copy_files(files, dst) {

    var stream = Observable.return(42);

    files.forEach(function (dep) {

      stream = gulp.src(dep + '**/**.*')
        .pipe(gulpCopy(dst, {prefix: 1}))
        .pipe(gulp.dest(dst));

    })

    return stream;

  }

  /* Optimize images */

  function optimize_img(src, done) {

    var error = false;

    if (ardiran.configFile.options.images.kraken.key === undefined || ardiran.configFile.options.images.kraken.key == '') {
      console.log("[ERROR] You must configure the parameter 'options.images.kraken.key' to optimize your images.");
      error = true;
    }

    if (ardiran.configFile.options.images.kraken.secret === undefined || ardiran.configFile.options.images.kraken.secret == '') {
      console.log("[ERROR] You must configure the parameter 'options.images.kraken.secret' to optimize your images.");
      error = true;
    }

    if (error) {
      return done();
    }

    return gulp.src(src)
      .pipe(kraken({
        key: ardiran.configFile.options.images.kraken.key,
        secret: ardiran.configFile.options.images.kraken.secret,
        lossy: true,
        concurrency: 6
      }));

  }

  /* Concat css */

  function concat_css(src, dst) {

    return gulp.src(src)
      .pipe(gulpif(!config.isProd, sourcemaps.init()))
      .pipe(rewriteCSS({destination: dst}))
      .pipe(autoprefixer({browsers: ['last 2 versions', '> 5%', 'Firefox ESR']}))
      .pipe(gulpif(config.isProd, cleanCss({rebase: false,})))
      .pipe(concat('build.css'))
      .pipe(gulpif(!config.isProd, sourcemaps.write('.')))
      .pipe(gulp.dest(dst));

  }

  /* Compile less */

  function compile_less(src, dst) {

    return gulp.src(src)
      .pipe(less())
      .pipe(gulp.dest(dst));

  }

  /* Compile Sass */

  function compile_sass(src, dst) {

    return gulp.src(src)
      .pipe(sass())
      .pipe(gulp.dest(dst))

  }

  /* Concat js */

  function concat_js(src, dst) {

    return gulp.src(src)
      .pipe(gulpif(!config.isProd, sourcemaps.init()))
      .pipe(gulpif(config.isProd, uglify()))
      .pipe(concat('build.js'))
      .pipe(gulpif(!config.isProd, sourcemaps.write('.')))
      .pipe(gulp.dest(dst));

  }

  /* Transpile ES6 to ES5 */

  function transpile_es6(src, dst) {

    return gulp.src([src + '**/*.es6', src + '**/*.js'])
      .pipe(babel({
        moduleIds: true,
        presets: ['env'],
        plugins: ['transform-es2015-modules-amd']
      }))
      .pipe(gulp.dest(dst));

  }

  /* Transpile ts to es6 */

  function transpile_ts(src, dst) {

    return gulp.src(src + '**/*.ts')
      .pipe(ts({
        removeComments: true,
        target: "ES6",
      }))
      .pipe(gulp.dest(dst));

  }



  /*------------------------------------*\
    #SET IS PRODUCTION
  \*------------------------------------*/

  gulp.task('ardiran:set:production', function (done) {

    config.isProd = true;

    return Observable.return(42);

  });

  /*------------------------------------*\
    #COPY DEPENDENCIES
  \*------------------------------------*/

  gulp.task('ardiran:dependencies:copy', function (done) {
    return copy_files(ardiran.configFile.dependencies.copy.src, ardiran.configFile.dependencies.copy.dst);
  });

  /*------------------------------------*\
    #IMG:OPTIMIZE TASK
  \*------------------------------------*/

  gulp.task('ardiran:images:optimize', function (done) {
    return optimize_img(ardiran.configFile.paths.images.src, done);
  });

  /*------------------------------------*\
    #CSS:BUILD TASK
  \*------------------------------------*/

  /* Clean CSS folders */

  gulp.task('ardiran:css:clean', function (done) {
    return clean([ardiran.configFile.paths.css.dst + '**/*.**']);
  });

  /* Concat CSS */

  gulp.task('ardiran:css:concat', function (done) {

    var src = ardiran.configFile.dependencies.css;
    src.push(ardiran.configFile.paths.css.src + '**/*.css');

    return concat_css(src, ardiran.configFile.paths.css.dst);

  });

  /* Build CSS */

  gulp.task('ardiran:css:build', function (done) {

    gulp.series('ardiran:css:clean', 'ardiran:css:concat')(done);

  });

  /*------------------------------------*\
    #LESS:BUILD TASK
  \*------------------------------------*/

  /* Clean less folders */

  gulp.task('ardiran:less:clean', function (done) {
    return clean([ardiran.configFile.paths.less.cmp + '**/*.css', ardiran.configFile.paths.less.dst + '**/*.**']);
  });

  /* Compile less */

  gulp.task('ardiran:less:compile', function (done) {
    return compile_less(ardiran.configFile.paths.less.src, ardiran.configFile.paths.less.cmp);
  });

  /* Concat compiled less */

  gulp.task('ardiran:less:concat', function (done) {

    var src = ardiran.configFile.dependencies.css;
    src.push(ardiran.configFile.paths.less.cmp + '**/*.css');

    return concat_css(src, ardiran.configFile.paths.less.dst);

  });

  /* Build Less */

  gulp.task('ardiran:less:build', function (done) {

    gulp.series('ardiran:less:clean', 'ardiran:less:compile', 'ardiran:less:concat')(done);

  });

  /*------------------------------------*\
    #SASS:BUILD TASK
  \*------------------------------------*/

  /* Clea SASS Folders */

  gulp.task('ardiran:sass:clean', function (done) {
    return clean([ardiran.configFile.paths.sass.cmp + '**/*.css', ardiran.configFile.paths.sass.dst + '**/*.**']);
  });

  /* Compile SASS Files */

  gulp.task('ardiran:sass:compile', function (done) {
    return compile_sass(ardiran.configFile.paths.sass.src, ardiran.configFile.paths.sass.cmp);
  });

  /* Concat compiled sass */

  gulp.task('ardiran:sass:concat', function (done) {

    var src = ardiran.configFile.dependencies.css;
    src.push(ardiran.configFile.paths.sass.cmp + '**/*.css');

    return concat_css(src, ardiran.configFile.paths.sass.dst);

  });

  /* Build Sass */

  gulp.task('ardiran:sass:build', function (done) {

    gulp.series('ardiran:sass:clean', 'ardiran:sass:compile', 'ardiran:sass:concat')(done);

  });

  /*------------------------------------*\
    #JS:BUILD TASK
  \*------------------------------------*/

  /* Clean js folders */

  gulp.task('ardiran:js:clean', function (done) {
    return clean([ardiran.configFile.paths.js.dst + '**/*.**']);
  });

  /* Concat js */

  gulp.task('ardiran:js:concat', function (done) {

    var src = ardiran.configFile.dependencies.js;
    src.push(ardiran.configFile.paths.js.src + '**/*.js');

    return concat_js(src, ardiran.configFile.paths.js.dst);

  });

  /* Build js */

  gulp.task('ardiran:js:build', function (done) {

    gulp.series('ardiran:js:clean', 'ardiran:js:concat')(done);

  });

  /*------------------------------------*\
    #ES6:BUILD TASK
  \*------------------------------------*/

  /* Clean es6 folders */

  gulp.task('ardiran:es6:clean', function (done) {
    return clean([ardiran.configFile.paths.es6.cmp + '**/*.js', ardiran.configFile.paths.es6.dst + '**/*.**']);
  });

  /* Transpile ES6 */

  gulp.task('ardiran:es6:transpile', function (done) {
    return transpile_es6(ardiran.configFile.paths.es6.src, ardiran.configFile.paths.es6.cmp);
  });

  /* Concat ES6 */

  gulp.task('ardiran:es6:concat', function (done) {

    var src = ardiran.configFile.dependencies.js;
    src.push(ardiran.configFile.paths.es6.cmp + '**/*.js');

    return concat_js(src, ardiran.configFile.paths.es6.dst);

  });

  /* Build js */

  gulp.task('ardiran:es6:build', function (done) {

    gulp.series('ardiran:es6:clean', 'ardiran:es6:transpile', 'ardiran:es6:concat')(done);

  });

  /*------------------------------------*\
    #TS:BUILD TASK
  \*------------------------------------*/

  /* Clean es6 folders */

  gulp.task('ardiran:ts:clean', function (done) {
    return clean([ardiran.configFile.paths.ts.cmp_ts + '**/*.js', ardiran.configFile.paths.ts.cmp_es6 + '**/*.js', ardiran.configFile.paths.ts.dst + '**/*.**']);
  });

  /* Transpile Ts to ES6 */

  gulp.task('ardiran:ts:transpile', function (done) {
    return transpile_ts(ardiran.configFile.paths.ts.src, ardiran.configFile.paths.ts.cmp_ts);
  });

  /* Transpile ES6 to ES5 */

  gulp.task('ardiran:ts:es6:transpile', function (done) {
    return transpile_es6(ardiran.configFile.paths.ts.cmp_ts, ardiran.configFile.paths.ts.cmp_es6);
  });

  /* Concat js */

  gulp.task('ardiran:ts:concat', function (done) {

    var src = ardiran.configFile.dependencies.js;
    src.push(ardiran.configFile.paths.ts.cmp_es6 + '**/*.js');

    return concat_js(src, ardiran.configFile.paths.ts.dst);

  });

  /* Build ts */

  gulp.task('ardiran:ts:build', function (done) {

    gulp.series('ardiran:ts:clean', 'ardiran:ts:transpile', 'ardiran:ts:es6:transpile', 'ardiran:ts:concat')(done);

  });

  /*------------------------------------*\
    #GLOBAL TASKS
  \*------------------------------------*/

  /* Build Styles */

  gulp.task('ardiran:styles:build', function (done) {

    var build_styles = [];

    if (config.styles == 'CSS') build_styles.push('ardiran:css:build');
    if (config.styles == 'LESS') build_styles.push('ardiran:less:build');
    if (config.styles == 'SASS') build_styles.push('ardiran:sass:build');

    if (build_styles.length > 0) {

      return gulp.series(build_styles)(done);

    } else {

      console.log("[ERROR] You must configure the parameter 'project.styles'.");

      done();

    }

  });

  /* Build Scripts */

  gulp.task('ardiran:scripts:build', function (done) {

    var build_scripts = [];

    if (config.scripts == 'JS') build_scripts.push('ardiran:js:build');
    if (config.scripts == 'ES6') build_scripts.push('ardiran:es6:build');
    if (config.scripts == 'TS') build_scripts.push('ardiran:ts:build');

    if (build_scripts.length > 0) {

      return gulp.series(build_scripts)(done);

    } else {

      console.log("[ERROR] You must configure the parameter 'project.scripts'.");

      done();

    }

  });

  /* Build Global */

  gulp.task('ardiran:build', gulp.series('ardiran:styles:build', 'ardiran:scripts:build'));

  /* Watch */

  gulp.task('ardiran:watch', function () {

    gulp.watch(ardiran.configFile.paths.css.watch + '**/*.css', gulp.series('ardiran:css:build'));
    gulp.watch(ardiran.configFile.paths.less.watch + '**/*.less', gulp.series('ardiran:less:build'));
    gulp.watch(ardiran.configFile.paths.sass.watch + '**/*.scss', gulp.series('ardiran:sass:build'));

    gulp.watch(ardiran.configFile.paths.js.watch + '**/*.js', gulp.series('ardiran:js:build'));
    gulp.watch(ardiran.configFile.paths.es6.watch + '**/*.es6', gulp.series('ardiran:es6:build'));
    gulp.watch(ardiran.configFile.paths.ts.watch + '**/*.ts', gulp.series('ardiran:ts:build'));

  });

  /* Deploy */

  gulp.task('ardiran:deploy', gulp.series('ardiran:set:production', 'ardiran:dependencies:copy', 'ardiran:images:optimize', 'ardiran:build'));

}