const merge = require('webpack-merge');
const baseConfig = require('./base.config.js');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = merge(baseConfig, {
  mode: 'development',
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
                minimize: false,
                importLoaders: 1
              }
            },
            { loader: 'postcss-loader', options: { sourceMap: true } },
            { loader: 'resolve-url-loader' },
            { loader: 'sass-loader' }
          ],
          fallback: 'style-loader'
        })
      }
		]
  },
  plugins:[
    new Dotenv({
      path: '.env.dev'
    })
  ]
});