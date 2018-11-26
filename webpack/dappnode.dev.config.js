const webpack = require('webpack');
const merge = require('webpack-merge');
const devConfig = require('./dev.config.js');

module.exports = merge(devConfig, {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        DAPPNODE: JSON.stringify(true)
      }
    })
  ]
});
