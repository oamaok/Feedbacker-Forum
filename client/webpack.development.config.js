const shared = require('./webpack.shared.config.js')

// Webpack configuration used in development builds
module.exports = {
  ...shared,

  // Use development mode and faster buildtool
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',

}

