const WebpackExtensionManifestPlugin = require( 'webpack-extension-manifest-plugin');
const baseManifest = require( './manifest.json');
const pkg = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const path = require('path');

module.exports = {
    entry: {
        'popup': './src/content/popup/index.js',
        'background': './src/background/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name]/index.js'
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
            template: './src/content/popup/index.html',
            filename: './popup/index.html'
        }),
        new WebpackExtensionManifestPlugin({
            config: {
                base: baseManifest,
                extend: {version: pkg.version}
            }
        })
    ]
  }