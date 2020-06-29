const  path = require('path')
module.exports = {
  entry: './ifanr_cigaret/cigaret_config/main.js',
  output: {
    path: path.resolve(__dirname, 'ifanr_cigaret/cigaret_config/'),
    filename: 'index.js',
    // library: 'exports.main',
    libraryTarget: 'umd',
  },
  target: 'node',
  mode: 'development'
}
