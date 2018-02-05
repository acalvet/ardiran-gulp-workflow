'use strict';

var gulp = require('gulp'),
    config = require('../config'),
    plugins = require('gulp-load-plugins')();

var PROD = config.env == 'PROD' ? true : false;

/**
 * Optimiza y compila en un solo fichero todos los datos de entrada que recibe.
 * @param  data      Datos de entrada
 * @param  dst       Carpeta destino
 * @param  fileName  Nombre del fichero generado.
 */
function css_build(data, dst, fileName){
  return data.pipe(plugins.if(!PROD, plugins.sourcemaps.init()))
      .pipe(plugins.autoprefixer({ browsers: ['last 2 versions', '> 5%', 'Firefox ESR'] }))
      .pipe(plugins.if(PROD, plugins.cleanCss({ rebase: false, })))
      .pipe(plugins.concat(fileName))
      .pipe(plugins.if(!PROD, plugins.sourcemaps.write('.')))
      .pipe(gulp.dest(dst));
}

/**
 * Concatena multiples ficheros js en un solo fichero css.
 * @param  src       Carpeta de entrada
 * @param  dst       Carpeta de destino
 * @param  fileName  Nombre del fichero generado.
 */
function css_concat(src, dst, fileName){
  var data = gulp.src(src);
  return css_build(data, dst, fileName);
}

/**
 * Compila los ficheros .less de entrada en un solo fichero .css de salida.
 * @param  src       Carpeta de entrada
 * @param  dst       Carpeta de destino
 * @param  fileName  Nombre del fichero generado.
 */
function less(src, dst, fileName){
  var data = gulp.src(src)
                 .pipe(plugins.less());
  return css_build(data, dst, fileName);
}

/**
 * Compila los ficheros .sass de entrada en un solo fichero .css de salida.
 * @param  src       Carpeta de entrada
 * @param  dst       Carpeta de destino
 * @param  fileName  Nombre del fichero generado.
 */
function sass(src, dst, fileName){
  var data = gulp.src(src)
                 .pipe(plugins.sass());
  return css_build(data, dst, fileName);
}

module.exports = {
  css_build: css_build,
  css_concat: css_concat,
  less: less,
  sass: sass,
};
