const ChromeExtensionReloader  = require('webpack-chrome-extension-reloader')
const merge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
    mode: 'development',
    watch: true,
    plugins: [
 /*       new ChromeExtensionReloader({
            port: 9090, // Which port use to create the server
            reloadPage: true, // Force the reload of the page also
            entries: { // The entries used for the content/background scripts
              contentScript: 'popup', // Use the entry names, not the file name or the path
              background: 'background' // *REQUIRED
            }
          })*/
    ]
})
