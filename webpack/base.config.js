const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

// Extracts the SCSS to a file
const extractSass = new ExtractTextPlugin({
  filename: './main.css'
})

module.exports = {

  // Webpack checks this file for any additional JS dependencies to be bundled
  entry: {
    app: [
      path.resolve(__dirname, '../app/entry.js'),
      path.resolve(__dirname, '../app/index.js')
    ],
  },

  output: {
    // Output folder in which the files will be built
    path: path.resolve(__dirname, '../out'),
    // All the JS files will be bundled in this one minified/obfuscated file
    filename: './js/[name].bundle.js'
  },

  node: {
    fs: 'empty',
    repl: 'empty'
  },

  module: {

    rules: [
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
      },

      // Loader for the image files
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: 'img/[name].[ext]'
        }
      },

      // Loader for the fonts
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]'
        }
      },

      {
        test: /\.json$/,
        use: 'json-loader'
      },

      {
        test: /\.js[x]?$/,
        exclude: /(node_modules|bower_components)/,
        include: path.resolve(__dirname, '../app'),
        loader: 'babel-loader',
        options: {
          presets: ["es2015", "env", "react"],
          plugins: [
              "transform-runtime",
              'transform-decorators-legacy',
              'transform-class-properties'
          ]
        }
      }
    ]
  },

  resolve: {
    extensions: ['.js', '.jsx']
  },

  plugins: [
    // Directly copies certain files
    new CopyWebpackPlugin([
      { from: './app/index.html', to: 'index.html' },
      { from: './app/plugins/modernizr.custom.js', to: './js/modernizr.custom.js' },
      { from: './app/assets/img/logo', to: './img' }
    ]),

    // Declares global packages
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default']
    }),

    extractSass
  ]

}
