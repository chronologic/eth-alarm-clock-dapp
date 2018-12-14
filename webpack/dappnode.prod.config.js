const webpack = require('webpack');
const merge = require('webpack-merge');
const prodConfig = require('./prod.config.js');

module.exports = merge(prodConfig, {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        DAPPNODE: JSON.stringify(true)
      }
    })
  ]
});
