const { REQUEST_TYPES } = require('../../../const/index.js')
const { randomString } = require('../../../common/index.js')
const { axios } = require('../../../libs/axios.js')
const { md5 } = require('../../../libs/crypto.js')
const { toJSON } = require('../../../libs/xml.js')
const {
  concatParams, xmlify, isValidWepaySign,
  makeSuccessResponse, makeFailResponse, isSuccessResponse
} = require('../../../common/index.js')
const { isArray } = require('../../../utils/index.js')

const ENV_VARS = {
  appId: process.env.appId,
  mchId: process.env.mchId,
  apiKey: process.env.apiKey,
  notifyUrl: process.env.notifyUrl,
  goodsUrl: process.env.goodsUrl,
  orderUrl: process.env.orderUrl
}

const getGoodsInfo = async ({ goodsUrl, goodsId }) => {
  console.log(`[getGoodsInfo] goodsId -> ${goodsId}`)
  const type = REQUEST_TYPES.goodsInfo
  return new Promise((resolve, reject) => {
    axios({
      url: goodsUrl,
      method: 'POST',
      data: {
        action: 'get',
        payload: {
          type: type,
          goodsId: goodsId
        }
      }
    }).then(response => {
      if (response.status === 200) {
        console.log(`[getGoodsInfo] raw response data -> ${JSON.stringify(response.data)}`)
        if (response.data) {
          if (response.data.status === 'success') {
            resolve(response.data.data[type])
          } else {
            reject(response.data)
          }
        } else {
          reject(Error('No data field found in response'))
        }
      } else {
        reject(Error(`${response.status}: ${response.statusText}`))
      }
    }).catch(reject)
  })
}
const createOrder = async ({ orderUrl, outTradeNo, openid, goods, attach, tradeType, deviceInfo }) => {
  console.log(`[createOrder] outTradeNo -> ${outTradeNo}, openid -> ${openid}, tradeType -> ${tradeType}`)
  console.log(`[createOrder] goods -> ${JSON.stringify(goods)}, attach -> ${attach}, deviceInfo -> ${deviceInfo}`)
  const type = REQUEST_TYPES.createOrder
  return new Promise((resolve, reject) => {
    axios({
      url: orderUrl,
      method: 'POST',
      data: {
        action: 'set',
        payload: {
          type: type,
          outTradeNo,
          openid,
          goods,
          attach,
          tradeType,
          deviceInfo
        }
      }
    }).then(response => {
      if (response.status === 200) {
        console.log(`[createOrder] raw response data -> ${JSON.stringify(response.data)}`)
        if (response.data) {
          if (response.data.status === 'success') {
            resolve(response.data.data[type])
          } else {
            reject(response.data)
          }
        } else {
          reject(Error('No data field found in response'))
        }
      } else {
        reject(Error(`${response.status}: ${response.statusText}`))
      }
    }).catch(reject)
  })
}

