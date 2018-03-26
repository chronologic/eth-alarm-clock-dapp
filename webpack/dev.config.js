const merge = require('webpack-merge');
const baseConfig = require('./base.config.js');
const Dotenv = require('dotenv-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
        use: [
          MiniCssExtractPlugin.loader,
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
        ]
      }
		]
  },
  plugins:[
    new Dotenv({
      path: '.env.dev'
    })
  ]
});