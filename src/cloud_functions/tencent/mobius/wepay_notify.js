const { REQUEST_TYPES } = require('../../../const/index.js')
const {
  isValidWepaySign,
  makeFailResponse, makeErrorResponse
} = require('../../../common/index.js')
const { toJSON } = require('../../../libs/xml.js')
const { axios } = require('../../../libs/axios.js')

const ENV_VARS = {
  orderUrl: process.env.orderUrl,
  apiKey: process.env.apiKey
}

const updateOrder = async ({ orderUrl, outTradeNo, openid, changes }) => {
  console.log(`[updateOrder] orderUrl -> ${orderUrl}`)
  console.log(`[updateOrder] outTradeNo -> ${outTradeNo}, openid -> ${openid}`)
  console.log(`[updateOrder] changes -> ${JSON.stringify(changes)}`)

  const type = REQUEST_TYPES.updateOrder
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
          changes
        }
      }
    }).then(response => {
      if (response.status === 200) {
        console.log(`[updateOrder] raw response data -> ${JSON.stringify(response.data)}`)
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

const handlers = {
  [REQUEST_TYPES.updateOrder]: async ({ orderUrl, tradeDetail }) => {
    const requestType = REQUEST_TYPES.updateOrder
    console.log(`[handlers][${requestType}] orderUrl -> ${orderUrl}, tradeDetail -> ${JSON.stringify(tradeDetail)}`)
    let res
    if (tradeDetail.return_code === 'SUCCESS') {
      if (orderUrl) {
        console.log(`[handlers][${requestType}] orderUrl is provided -> ${orderUrl}`)
        res = await updateOrder({
          orderUrl: orderUrl,
          outTradeNo: tradeDetail.out_trade_no,
          openid: tradeDetail.openid,
          changes: tradeDetail
        }).then(originalResponse => {
          return '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>'
        }).catch(err => {
          return makeErrorResponse(err)
        })
      } else {
        console.log(`[handlers][${requestType}] orderUrl is not provided -> ${orderUrl}, return success response to wxserver directly`)
        res = '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>'
      }
    } else {
      res = makeErrorResponse(`${tradeDetail.return_code}: ${tradeDetail.return_msg}`)
    }
    return res
  }
}

const main = async (event, context) => {
  let { body } = event
  console.log(`[main] raw body -> ${JSON.stringify(body)}`)
  body = Buffer.from(body, 'base64').toString('utf-8')
  console.log(`[main] normal body -> ${JSON.stringify(body)}`)
  body = await toJSON(body).then(({ xml }) => {
    return xml
  })
  console.log(`[main] json body -> ${JSON.stringify(body)}`)

  const isValidTradeDetail = isValidWepaySign({ params: body, apiKey: ENV_VARS.apiKey })

  if (isValidTradeDetail) {
    return handlers[REQUEST_TYPES.updateOrder]({ orderUrl: ENV_VARS.orderUrl, tradeDetail: body })
  } else {
    return makeFailResponse('Unvaild prepay res, pls retry later')
  }
}

exports.main = main
