const { exec } = require('shelljs')
const { makeMultiPlatformOperationCollection } = require('./base.operations.js')
const { getState } = require('./state.js')

const mincloudLogin = (id, key) => {
  exec(`npx mincloud logout && npx mincloud login ${id} ${key}`)
}
const mincloudLogout = () => {
  exec('npx mincloud logout')
}
const tcbLogin = (id, key) => {
  exec(`npx tcb login --apiKeyId ${id} --apiKey ${key}`)
}
const tcbLogout = () => {
  exec('npx tcb logout')
}

const loginOperationCollection = makeMultiPlatformOperationCollection({
  ifanr: (id, key) => { mincloudLogin(id, key) },
  tencent: (id, key) => { tcbLogin(id, key) }
})
const logoutOperationCollection = makeMultiPlatformOperationCollection({
  ifanr: () => { mincloudLogout() },
  tencent: () => { tcbLogout() }
})

const login = platform => (id, key) => {
  loginOperationCollection(platform)(id, key)
}
const logout = platform => () => {
  logoutOperationCollection(platform)()
}

module.exports = {
  login,
  logout,
  operate: () => {
    const operations = {
      login: () => {
        logout(getState('platform'))()
        login(getState('platform'))(getState('secretId'), getState('secretKey'))
      },
      logout: () => { logout(getState('platform'))() }
    }
    operations[getState('operation')]()
  }
}
