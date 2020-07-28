const { TRADE_STATES, REQUEST_TYPES } = require('../../../const/index.js')
const { isEmptyObj } = require('../../../utils/index.js')
const {
  wepaySign, isValidWepaySign,
  makeSuccessResponse, makeFailResponse, makeErrorResponse,
  randomString
} = require('../../../common/index.js')
const { axios } = require('../../../libs/axios.js')
const { toJSON } = require('../../../libs/xml.js')
const tcb = require('tcb-admin-node')

const ENV_VARS = {
  appId: process.env.appId,
  mchId: process.env.mchId,
  apiKey: process.env.apiKey,
  orderNotifyUrl: process.env.orderNotifyUrl,
  orderCollectionName: 'mobius_order'
}

const cloud = tcb.init({
  env: tcb.getCurrentEnv()
})
const db = cloud.database()
const _ = db.command

const createOrder = async ({ outTradeNo, openid, goods, attach, tradeType, tradeState, tradeDetail, deviceInfo }) => {
  console.log(`[createOrder] outTradeNo -> ${outTradeNo}, openid -> ${openid}, tradeType -> ${tradeType}`)
  console.log(`[createOrder] goods -> ${JSON.stringify(goods)}, attach -> ${attach}, deviceInfo -> ${deviceInfo}`)
  console.log(`[createOrder] tradeState -> ${tradeState}, tradeDetail -> ${JSON.stringify(tradeDetail)}`)

  const res = await db
    .collection(ENV_VARS.orderCollectionName)
    .add({ outTradeNo, openid, goods, attach, tradeType, tradeState, tradeDetail, deviceInfo })

  console.log(`[createOrder] res -> ${JSON.stringify(res)}`)
  return { id: res.id }
}
const getOrder = async ({ outTradeNo, openid }) => {
  console.log(`[getOrder] outTradeNo -> ${outTradeNo}, openid -> ${openid}`)
  const res = await db
    .collection(ENV_VARS.orderCollectionName)
    .where({
      outTradeNo: _.eq(outTradeNo),
      openid: _.eq(openid)
    })
    .get()
  console.log(`[getOrder] raw res => ${JSON.stringify(res)}`)
  return res.data[0] || null
}
const updateOrder = async ({ outTradeNo, openid, changes }) => {
  console.log(`[updateOrder] outTradeNo -> ${outTradeNo}, openid -> ${openid}`)
  console.log(`[updateOrder] changes -> ${JSON.stringify(changes)}`)
  const order = await getOrder({ outTradeNo, openid })
  if (!order) {
    throw new Error(`Can not find order: outTradeNo -> ${outTradeNo}, openid -> ${openid}`)
  }
  const updates = {
    // 【微信服务器发送到回调地址的支付结果】与【主动调用查询订单状态接口返回的结果】字段不一致，只有后者有 trade_state，但两者都有 result_code
    // @see 支付结果通知： https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_7
    // @see 查询订单： https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_2
    tradeState: changes.trade_state || changes.result_code || order.tradeState,
    tradeDetail: changes
  }
  const res = await db
    .collection(ENV_VARS.orderCollectionName)
    .doc(order._id)
    .update({
      tradeState: updates.tradeState,
      tradeDetail: _.set(updates.tradeDetail)
    })
  console.log(`[updateOrder] raw res -> ${JSON.stringify(res)}`)
  return {
    updated: res.updated === 1,
    outTradeNo,
    openid,
    goods: order.goods,
    attach: order.attach,
    deviceInfo: order.deviceInfo,
    tradeType: order.tradeType,
    older: {
      tradeState: order.tradeState,
      tradeDetail: order.tradeDetail
    },
    newer: {
      ...updates
    }
  }
}
const queryTradeDetail = async ({ appId, mchId, outTradeNo, nonceStr, signType, apiKey }) => {
  const data = wepaySign({
    params: { appid: appId, mch_id: mchId, out_trade_no: outTradeNo, nonce_str: nonceStr, sign_type: signType },
    apiKey: apiKey
  }, { isXmlify: true })
  console.log(`[queryTradeDetail] raw data -> ${JSON.stringify(data)}`)
  return new Promise((resolve, reject) => {
    axios({
      url: 'https://api.mch.weixin.qq.com/pay/orderquery',
      method: 'POST',
      data: data
    }).then(response => {
      if (response.status === 200) {
        console.log(`[queryTradeDetail] raw res -> ${JSON.stringify(response.data)}`)
        if (!response.data) {
          reject(Error('No data field found in response'))
        }
        toJSON(response.data).then(({ xml: data }) => {
          if (data.return_code === 'FAIL') {
            reject(Error(`${data.return_code}: ${data.return_msg}`))
          }
          if (data.result_code === 'FAIL') {
            reject(Error(`${data.err_code}: ${data.err_code_des}`))
          }
          resolve(data)
        })
      } else {
        reject(Error(`${response.status}: ${response.statusText}`))
      }
    })
      .catch(reject)
  })
}

