const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./base.config.js');
const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(baseConfig, {
  mode: 'production',
  module: {
    rules: [
      // Loader for the stylesheets
      {
        test: /\.(css|sass|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              minimize: false,
              importLoaders: 1
            }
          },
          { loader: 'postcss-loader', options: { sourceMap: true } },
          { loader: 'resolve-url-loader' },
          { loader: 'sass-loader' }
        ]
      }
    ]
  },

  plugins: [
    new Dotenv({
      path: '.env.prod'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ],

  optimization: {
    minimize: true,
    minimizer: [
      // Uglifies and minifies the JS
      new TerserPlugin({
        parallel: true,
        // https://github.com/ethereum/web3.js/issues/1043
        terserOptions: {
          mangle: {
            reserved: ['BigNumber']
          }
        }
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new CompressionPlugin({
        test: /\.js$|\.css$|\.html$/,
        threshold: 10240,
        minRatio: 0
      })
    ]
  }
});
