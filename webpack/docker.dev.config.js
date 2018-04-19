const webpack = require('webpack');
const merge = require('webpack-merge');
const devConfig = require('./dev.config.js');

module.exports = merge(devConfig, {
  plugins:[
    new webpack.DefinePlugin({
     'process.env':{
       'NODE_ENV': JSON.stringify('docker'),
       'DAY_TOKEN_ADDRESS_DOCKER': JSON.stringify(process.env.DAY_TOKEN_ADDRESS_DOCKER),
       'DAY_TOKEN_ABI_DOCKER': JSON.stringify(process.env.DAY_TOKEN_ABI_DOCKER),
       'DAY_FAUCET_ADDRESS_DOCKER': JSON.stringify(process.env.DAY_FAUCET_ADDRESS_DOCKER),
       'DAY_FAUCET_ABI_DOCKER': JSON.stringify(process.env.DAY_FAUCET_ABI_DOCKER)
     }
    })
  ]
});