const gulp = require('gulp-param')(require('gulp'), process.argv);
      babel = require('gulp-babel'),
      uglify = require('gulp-uglify'),
      concat = require('gulp-concat'),
      sourcemaps = require('gulp-sourcemaps'),
      gulpif = require('gulp-if'),
      ts = require('gulp-typescript'),
      del = require('del'),
      less = require('gulp-less'),
      cleanCss = require('gulp-clean-css'),
      sass = require('gulp-sass'),
      autoprefixer = require('gulp-autoprefixer'),
      kraken = require('gulp-kraken'),
      rewriteCSS = require('gulp-rewrite-css'),
      npmDist = require('gulp-npm-dist');

var configFile = require('./gulpfile.config');

/*------------------------------------*\
  #NPM MODULE
\*------------------------------------*/

var ardiran = module.exports = {
  'init': build,
  'config': configFile,
};

function build() {

  /*------------------------------------*\
    #PARAMS
  \*------------------------------------*/

  var prodParam = false;

  /*------------------------------------*\
    #GLOBAL HELPERS
  \*------------------------------------*/

  function setProdParam(prod) {
    prodParam = prod == undefined ? false : prod;
  }

  function isProd() {
    return prodParam || (ardiran.config.env == 'PROD' || ardiran.config.env == 'prod');
  }

  function isDev() {
    return !isProd();
  }

  /*------------------------------------*\
    #TASKS HELPERS
  \*------------------------------------*/

  function clean(src) {
    return del(src);
  }

  function copyDependencies(){

    return gulp.src(npmDist(), {base:'./node_modules'})
      .pipe(gulp.dest(ardiran.config.dependencies.folder));

  }

  function optimizeIMG(src) {

    if(!ardiran.config.options.images.kraken.key || ardiran.config.options.images.kraken.key == '')
      return true;

    if(!ardiran.config.options.images.kraken.secret || ardiran.config.options.images.kraken.secret == '')
      return true;

    return gulp.src(src)
      .pipe(kraken({
        key: ardiran.config.options.images.kraken.key,
        secret: ardiran.config.options.images.kraken.secret,
        lossy: true,
        concurrency: 6
      }));

  }

  function concatCSS(src, dst) {

    return gulp.src(src)
      .pipe(rewriteCSS({destination: dst}))
      .pipe(concat('build.css'))
      .pipe(gulpif(isDev(), sourcemaps.init()))
      .pipe(autoprefixer({browsers: ['last 2 versions', '> 5%', 'Firefox ESR']}))
      .pipe(gulpif(isProd(), cleanCss({rebase: false,})))
      .pipe(gulpif(isDev(), sourcemaps.write('.')))
      .pipe(gulp.dest(dst));

  }

  function compileLESS(src, dst) {

    return gulp.src(src)
      .pipe(less())
      .pipe(gulp.dest(dst));

  }

  function compileSASS(src, dst) {

    return gulp.src(src)
      .pipe(sass())
      .pipe(gulp.dest(dst))

  }

  function concatJS(src, dst) {

    return gulp.src(src)
      .pipe(concat('build.js'))
      .pipe(gulpif(isDev(), sourcemaps.init()))
      .pipe(gulpif(isProd(), uglify()))
      .pipe(gulpif(isDev(), sourcemaps.write('.')))
      .pipe(gulp.dest(dst));

  }

  function transpileES6(src, dst) {

    return gulp.src([src + '**/*.es6', src + '**/*.js'])
      .pipe(babel({
        moduleIds: true,
        presets: ['env'],
        plugins: ['transform-es2015-modules-amd']
      }))
      .pipe(gulp.dest(dst));

  }

  function transpileTS(src, dst) {

    return gulp.src(src + '**/*.ts')
      .pipe(ts({
        removeComments: true,
        target: "ES6",
      }))
      .pipe(gulp.dest(dst));

  }

  /*------------------------------------*\
    #SET PARAMS
  \*------------------------------------*/

  gulp.task('ardiran:set:params', [], function (prod) {

    setProdParam(prod);

  });

  /*------------------------------------*\
  #COPY DEPENDENCIES
\*------------------------------------*/

  gulp.task('ardiran:dependencies:copy', [], function () {

    if(!isProd())
      return;

    return copyDependencies();

  });

  /*------------------------------------*\
    #IMG:OPTIMIZE TASK
  \*------------------------------------*/

  gulp.task('ardiran:images:optimize', function () {
    return optimizeIMG(ardiran.config.paths.images.src);
  });

  /*------------------------------------*\
    #CSS:BUILD TASK
  \*------------------------------------*/

  gulp.task('ardiran:css:clean', [], function () {
    return clean([ardiran.config.paths.css.dst + '**/*.**']);
  });

  gulp.task('ardiran:css:build', ['ardiran:css:clean'], function () {

    if(ardiran.config.project.styles != 'CSS')
      return true;

    var dependencies = ardiran.config.dependencies.css,
        src = [ardiran.config.paths.css.src + '**/*.css'];

    return concatCSS(dependencies.concat(src), ardiran.config.paths.css.dst);

  });

  /*------------------------------------*\
    #LESS:BUILD TASK
  \*------------------------------------*/

  gulp.task('ardiran:less:clean', [], function () {
    return clean([ardiran.config.paths.less.cmp + '**/*.css', ardiran.config.paths.less.dst + '**/*.**']);
  });

  gulp.task('ardiran:less:compile', ['ardiran:less:clean'], function () {
    return compileLESS(ardiran.config.paths.less.src, ardiran.config.paths.less.cmp);
  });

  gulp.task('ardiran:less:build', ['ardiran:less:compile'], function () {

    if(ardiran.config.project.styles != 'LESS')
      return true;

    var dependencies = ardiran.config.dependencies.css,
        src = [ardiran.config.paths.less.cmp + '**/*.css'];

    return concatCSS(dependencies.concat(src), ardiran.config.paths.less.dst);

  });

  /*------------------------------------*\
    #SASS:BUILD TASK
  \*------------------------------------*/

  gulp.task('ardiran:sass:clean', [], function () {
    return clean([ardiran.config.paths.sass.cmp + '**/*.css', ardiran.config.paths.sass.dst + '**/*.**']);
  });

  gulp.task('ardiran:sass:compile', ['ardiran:sass:clean'], function () {
    return compileSASS(ardiran.config.paths.sass.src, ardiran.config.paths.sass.cmp);
  });

  gulp.task('ardiran:sass:build', ['ardiran:sass:compile'], function () {

    if(ardiran.config.project.styles != 'SASS')
      return true;

    var dependencies = ardiran.config.dependencies.css,
        src = [ardiran.config.paths.sass.cmp + '**/*.css'];

    return concatCSS(dependencies.concat(src), ardiran.config.paths.sass.dst);

  });

  /*------------------------------------*\
    #JS:BUILD TASK
  \*------------------------------------*/

  gulp.task('ardiran:js:clean', [], function () {
    return clean([ardiran.config.paths.js.dst + '**/*.**']);
  });

  gulp.task('ardiran:js:build', ['ardiran:js:clean'], function () {

    if(ardiran.config.project.scripts != 'JS')
      return true;

    var dependencies = ardiran.config.dependencies.js,
        src = [ardiran.config.paths.js.src + '**/*.js'];

    return concatJS(dependencies.concat(src), ardiran.config.paths.js.dst);

  });

  /*------------------------------------*\
    #ES6:BUILD TASK
  \*------------------------------------*/

  gulp.task('ardiran:es6:clean', [], function () {
    return clean([ardiran.config.paths.es6.cmp + '**/*.js', ardiran.config.paths.es6.dst + '**/*.**']);
  });

  gulp.task('ardiran:es6:transpile', ['ardiran:es6:clean'], function () {
    return transpileES6(ardiran.config.paths.es6.src, ardiran.config.paths.es6.cmp);
  });

  gulp.task('ardiran:es6:build', ['ardiran:es6:transpile'], function () {

    if(ardiran.config.project.scripts != 'ES6')
      return true;

    var dependencies = ardiran.config.dependencies.js,
        src = [ardiran.config.paths.es6.cmp + '**/*.js'];

    return concatJS(dependencies.concat(src), ardiran.config.paths.es6.dst);

  });

  /*------------------------------------*\
    #TS:BUILD TASK
  \*------------------------------------*/

  gulp.task('ardiran:ts:clean', [], function () {
    return clean([ardiran.config.paths.ts.cmp_ts + '**/*.js', ardiran.config.paths.ts.cmp_es6 + '**/*.js', ardiran.config.paths.ts.dst + '**/*.**']);
  });

  gulp.task('ardiran:ts:transpile', ['ardiran:ts:clean'], function () {
    return transpileTS(ardiran.config.paths.ts.src, ardiran.config.paths.ts.cmp_ts);
  });

  gulp.task('ardiran:ts:es6:transpile', ['ardiran:ts:transpile'], function () {
    return transpileES6(ardiran.config.paths.ts.cmp_ts, ardiran.config.paths.ts.cmp_es6);
  });

  gulp.task('ardiran:ts:build', ['ardiran:ts:es6:transpile'], function () {

    if(ardiran.config.project.scripts != 'TS')
      return true;

    var dependencies = ardiran.config.dependencies.js,
        src = [ardiran.config.paths.ts.cmp_es6 + '**/*.js'];

    return concatJS(dependencies.concat(src), ardiran.config.paths.ts.dst);

  });

  /*------------------------------------*\
    #GLOBAL TASKS
  \*------------------------------------*/

  gulp.task('ardiran:build:dependencies', ['ardiran:set:params', 'ardiran:dependencies:copy'], function () { });

  gulp.task('ardiran:build:styles', ['ardiran:set:params', 'ardiran:css:build', 'ardiran:less:build', 'ardiran:sass:build'], function () { });

  gulp.task('ardiran:build:scripts', ['ardiran:set:params', 'ardiran:js:build', 'ardiran:es6:build', 'ardiran:ts:build'], function () { });

  gulp.task('ardiran:build:images', ['ardiran:set:params', 'ardiran:images:optimize'], function () {});

  gulp.task('ardiran:build', ['ardiran:build:styles', 'ardiran:build:scripts', 'ardiran:build:images'], function () { });

  gulp.task('ardiran:watch', function () {

    gulp.watch(ardiran.config.paths.css.watch + '**/*.css', ['ardiran:set:params', 'ardiran:css:build']);
    gulp.watch(ardiran.config.paths.less.watch + '**/*.less', ['ardiran:set:params', 'ardiran:less:build']);
    gulp.watch(ardiran.config.paths.sass.watch + '**/*.scss', ['ardiran:set:params', 'ardiran:sass:build']);

    gulp.watch(ardiran.config.paths.js.watch + '**/*.js', ['ardiran:set:params', 'ardiran:js:build']);
    gulp.watch(ardiran.config.paths.es6.watch + '**/*.es6', ['ardiran:set:params', 'ardiran:es6:build']);
    gulp.watch(ardiran.config.paths.ts.watch + '**/*.ts', ['ardiran:set:params', 'ardiran:ts:build']);

  });

}
