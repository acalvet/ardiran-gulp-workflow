module.exports = {

  project: {

    styles: 'LESS', // LESS, SASS or CSS
    scripts: 'ES6', // ES6, TS or JS

  },

  env: 'DEV', // PROD or DEV

  paths: {

    images: {
      src: ['./assets/images/**/*.*', '!./assets/images/**/*.ico', '!./assets/images/**/*.svg', '!./assets/images/tmp/**/*.*'],
    },

    css: {
      src: './assets/styles/src/css/',
      dst: './assets/styles/public/css/',
      watch: './assets/styles/src/css/',
    },

    less: {
      src: './assets/styles/src/less/app.less',
      cmp: './assets/styles/cmp/less/',
      dst: './assets/styles/public/less/',
      watch: './assets/styles/src/less/',
    },

    sass: {
      src: './assets/styles/src/sass/app.scss',
      cmp: './assets/styles/cmp/sass/',
      dst: './assets/styles/public/sass/',
      watch: './assets/styles/src/sass/',
    },

    js: {
      src: './assets/scripts/src/js/',
      dst: './assets/scripts/public/js/',
      watch: './assets/scripts/src/js/',
    },

    es6: {
      src: './assets/scripts/src/es6/',
      cmp: './assets/scripts/cmp/es6/',
      dst: './assets/scripts/public/es6/',
      watch: './assets/scripts/src/es6/',
    },

    ts: {
      src: './assets/scripts/src/ts/',
      cmp_ts: './assets/scripts/cmp/ts/ts/',
      cmp_es6: './assets/scripts/cmp/ts/es6/',
      dst: './assets/scripts/public/ts/',
      watch: './assets/scripts/src/ts/',
    },

  },

  dependencies: {

    folder: './assets/vendor/',

    css: [ ],

    js: [ ],

  },

  options: {

    images: {

      kraken: {
        key: '',
        secret: '',
      },

    }

  }

};