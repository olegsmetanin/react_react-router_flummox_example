'use strict';

var webpack = require('webpack');

module.exports = {
  entry: {
  	app:'./src/assets/js/apps/apps.js',
  	lib: ["babel/polyfill", 'react', 'react-router', 'flummox', 'jquery', 'superagent', 'cheerio', 'fastclick', 'd3', 'lru-cache']
  },
  output: {
    path: __dirname + '/dest/assets/js',
    filename: 'apps.js',
    publicPath: '/assets/js/'
  },
  devtool: "#source-map",
  plugins: [
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //       warnings: false
    //   }
    // }),
	new webpack.optimize.CommonsChunkPlugin("lib", 'lib.js')
  ],
  resolve: {
    extensions: ["", ".jsx", ".js", ".json"]
  },
  cache: true,
  module: {
    loaders: [
      { test: /\.jsx?$/, loaders: ['babel-loader?stage=1'], exclude: /node_modules/ },
      { test: /\.js?$/, loaders: ['babel-loader?stage=1'], exclude: /node_modules/ },
      { test: /\.json$/, loader: "json-loader" }
    ]
  }
};