const ChromeExtensionReloader  = require('webpack-chrome-extension-reloader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const path = require('path');

module.exports = {
    entry: {
        'popup': './src/popup/index.js',
        'background': './src/background/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '/[name]/index.js'
    },
    module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            chunks: ['popup'],
            template: './[name]/index.html',
            filename: './[name]/index.html'
        })
    ]
  }