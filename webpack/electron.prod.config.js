const webpack = require('webpack');
const merge = require('webpack-merge');
const prodConfig = require('./prod.config.js');

module.exports = merge(prodConfig, {
  node: {
    __dirname: false,
    __filename: false
  },
  devtool: undefined,
  optimization: {
    minimize: false
  },
  plugins: [
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
