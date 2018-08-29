const webpack = require('webpack');
const merge = require('webpack-merge');
const devConfig = require('./dev.config.js');
const path = require('path');
const paths = require('./paths');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(devConfig, {
  node: {
    __dirname: false,
    __filename: false
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(paths.src, 'index.html'),
      inject: true
    }),
    new webpack.ExternalsPlugin('commonjs', [
      'desktop-capturer',
      'electron',
      'ipc',
      'ipc-renderer',
      'remote',
      'web-frame',
      'clipboard',
      'crash-reporter',
      'native-image',
      'screen',
      'shell'
    ])
  ]
});
