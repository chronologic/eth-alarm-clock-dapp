const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ClearDistPlugin = require('./plugins/clearDist');
const paths = require('./paths');
const WorkerPlugin = require('worker-plugin');

// Extracts the SCSS to a file
const extractSASS = new MiniCssExtractPlugin({
  filename: './main.css'
});

module.exports = {
  devtool: 'cheap-module-source-map',
  // Webpack checks this file for any additional JS dependencies to be bundled
  entry: {
    app: [path.resolve(__dirname, '../app/entry.js'), path.resolve(__dirname, '../app/index.js')]
  },

  output: {
    // Output folder in which the files will be built
    path: paths.dist,
    // All the JS files will be bundled in this one minified/obfuscated file
    filename: './[name].js'
  },

  node: {
    fs: 'empty',
    repl: 'empty'
  },

  module: {
    rules: [
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
        test: /\.js[x]?$/,
        exclude: /(node_modules|bower_components)/,
        include: path.resolve(__dirname, '../app'),
        loader: 'babel-loader'
      }
    ]
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      moment: path.resolve(__dirname, '../node_modules/moment')
    }
  },

  plugins: [
    new WorkerPlugin(),
    new ClearDistPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(paths.src, 'index.html'),
      inject: true,
      gtmScript: `
        <!-- Google Tag Manager -->
      <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-M67KRF2');</script>
      <!-- End Google Tag Manager -->`,
      gtmNoScript: `<!-- Google Tag Manager (noscript) -->
      <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-M67KRF2"
      height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
      <!-- End Google Tag Manager (noscript) -->`,
      baseTag: '<base href="/" />'
    }),

    // Directly copies certain files
    new CopyWebpackPlugin([
      { from: './app/index.html', to: 'index.html' },
      { from: './app/plugins/modernizr.custom.js', to: './js/modernizr.custom.js' },
      { from: './app/assets/img/logo', to: './img' },
      { from: './app/assets/img/favicon', to: './' }
    ]),

    // Declares global packages
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default']
    }),

    extractSASS
  ]
};
