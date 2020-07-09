const path = require('path')
const fnName = 'mobius_theme'

const getEntry = () => {
  return `./src/cloud_functions/ifanr/cigaret/${fnName}/main.js`
}
const getOutputPath = () => {
  return path.resolve(__dirname, `src/cloud_functions/ifanr/cigaret/${fnName}/`)
}

module.exports = {
  entry: getEntry(),
  output: {
    path: getOutputPath(),
    filename: 'index.js',
    // library: 'exports.main',
    libraryTarget: 'umd'
  },
  target: 'node',
  mode: 'development'
}
