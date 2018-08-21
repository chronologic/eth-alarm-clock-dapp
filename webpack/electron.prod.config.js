const webpack = require('webpack');
const path = require('path');
const paths = require('./paths');
const merge = require('webpack-merge');
const prodConfig = require('./prod.config.js');

module.exports = merge(prodConfig, {
  entry: {
    main: path.join(paths.electron, 'main/index.js')
  },
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
