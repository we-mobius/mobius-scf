const { MPAPI_REQUEST_TYPES } = require('../../../const/index.js')
const { axios } = require('../../../libs/axios.js')
const { randomString } = require('../../../common/index.js')
const { sha1 } = require('../../../libs/crypto.js')
const { makeSuccessResponse } = require('../../../common/index.js')
const { tcb, db, _ } = require('../../../common/tcb.js')

const ENV_VARS = {
  appId: process.env.appId,
  appSecret: process.env.appSecret,
  apiCollectionName: 'mobius_mp_api'
}

// @see: https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/access-token/auth.getAccessToken.html
const getNewAccessToken = ({ appId, appSecret }) => {
  console.log('[getNewAccessToken]')
  return new Promise((resolve, reject) => {
    axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`)
      .then(response => {
        if (response.status !== 200) {
          reject(Error(`${response.status}: ${response.statusText}`))
        }
        if (!response.data.access_token) {
          reject(Error(`${response.data.errcode}: ${response.data.errmsg}`))
        }
        resolve(response.data.access_token)
      })
      .catch(reject)
  })
}
// @see: https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
const getNewJsAPITicket = (accessToken) => {
  console.log(`[getNewJsAPITicket] accessToken -> ${accessToken}`)
  return new Promise((resolve, reject) => {
    axios.get(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`)
      .then(response => {
        if (response.status !== 200) {
          reject(Error(`${response.status}: ${response.statusText}`))
        }
        if (!response.data.ticket) {
          reject(Error(`${response.data.errcode}: ${response.data.errmsg}`))
        }
        resolve(response.data.ticket)
      }
      ).catch(reject)
  })
}

const sign = (ticket, url) => {
  const noncestr = randomString(16, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
  const timestamp = new Date().getTime()
  const signature = sha1(`jsapi_ticket=${ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`)
  return {
    nonceStr: noncestr,
    timestamp: timestamp,
    signature: signature
  }
}

let record = null
const _getAPITicketDoc = async () => {
  console.log('[getAPITicketDoc]')
  const res = await db
    .collection(ENV_VARS.apiCollectionName)
    .where({
      version: _.eq('latest')
    })
    .get()
  console.log(`[getAPITicketDoc] res -> ${JSON.stringify(res)}`)
  return res.data[0]
}
const getCachedAccessToken = async () => {
  console.log('[getCachedAccessToken]')
  if (!record) {
    record = await _getAPITicketDoc()
  }
  console.log(`[getCachedAccessToken] res -> ${JSON.stringify(record.access_token)}`)
  return record.access_token
}
const getCachedJsAPITicket = async () => {
  console.log('[getCachedJsAPITicket]')
  if (!record) {
    record = await _getAPITicketDoc()
  }
  console.log(`[getCachedJsAPITicket] res -> ${JSON.stringify(record.jsapi_ticket)}`)
  return record.jsapi_ticket
}
const setAccessToken = async accessToken => {
  console.log(`[setAccessToken] accessToken -> ${JSON.stringify(accessToken)}`)
  const res = await db.collection(ENV_VARS.apiCollectionName)
    .doc(record._id)
    .update({
      access_token: _.set({
        value: accessToken,
        expires_at: new Date().getTime() + 7000 * 1000
      })
    })
  console.log(`[setAccessToken]：changes -> ${JSON.stringify(accessToken)}, res -> ${res.updated}`)
  return res.updated === 1
}
const setJsAPITicket = async jsAPITicket => {
  console.log(`[setJsAPITicket] jsAPITicket -> ${JSON.stringify(jsAPITicket)}`)
  const res = await db.collection(ENV_VARS.apiCollectionName)
    .doc(record._id)
    .update({
      jsapi_ticket: _.set({
        value: jsAPITicket,
        expires_at: new Date().getTime() + 7000 * 1000
      })
    })
  console.log(`[setJsAPITicket]：changes -> ${JSON.stringify(jsAPITicket)}, res -> ${res.updated}`)
  return res.updated === 1
}

const getAccessToken = async () => {
  console.log('[getAccessToken]')
  const accessToken = await getCachedAccessToken()
  console.log(`[getAccessToken] access_token -> ${accessToken.value}`)
  console.log(`[getAccessToken] current time -> ${+new Date()}, access_token expires at -> ${accessToken.expires_at}`)
  if (+new Date() > accessToken.expires_at) {
    console.log('[getAccessToken] access_token expired')
    const newAccessToken = await getNewAccessToken(ENV_VARS)
    const isSuccess = await setAccessToken(newAccessToken)
    if (isSuccess) {
      record = null
    }
    return await getAccessToken()
  } else {
    console.log('[getAccessToken] access_token is valid')
    return accessToken
  }
}
const getJsAPITicket = async () => {
  console.log('[getJsAPITicket]')
  const jsAPITicket = await getCachedJsAPITicket()
  console.log(`[getJsAPITicket] ticket -> ${jsAPITicket.value}`)
  console.log(`[getJsAPITicket] current time -> ${+new Date()}, ticket expires at -> ${jsAPITicket.expires_at}`)
  if (+new Date() > jsAPITicket.expires_at) {
    console.log('[getJsAPITicket] ticket expired')
    const accessToken = (await getAccessToken()).value
    const newJsAPITicket = await getNewJsAPITicket(accessToken)
    const isSuccess = await setJsAPITicket(newJsAPITicket)
    if (isSuccess) {
      record = null
    }
    return await getJsAPITicket()
  } else {
    console.log('[getJsAPITicket] ticket is valid')
    return jsAPITicket.value
  }
}

const handlers = {
  [MPAPI_REQUEST_TYPES.getAccessToken]: async () => {
    const requestType = MPAPI_REQUEST_TYPES.getAccessToken
    console.log(`[handlers][${requestType}]`)
    const res = await getAccessToken()
    console.log(`[handlers][${requestType}] res -> ${JSON.stringify(res)}`)
    return makeSuccessResponse({ [requestType]: res })
  },
  [MPAPI_REQUEST_TYPES.getJsAPITicket]: async ({ url }) => {
    const requestType = MPAPI_REQUEST_TYPES.getJsAPITicket
    console.log(`[handlers][${requestType}] url -> ${url}`)
    const res = await getJsAPITicket().then(ticket => {
      return sign(ticket, url)
    })
    console.log(`[handlers][${requestType}] res -> ${JSON.stringify(res)}`)
    return makeSuccessResponse({ [requestType]: res })
  }
}

exports.main = async (event, context) => {
  const { action, payload } = JSON.parse(event.body)
  const { type, url } = payload
  console.log(`[main] env -> ${tcb.SYMBOL_CURRENT_ENV.toString()}, vars -> ${JSON.stringify(process.env)}`)
  console.log(`[main] action -> ${action}, type -> ${type}, 请求方传入的 url -> ${url}`)
  payload.url = event.headers.referer || payload.url || ''
  console.log(`[main] 处理之后的 url -> ${payload.url}`)

  return await handlers[type](payload)
}
