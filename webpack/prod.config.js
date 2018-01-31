const merge = require('webpack-merge');
const baseConfig = require('./base.config.js');
const webpack = require('webpack')

module.exports = merge(baseConfig, {
	plugins: [
		// Uglifies and minifies the JS
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			},
			output: {
				comments: false
			}
		})
	]
});