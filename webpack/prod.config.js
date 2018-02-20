const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./base.config.js');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = merge(baseConfig, {

  module: {
    rules: [
      // Loader for the stylesheets
      {
        test: /\.(css|sass|scss)$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: true
              }
            },
            {
              loader: 'resolve-url-loader'
            },
            {
              loader: 'sass-loader'
            }
          ],
          fallback: 'style-loader'
        })
      }
    ]
  },

  plugins: [
    new Dotenv({
      path: '.env.prod'
    }),
    new webpack.DefinePlugin({
     'process.env':{
       'NODE_ENV': JSON.stringify('production')
     }
   }),
    // Uglifies and minifies the JS
    new UglifyJSPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        },
        output: {
          comments: false
        }
      }
    })
  ]
});
