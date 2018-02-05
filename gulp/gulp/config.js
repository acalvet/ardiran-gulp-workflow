module.exports = {
  env: 'DEV', // DEV / PROD
  project: {
    styles: 'SASS', // SASS / LESS
    js: 'ES6', // ES6 / TS / JS
    rjs: false, // true / false
  },
  paths: {
    project: './',
    css: {
      less: './assets/styles/src/less/app.less',
      sass: './assets/styles/src/scss/app.scss',
      vendor: './assets/vendor/**/**.css',
      dst: './assets/styles/public/',
    },
    js: {
      js: './assets/scripts/src/js/**/*.js',
      ts: './assets/scripts/src/ts/**/*.ts',
      es6: './assets/scripts/src/es6/**/*.js',
      vendor: './assets/vendor/**/**.js',
      rjs: ['./assets/scripts/cmp/app.js', './assets/scripts/cmp/pages/**/*.js'],
      cmp: './assets/scripts/cmp/**/**.js',
      cmp_dst: './assets/scripts/cmp/',
      dst: './assets/scripts/public/',
    },
    images: {
      src: ['./assets/images/**/*.*', '!./assets/images/**/*.ico', '!./assets/images/**/*.svg', '!./assets/images/tmp/**/*.*'],
      dst: './assets/images/',
    },
  },
  names: {
    css: {
      default: 'app.css',
      vendor: 'bundle.css',
    },
    js: {
      default: 'app.js',
      vendor: 'bundle.js',
    },
  },
  watchers: {
    css: {
      less: './assets/styles/src/less/**/*.less',
      sass: './assets/styles/src/scss/**/*.scss',
    },
    js: {
      js: './assets/scripts/src/js/**/*.js',
      ts: './assets/scripts/src/ts/**/*.ts',
      es6: './assets/scripts/src/es6/**/*.js',
    },
  },
  plugins: {
    kraken: {
      key: '5fd35c33edec264ad0dccff10a7eda9f',
      secret: 'e0d0bdb5edf0b0cb761e3a843f0c62c04c4f5f30',
    },
  },
};
