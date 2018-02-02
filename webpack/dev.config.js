const merge = require('webpack-merge')
const baseConfig = require('./base.config.js')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = merge(baseConfig, {

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
              loader: 'sass-loader'
            }
          ],
          fallback: 'style-loader'
        })
      }
		]
	}
	
});