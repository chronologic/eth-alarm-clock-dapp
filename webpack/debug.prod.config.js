const prodConfig = require('./prod.config.js');
const merge = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge(prodConfig, {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
});
