'use strict';

var gulp = require('gulp'),
    config = require('../config'),
    plugins = require('gulp-load-plugins')();

/**
 * Optimizar las imagenes de una carpeta utilizando la API de Kraken.io
 * @param  src       Carpeta de entrada
 * @param  dst       Carpeta de destino
 */
function images_optimize(src, dst){
  return gulp.src(src)
      .pipe(plugins.kraken({
        key: config.plugins.kraken.key,
        secret: config.plugins.kraken.secret,
        lossy: true,
        concurrency: 6
      }));
}

module.exports = {
  images_optimize: images_optimize,
};
