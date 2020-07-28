const { exec } = require('shelljs')
const { makeDirSync } = require('../src/utils/index.js')
const { makeMultiPlatformOperationCollection } = require('./base.operations.js')
const { getState } = require('./state.js')

const getMincloudFnRoot = () => {
  const path = `./src/cloud_functions/ifanr/${getState('project')}/`
  makeDirSync(path)
  return path
}
const getMincloudFnEntry = name => `${getMincloudFnRoot()}${name}/main.js`
const getMincloudFnOutput = name => `${getMincloudFnRoot()}${name}/index.js`

// @see https://doc.minapp.com/cloud-function/cli.html
const mincloudList = () => {
  exec('npx mincloud list')
}
const mincloudCreate = (name, root = getMincloudFnRoot()) => {
  exec(`npx mincloud new ${name} ${root}`)
}
const mincloudBuild = name => {
  exec(`npx webpack ${getMincloudFnEntry(name)} -o ${getMincloudFnOutput(name)} --target='node' --output-library-target='umd' --mode='production'`)
}
const mincloudDeploy = (name, root = getMincloudFnRoot(), remark = '') => {
  exec(`npx mincloud deploy ${name} ${root} -m ${remark}`)
}
const mincloudInvoke = (name, data = {}) => {
  exec(`npx mincloud invoke ${name} ${JSON.stringify(data)}`)
}
const mincloudPull = (name, root = getMincloudFnRoot()) => {
  exec(`npx mincloud pull ${name} ${root}`)
}
const mincloudDelete = name => {
  exec(`npx mincloud delete ${name}`)
}

const getTcbEnv = () => getState('env')
const getTcbFnRoot = () => {
  const path = `./src/cloud_functions/tencent/${getState('project')}/${getState('name')}/`
  makeDirSync(path)
  return path
}
const getTcbFnEntry = name => `${getTcbFnRoot()}/main.js`
const getTcbFnOutput = name => `${getTcbFnRoot()}/index.js`

// @see https://docs.cloudbase.net/cli/intro.html
// @see https://cloud.tencent.com/document/product/876/19360
const tcbList = (env = getTcbEnv()) => {
  exec(`npx tcb functions:list -e ${env}`)
}
const tcbCreate = name => {
  console.info('腾讯云云开发云函数请在本地手动创建之后部署至云开发中。')
}
const tcbBuild = name => {
  exec(`npx webpack ${getTcbFnEntry(name)} -o ${getTcbFnOutput(name)} --target='node' --output-library-target='umd' --mode='production'`)
}
const tcbDeploy = (name, root = getTcbFnRoot(), env = getTcbEnv()) => {
  exec(`npx tcb functions:deploy ${name} --path ${root} --force -e ${env}`)
}
const tcbInvoke = (name, data = {}, env = getTcbEnv()) => {
  exec(`npx tcb functions:invoke ${name} --params ${JSON.stringify(data)} -e ${env}`)
}
const tcbPull = (name, root = getTcbFnRoot(), env = getTcbEnv()) => {
  exec(`npx tcb functions:download ${name} ${root} -e ${env}`)
}
const tcbDelete = (name, env = getTcbEnv()) => {
  exec(`npx tcb functions:delete ${name} -e ${env}`)
}

const listOperationCollection = makeMultiPlatformOperationCollection({
  ifanr: () => { mincloudList() },
  tencent: () => { tcbList() }
})
const createOperationCollection = makeMultiPlatformOperationCollection({
  ifanr: name => { mincloudCreate(name) },
  tencent: name => { tcbCreate(name) }
})
const buildOperationCollection = makeMultiPlatformOperationCollection({
  ifanr: name => { mincloudBuild(name) },
  tencent: name => { tcbBuild(name) }
})
const deployOperationCollection = makeMultiPlatformOperationCollection({
  ifanr: name => { mincloudDeploy(name) },
  tencent: name => { tcbDeploy(name) }
})
const invokeOperationCollection = makeMultiPlatformOperationCollection({
  ifanr: name => { mincloudInvoke(name) },
  tencent: name => { tcbInvoke(name) }
})
const pullOperationCollection = makeMultiPlatformOperationCollection({
  ifanr: name => { mincloudPull(name) },
  tencent: name => { tcbPull(name) }
})
const deleteOperationCollection = makeMultiPlatformOperationCollection({
  ifanr: name => { mincloudDelete(name) },
  tencent: name => { tcbDelete(name) }
})

const list = platform => () => {
  listOperationCollection(platform)()
}
const create = platform => name => {
  createOperationCollection(platform)(name)
}
const build = platform => name => {
  buildOperationCollection(platform)(name)
}
const deploy = platform => name => {
  deployOperationCollection(platform)(name)
}
const invoke = platform => name => {
  invokeOperationCollection(platform)(name)
}
const pull = platform => name => {
  pullOperationCollection(platform)(name)
}
const del = platform => name => {
  deleteOperationCollection(platform)(name)
}

module.exports = {
  list,
  create,
  operate: () => {
    const operations = {
      list: () => { list(getState('platform'))() },
      create: () => { create(getState('platform'))(getState('name')) },
      build: () => { build(getState('platform'))(getState('name')) },
      deploy: () => { deploy(getState('platform'))(getState('name')) },
      invoke: () => { invoke(getState('platform'))(getState('name')) },
      pull: () => { pull(getState('platform'))(getState('name')) },
      delete: () => { del(getState('platform'))(getState('name')) }
    }
    operations[getState('operation')]()
  }
}
