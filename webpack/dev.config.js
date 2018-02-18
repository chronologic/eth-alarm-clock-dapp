const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./base.config.js')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const Dotenv = require('dotenv-webpack');

module.exports = merge(baseConfig, {
  devServer: {
    historyApiFallback: true,
  },
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
                minimize: false
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
  plugins:[
    new Dotenv({
      path: '.env.dev'
    }),
    new webpack.HotModuleReplacementPlugin(),
  ]
});