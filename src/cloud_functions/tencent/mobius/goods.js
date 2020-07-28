const { REQUEST_TYPES } = require('../../../const/index.js')
const { makeSuccessResponse, makeFailResponse } = require('../../../common/index.js')
const tcb = require('tcb-admin-node')

const ENV_VARS = {
  goodsCollectionName: 'mobius_goods'
}

const cloud = tcb.init({
  env: tcb.getCurrentEnv()
})
const db = cloud.database()
const _ = db.command

const getGoodsInfo = async ({ goodsId }) => {
  console.log(`[getGoodsInfo] goodsId: ${goodsId}`)
  const res = await db
    .collection(ENV_VARS.goodsCollectionName)
    .where({
      id: _.eq(goodsId)
    })
    .get()
  console.log(`[getGoodsInfo] raw res -> ${JSON.stringify(res)}`)
  return res.data[0] || null
}

const handlers = {
  [REQUEST_TYPES.goodsInfo]: async ({ goodsId }) => {
    const requestType = REQUEST_TYPES.goodsInfo
    console.log(`[handlers][${requestType}] goodId -> ${goodsId}`)

    const res = await getGoodsInfo({ goodsId: goodsId }).then(goodsInfo => {
      if (goodsInfo) {
        return makeSuccessResponse({ [requestType]: goodsInfo })
      } else {
        return makeFailResponse(`Can not find goodsId in database: ${goodsId}`)
      }
    })

    return res
  }
}

const main = async (event, context) => {
  const { body } = event
  const { action, payload } = JSON.parse(body)
  const { type } = payload
  console.log(`[main] action -> ${action}, type -> ${type}`)

  return await handlers[type](payload)
}

exports.main = main
