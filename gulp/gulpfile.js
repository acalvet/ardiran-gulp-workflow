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
      kraken = require('gulp-kraken');

const config = require('./gulpfile.config');

/*------------------------------------*\
  #PARAMS
\*------------------------------------*/

var prodParam = false;

/*------------------------------------*\
  #GLOBAL HELPERS
\*------------------------------------*/

function setProdParam(prod){
  prodParam = prod == undefined ? false : prod;
}

function isProd(){
  return prodParam || (config.env == 'PROD' || config.env == 'prod');
}

function isDev(){
  return !isProd();
}

/*------------------------------------*\
  #TASKS HELPERS
\*------------------------------------*/

function clean(src){
  return del(src);
}

function optimizeIMG(src){

  return gulp.src(src)
    .pipe(kraken({
      key: config.options.images.kraken.key,
      secret: config.options.images.kraken.secret,
      lossy: true,
      concurrency: 6
    }));

}

function concatCSS(src, dst) {

  return gulp.src(src)
    .pipe(concat('build.css'))
    .pipe(gulpif(isDev(), sourcemaps.init()))
    .pipe(autoprefixer({ browsers: ['last 2 versions', '> 5%', 'Firefox ESR'] }))
    .pipe(gulpif(isProd(), cleanCss({ rebase: false, })))
    .pipe(gulpif(isDev(), sourcemaps.write('.')))
    .pipe(gulp.dest(dst));

}

function compileLESS(src, dst){

  return gulp.src(src)
    .pipe(less())
    .pipe(gulp.dest(dst));

}

function compileSASS(src, dst){

  return gulp.src(src)
    .pipe(sass())
    .pipe(gulp.dest(dst))

}

function concatJS(src, dst){

  return gulp.src(src)
    .pipe(concat('build.js'))
    .pipe(gulpif(isDev(), sourcemaps.init()))
    .pipe(gulpif(isProd(), uglify()))
    .pipe(gulpif(isDev(), sourcemaps.write('.')))
    .pipe(gulp.dest(dst));

}

function transpileES6(src, dst){

  return gulp.src([src + '**/*.es6', src + '**/*.js'])
    .pipe(babel({
      moduleIds: true,
      presets: ['env'],
      plugins: ['transform-es2015-modules-amd']
    }))
    .pipe(gulp.dest(dst));

}

function transpileTS(src, dst){

  return gulp.src(src + '**/*.ts')
    .pipe(ts({
      removeComments : true,
      target: "ES6",
    }))
    .pipe(gulp.dest(dst));

}

/*------------------------------------*\
  #SET PARAMS
\*------------------------------------*/

gulp.task('set:params', [], function(prod){

  setProdParam(prod);

});

/*------------------------------------*\
  #IMG:OPTIMIZE TASK
\*------------------------------------*/

gulp.task('images:optimize', function(){
  return optimizeIMG(config.paths.images.src);
});

/*------------------------------------*\
  #CSS:BUILD TASK
\*------------------------------------*/

gulp.task('css:clean', [], function(){
  return clean([config.paths.css.dst + '**/*.**']);
});

gulp.task('css:build', ['css:clean'], function(){

  var dependencies = config.dependencies.css;
  src = [config.paths.css.src + '**/*.css'];

  return concatCSS(dependencies.concat(src), config.paths.css.dst);

});

/*------------------------------------*\
  #LESS:BUILD TASK
\*------------------------------------*/

gulp.task('less:clean', [], function(){
  return clean([config.paths.less.cmp + '**/*.css', config.paths.less.dst + '**/*.**']);
});

gulp.task('less:compile', ['less:clean'], function(){
  return compileLESS(config.paths.less.src, config.paths.less.cmp);
});

gulp.task('less:build', ['less:compile'], function(){

  var dependencies = config.dependencies.css;
  src = [config.paths.less.cmp + '**/*.css'];

  return concatCSS(dependencies.concat(src), config.paths.less.dst);

});

/*------------------------------------*\
  #SASS:BUILD TASK
\*------------------------------------*/

gulp.task('sass:clean', [], function(){
  return clean([config.paths.sass.cmp + '**/*.css', config.paths.sass.dst + '**/*.**']);
});

gulp.task('sass:compile', ['sass:clean'], function(){
  return compileSASS(config.paths.sass.src, config.paths.sass.cmp);
});

gulp.task('sass:build', ['sass:compile'], function(){

  var dependencies = config.dependencies.css;
  src = [config.paths.sass.cmp + '**/*.css'];

  return concatCSS(dependencies.concat(src), config.paths.sass.dst);

});

/*------------------------------------*\
  #JS:BUILD TASK
\*------------------------------------*/

gulp.task('js:clean', [], function(){
  return clean([config.paths.js.dst + '**/*.**']);
});

gulp.task('js:build', ['js:clean'], function(){

  var dependencies = config.dependencies.js;
  src = [config.paths.js.src + '**/*.js'];

  return concatJS(dependencies.concat(src), config.paths.js.dst);

});

/*------------------------------------*\
  #ES6:BUILD TASK
\*------------------------------------*/

gulp.task('es6:clean', [], function(){
  return clean([config.paths.es6.cmp + '**/*.js', config.paths.es6.dst + '**/*.**']);
});

gulp.task('es6:transpile', ['es6:clean'], function(){
  return transpileES6(config.paths.es6.src, config.paths.es6.cmp);
});

gulp.task('es6:build', ['es6:transpile'], function(){

  var dependencies = config.dependencies.js;
      src = [config.paths.es6.cmp + '**/*.js'];

  return concatJS(dependencies.concat(src), config.paths.es6.dst);

});

/*------------------------------------*\
  #TS:BUILD TASK
\*------------------------------------*/

gulp.task('ts:clean', [], function(){
  return clean([config.paths.ts.cmp_ts + '**/*.js', config.paths.ts.cmp_es6 + '**/*.js', config.paths.ts.dst + '**/*.**']);
});

gulp.task('ts:transpile', ['ts:clean'], function(){
  return transpileTS(config.paths.ts.src, config.paths.ts.cmp_ts);
});

gulp.task('ts:es6:transpile', ['ts:transpile'], function(){
  return transpileES6(config.paths.ts.cmp_ts, config.paths.ts.cmp_es6);
});

gulp.task('ts:build', ['ts:es6:transpile'], function(){

  var dependencies = config.dependencies.js;
  src = [config.paths.ts.cmp_es6 + '**/*.js'];

  return concatJS(dependencies.concat(src), config.paths.ts.dst);

});

/*------------------------------------*\
  #GLOBAL TASKS
\*------------------------------------*/

gulp.task('build:styles', ['set:params', 'css:build', 'less:build', 'sass:build'], function(){ });

gulp.task('build:scripts', ['set:params', 'js:build', 'es6:build', 'ts:build'], function(){ });

gulp.task('build', ['build:styles', 'build:scripts'], function(){ });

gulp.task('watch', function(){

  gulp.watch(config.paths.css.watch + '**/*.css', ['set:params', 'css:build']);
  gulp.watch(config.paths.less.watch + '**/*.less', ['set:params', 'less:build']);
  gulp.watch(config.paths.sass.watch + '**/*.scss', ['set:params', 'sass:build']);

  gulp.watch(config.paths.js.watch + '**/*.js', ['set:params', 'js:build']);
  gulp.watch(config.paths.es6.watch + '**/*.es6', ['set:params', 'es6:build']);
  gulp.watch(config.paths.ts.watch + '**/*.ts', ['set:params', 'ts:build']);

});