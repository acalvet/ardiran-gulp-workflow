/*- DEPENDENCIES -*/
const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

/*- VARS -*/
const PROD = (process.env.NODE_ENV === 'production');

/*- FUNCTION -*/
function getEntries(){
  var entries = { };

  // - JS
  var entriesJS = glob.sync('./assets/scripts/src/js/**/*.js');
  if(entriesJS.length > 0)
    entries['scripts/public/app.js'] = entriesJS;

  // - CSS
  entries['styles/public/app.css'] = [ './assets/styles/src/less/app.less' ];

  if(PROD){
    // - JS - VENDOR
    var entriesVendorJS = glob.sync('./assets/vendor/**/*.js');
    if(entriesVendorJS.length > 0)
      entries['scripts/public/bundle.js'] = entriesVendorJS;

    // - CSS - VENDOR
    var entriesVendorCSS = glob.sync('./assets/vendor/**/*.css');
    if(entriesVendorCSS.length > 0)
      entries['styles/public/bundle.css'] = entriesVendorCSS;
  }

  return entries;
}

/*- CONFIGURATION -*/
module.exports = {
  entry: getEntries(),
  output: {
    path: __dirname + '/assets/',
    filename: "[name]"
  },
  resolve: {
    extensions: ['.css', '.less', '.ts', '.js', '.es6']
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loader:  ExtractTextPlugin.extract([
          {
            loader: "css-loader",
            options: {
              minimize: PROD ? true : false,
              url: false,
            }
          },
          "autoprefixer-loader",
        ])
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract([
          {
            loader: "css-loader",
            options: {
              minimize: PROD ? true : false,
              url: false,
            }
          },
          "autoprefixer-loader",
          "less-loader"
        ])
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      },
      {
        test: /.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name]'),

    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': process.env.NODE_ENV
      }
    }),
  ]
}
