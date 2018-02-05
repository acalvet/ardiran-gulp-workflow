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
function js_build(data, dst, fileName){
  var FILENAME_ISEMPTY = fileName == '-1';
  return data.pipe(plugins.if(!PROD, plugins.sourcemaps.init()))
      .pipe(plugins.if(PROD, plugins.uglify()))
      .pipe(plugins.if(!FILENAME_ISEMPTY, plugins.concat(fileName)))
      .pipe(plugins.if(!PROD, plugins.sourcemaps.write('.')))
      .pipe(gulp.dest(dst));
}

/**
 * Concatena multiples ficheros js en un solo fichero js.
 * @param  src       Carpeta de entrada
 * @param  dst       Carpeta de destino
 * @param  fileName  Nombre del fichero generado.
 */
function js_concat(src, dst, fileName){
  var data = gulp.src(src);
  return js_build(data, dst, fileName);
}

/**
 * Optimiza los ficheros js si utilizamos require JS
 * @param  src       Carpeta de entrada
 * @param  dst       Carpeta de destino
 */
function rjs(src, dst){
  var data =
    gulp.src(src)
        .pipe(plugins.requirejsOptimize({
          optimize: "none",
          optimizeAllPluginResources: true,
          findNestedDependencies: true,
          removeCombined: true,
        }));
  return js_build(data, dst, '-1');
}

/**
 * Transpila de ES6 a ES5
 * @param  data      Datos de entrada
 * @param  dst       Carpeta de destino
 */
function es6_to_es5(data, dst){
  return data.pipe(plugins.babel({
        presets: ["es2015"],
        plugins: ["transform-es2015-modules-amd"],
        // moduleIds: true
       }))
       .pipe(gulp.dest(dst));
}

/**
 * Compilar los ficheros typescript
 * @param  src       Carpeta de entrada
 * @param  dst       Carpeta de destino
 */
function ts(src, dst){
  var tsResult =
    gulp.src(src)
        .pipe(plugins.typescript({
           removeComments : true,
           // module : 'amd',
           target: "ES6",
         }));
  return es6_to_es5(tsResult.js, dst);
}


module.exports = {
  js_build: js_build,
  js_concat: js_concat,
  rjs: rjs,
  es6_to_es5: es6_to_es5,
  ts: ts,
};