const updateOrderProxy = async ({ outTradeNo, openid, changes, orderNotifyUrl }) => {
  const updates = await updateOrder({ outTradeNo, openid, changes })
  if (updates.updated && orderNotifyUrl) {
    const requestType = REQUEST_TYPES.orderNotify
    console.log(`[updateOrderProxy] send notify to -> ${orderNotifyUrl}`)
    axios({
      url: orderNotifyUrl,
      method: 'POST',
      data: {
        action: 'set',
        payload: {
          type: requestType,
          ...updates
        }
      }
    })
      .then(response => {
        if (response.status === 200) {
        // TODO: 通知相应失败的多次重试机制
          console.log(`[updateOrderProxy] raw res -> ${JSON.stringify(response.data)}`)
          console.log(`[updateOrderProxy] echo status received -> ${response.data.status}`)
          if (!response.data) {
            console.log('[updateOrderProxy] \'No data field found in response\'')
          }
        } else {
          console.log(`[updateOrderProxy] ${response.status}: ${response.statusText}`)
        }
      })
      .catch(err => {
        console.log(`[updateOrderProxy] err -> ${err}`)
      })
  }
  return updates
}

const handlers = {
  [REQUEST_TYPES.createOrder]: async ({ outTradeNo, openid, goods, attach, tradeType, tradeState, tradeDetail, deviceInfo }) => {
    const requestType = REQUEST_TYPES.createOrder
    console.log(`[handlers][${requestType}] outTradeNo -> ${outTradeNo}, openid -> ${openid}, tradeType -> ${tradeType}`)
    console.log(`[handlers][${requestType}] tradeState -> ${tradeState}, tradeDetail -> ${JSON.stringify(tradeDetail)}`)
    console.log(`[handlers][${requestType}] goods -> ${JSON.stringify(goods)}, attach -> ${attach}`)

    tradeState = tradeState || TRADE_STATES.notpay
    tradeDetail = tradeDetail || {}
    const res = await createOrder({ outTradeNo, openid, goods, attach, tradeType, tradeState, tradeDetail, deviceInfo })
      .then(res => makeSuccessResponse({ [requestType]: res }))
      .catch(err => makeErrorResponse(err))
    return res
  },
  [REQUEST_TYPES.getOrder]: async ({ outTradeNo, openid }) => {
    const requestType = REQUEST_TYPES.getOrder
    console.log(`[handlers][${requestType}] outTradeNo -> ${outTradeNo}, openid -> ${openid}`)

    const res = await getOrder({ outTradeNo, openid })
      .then(order => order ? makeSuccessResponse({ [requestType]: order })
        : makeFailResponse(`Can not find order: outTradeNo -> ${outTradeNo}, openid -> ${openid}`)
      )
      .catch(err => makeErrorResponse(err))
    return res
  },
  [REQUEST_TYPES.updateOrder]: async ({ outTradeNo, openid, changes, orderNotifyUrl }) => {
    const requestType = REQUEST_TYPES.updateOrder
    console.log(`[handlers][${requestType}] outTradeNo -> ${outTradeNo}, openid -> ${openid}`)
    console.log(`[handlers][${requestType}] changes -> ${JSON.stringify(changes)}`)

    const res = await updateOrderProxy({ outTradeNo, openid, changes, orderNotifyUrl })
      .then(res => makeSuccessResponse({ [requestType]: res }))
      .catch(err => makeErrorResponse(err))
    return res
  },
  [REQUEST_TYPES.checkTradeState]: async ({ outTradeNo, openid, appId, mchId, apiKey, orderNotifyUrl, forceQuery = false }) => {
    const requestType = REQUEST_TYPES.checkTradeState
    console.log(`[handlers][${requestType}] outTradeNo -> ${outTradeNo}, openid -> ${openid}`)
    console.log(`[handlers][${requestType}] appId -> ${appId}, mchId -> ${mchId}, apiKey -> ${!!apiKey}`)
    const nonceStr = randomString(16)
    const signType = 'MD5'

    let res
    const order = await getOrder({ outTradeNo, openid })
    if (!order) {
      res = makeFailResponse(`Can not find order: outTradeNo -> ${outTradeNo}, openid -> ${openid}`)
    } else {
      // 若数据库中无订单详情或者请求中指定了强制拉取最新的订单详情，则拉取最新的订单详情
      // 否则直接返回订单状态
      if (isEmptyObj(order.tradeDetail) || forceQuery) {
        const tradeDetail = await queryTradeDetail({ appId, mchId, outTradeNo, nonceStr, signType, apiKey })
        const isValidTradeDetail = isValidWepaySign({ params: tradeDetail, apiKey })
        if (!isValidTradeDetail) {
          res = makeFailResponse('Unvaild trade tradeDetail, pls retry later')
        } else {
          res = await updateOrderProxy({ outTradeNo, openid, changes: tradeDetail, orderNotifyUrl })
            .then(updates => makeSuccessResponse({
              [requestType]: {
                outTradeNo: updates.outTradeNo,
                openid: updates.openid,
                older: updates.older.tradeState,
                newer: updates.newer.tradeState
              }
            }))
            .catch(err => makeErrorResponse(err))
        }
      } else {
        res = makeSuccessResponse({
          [requestType]: {
            outTradeNo: order.outTradeNo,
            openid: order.openid,
            older: undefined,
            newer: order.tradeState
          }
        })
      }
    }

    return res
  }
}

const main = async (event, context) => {
  const { body } = event
  const { action, payload } = JSON.parse(body)
  const { type } = payload
  console.log(`[main] action -> ${action}, type -> ${type}`)

  const newPayload = {
    ...payload,
    appId: ENV_VARS.appId,
    mchId: ENV_VARS.mchId,
    apiKey: ENV_VARS.apiKey,
    orderNotifyUrl: ENV_VARS.orderNotifyUrl
  }

  return await handlers[type](newPayload)
}

exports.main = main