// @see: https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_1
const requestPrepay = (data) => {
  console.log(`[getOrder] raw data -> ${JSON.stringify(data)}`)
  return new Promise((resolve, reject) => {
    axios({
      url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
      method: 'POST',
      data: data
    })
      .then(response => {
        if (response.status === 200) {
          console.log(`[getOrder] raw res -> ${JSON.stringify(response.data)}`)
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
const buildPrepayParam = ({
  appId, mchId,
  deviceInfo, body, detail, attach,
  outTradeNo, totalFee, clientIp, notifyUrl, openid, tradeType,
  apiKey
}) => {
  const params = {
    appid: appId,
    mch_id: mchId,
    device_info: deviceInfo,
    nonce_str: randomString(32),
    sign_type: 'MD5',
    body: body,
    detail: detail,
    attach: attach,
    out_trade_no: outTradeNo,
    fee_type: 'CNY',
    total_fee: totalFee,
    spbill_create_ip: clientIp,
    notify_url: notifyUrl,
    trade_type: tradeType,
    openid: openid
  }
  console.log(`[buildOrderParam] params -> ${JSON.stringify(params)}`)
  const stringToSign = `${concatParams(params)}&key=${apiKey}`
  console.log(`[buildOrderParam] stringToSign -> ${JSON.stringify(stringToSign)}`)
  const sign = md5(stringToSign).toUpperCase()
  console.log(`[buildOrderParam] sign -> ${sign}`)
  const newParams = { ...params, sign }
  console.log(`[buildOrderParam] newParams: ${JSON.stringify(newParams)}`)
  return xmlify(newParams)
}

const buildWepayParams = ({ appId, prepayId, apiKey }) => {
  // NOTE: 下面涉及到的两个 timestamp 字段键名不一致
  // @see https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#58
  const params = {
    appId: appId,
    timeStamp: Math.floor(new Date().getTime() / 1000),
    nonceStr: randomString(32),
    package: `prepay_id=${prepayId}`,
    signType: 'MD5'
  }
  console.log(`[buildWepayParams] params -> ${JSON.stringify(params)}`)
  const stringToSign = `${concatParams(params)}&key=${apiKey}`
  console.log(`[buildWepayParams] stringToSign -> ${JSON.stringify(stringToSign)}`)
  const sign = md5(stringToSign).toUpperCase()
  console.log(`[buildWepayParams] sign -> ${sign}`)
  const newParams = {
    timestamp: params.timeStamp,
    nonceStr: params.nonceStr,
    package: params.package,
    signType: params.signType,
    paySign: sign
  }
  console.log(`[buildWepayParams] newParams: ${JSON.stringify(newParams)}`)
  return newParams
}

const neatenGoods = async ({ goodsUrl, goods }) => {
  console.log(`[neatenGoods] goods -> ${JSON.stringify(goods)}`)
  let name, price

  const id = goods[0].id
  if (id) {
    console.log(`[neatenGoods] id provided, get goods info from third party url -> ${JSON.stringify(id)}`)
    const goodsInfo = await getGoodsInfo({ goodsUrl: goodsUrl, goodsId: id }).then(goodsInfo => {
      return goodsInfo
    })
    name = goodsInfo.name
    price = goodsInfo.price
    goods[0].name = name
    goods[0].price = price
  } else {
    goods[0].id = ''
    name = goods[0].name
    price = goods[0].price
  }

  // TODO: 添加 mutil goods 处理逻辑

  const detail = 'empty'

  const res = {
    name,
    price,
    goods,
    detail
  }

  console.log(`[neatenGoods] res -> ${JSON.stringify(res)}`)
  return res
}

const handlers = {
  [REQUEST_TYPES.JSAPIWepay]: async payload => {
    const requestType = REQUEST_TYPES.JSAPIWepay
    console.log(`[handlers][${requestType}] payload -> ${JSON.stringify(payload)}`)

    const {
      appId, mchId, deviceInfo, body, detail, attach, outTradeNo, totalFee, clientIp, notifyUrl, openid, tradeType,
      apiKey, orderUrl, goods
    } = payload
    const prepayParam = buildPrepayParam({
      appId,
      mchId,
      deviceInfo,
      body,
      detail,
      attach,
      outTradeNo,
      totalFee,
      clientIp,
      notifyUrl,
      openid,
      tradeType,
      apiKey
    })
    console.log(`[handlers][${requestType}] prepayParam -> ${JSON.stringify(prepayParam)}`)

    let res
    const prepayRes = await requestPrepay(prepayParam)
    console.log(`[handlers][${requestType}] prepayRes -> ${JSON.stringify(prepayRes)}`)
    const isValidPrepay = isValidWepaySign({ params: prepayRes, apiKey: apiKey })

    let wepayParams
    if (isValidPrepay) {
      wepayParams = buildWepayParams({ appId: prepayRes.appid, prepayId: prepayRes.prepay_id, apiKey: apiKey })
      wepayParams = { ...wepayParams, outTradeNo, openid }
      console.log(`[handlers][${requestType}] wepayParams -> ${JSON.stringify(wepayParams)}`)
    } else {
      res = makeFailResponse('Unvaild prepay res, pls retry later')
    }

    // orderUrl 是可选项，如果提供的话会试图新建一条订单记录
    //   -> 订单记录新建失败会导致本次支付请求失败，即使 prepay 已经请求成功
    if (wepayParams && orderUrl) {
      console.log(`[handlers][${requestType}] orderUrl is provided -> ${orderUrl}`)
      const createOrderRes = await createOrder({ orderUrl, outTradeNo, openid, goods, attach, tradeType, deviceInfo })
        .then(res => makeSuccessResponse({ [REQUEST_TYPES.createOrder]: res }))
        .catch(originalResponse => originalResponse)
      if (!isSuccessResponse(createOrderRes)) {
        res = createOrderRes
      } else {
        res = makeSuccessResponse({ [requestType]: wepayParams })
      }
    } else {
      console.log(`[handlers][${requestType}] orderUrl is not provided -> ${orderUrl}`)
      res = makeSuccessResponse({ [requestType]: wepayParams })
    }
    return res
  },
  [REQUEST_TYPES.NATIVEWepay]: async (payload) => {
    const requestType = REQUEST_TYPES.NATIVEWepay
    console.log(`[handlers][${requestType}] payload -> ${JSON.stringify(payload)}`)

    const {
      appId, mchId, deviceInfo, body, detail, attach,
      outTradeNo, totalFee, clientIp, notifyUrl, openid, tradeType,
      apiKey, orderUrl, goods
    } = payload
    const prepayParam = buildPrepayParam({
      appId,
      mchId,
      deviceInfo,
      body,
      detail,
      attach,
      outTradeNo,
      totalFee,
      clientIp,
      notifyUrl,
      openid,
      tradeType,
      apiKey
    })
    console.log(`[handlers][${requestType}] prepayParam -> ${JSON.stringify(prepayParam)}`)

    let res
    const prepayRes = await requestPrepay(prepayParam)
    console.log(`[handlers][${requestType}] prepayRes -> ${JSON.stringify(prepayRes)}`)
    const isValidPrepay = isValidWepaySign({ params: prepayRes, apiKey: apiKey })

    let wepayParams
    if (isValidPrepay) {
      wepayParams = { codeUrl: prepayRes.code_url }
      wepayParams = { ...wepayParams, outTradeNo, openid }
      console.log(`[handlers][${requestType}] wepayParams -> ${JSON.stringify(wepayParams)}`)
    } else {
      res = makeFailResponse('Unvaild prepay res, pls retry later')
    }

    if (wepayParams && orderUrl) {
      console.log(`[handlers][${requestType}] orderUrl is provided -> ${orderUrl}`)
      const createOrderRes = await createOrder({ orderUrl, outTradeNo, openid, goods, attach, tradeType, deviceInfo })
        .then(res => makeSuccessResponse({ [REQUEST_TYPES.createOrder]: res }))
        .catch(originalResponse => originalResponse)
      if (!isSuccessResponse(createOrderRes)) {
        res = createOrderRes
      } else {
        res = makeSuccessResponse({ [requestType]: wepayParams })
      }
    } else {
      console.log(`[handlers][${requestType}] orderUrl is not provided -> ${orderUrl}`)
      res = makeSuccessResponse({ [requestType]: wepayParams })
    }
    return res
  }
}

const main = async (event, context) => {
  const { headers, body } = event
  const { action, payload } = JSON.parse(body)
  const { type, openid } = payload
  let { deviceInfo, attach, goods } = payload
  const forwardedFor = headers['x-forwarded-for']
  console.log(`[main] x-forwarded-for -> ${headers['x-forwarded-for']}, headers -> ${JSON.stringify(headers)}`)
  console.log(`[main] action -> ${action}, type -> ${type}, openid -> ${openid}`)
  console.log(`[main] goods -> ${JSON.stringify(goods)}, attach -> ${attach}`)

  const neatedGoods = await neatenGoods({ goods, goodsUrl: ENV_VARS.goodsUrl })
  goods = neatedGoods.goods

  const newPayload = {
    appId: ENV_VARS.appId,
    mchId: ENV_VARS.mchId,
    apiKey: ENV_VARS.apiKey,
    deviceInfo: deviceInfo || 'UNKNOWN',
    body: neatedGoods.name,
    detail: neatedGoods.detail,
    attach: attach || 'empty',
    outTradeNo: `${new Date().getTime()}${randomString(7, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')}`,
    totalFee: neatedGoods.price,
    clientIp: isArray(forwardedFor) ? forwardedFor[0] : forwardedFor,
    notifyUrl: ENV_VARS.notifyUrl,
    openid: openid,
    tradeType: type || 'JSAPI',
    orderUrl: ENV_VARS.orderUrl,
    goods: goods
  }
  console.log(`[main] newPayload -> ${JSON.stringify(newPayload)}`)

  const res = await handlers[type](newPayload)

  return res
}

exports.main = main
