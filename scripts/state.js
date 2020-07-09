const { get, hardDeepMerge } = require('../src/utils/index.js')

let state = {}

const setState = changes => {
  state = hardDeepMerge(state, changes)
}

const getState = path => get(state, path)

module.exports = {
  state,
  setState,
  getState
}
