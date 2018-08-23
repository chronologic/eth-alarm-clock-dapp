const webpack = require('webpack');
const merge = require('webpack-merge');
const devConfig = require('./dev.config.js');

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
