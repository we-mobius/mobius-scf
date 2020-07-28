const { axios } = require('../../../libs/axios.js')
const { randomString } = require('../../../common/index.js')
const { sha1 } = require('../../../libs/crypto.js')
const { makeSuccessResponse } = require('../../../common/index.js')
const tcb = require('tcb-admin-node')

const cloud = tcb.init({
  env: tcb.getCurrentEnv()
})
const db = cloud.database()
const _ = db.command

const SECRET = {
  appId: process.env.appId,
  appSecret: process.env.appSecret
}

const getNewAccessToken = ({ appId, appSecret }) => {
  console.log('[getNewAccessToken]')
  return new Promise((resolve, reject) => {
    axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`)
      .then(response => {
        if (response.status === 200) {
          if (response.data.access_token) {
            resolve(response.data.access_token)
          } else {
            reject(Error(`${response.data.errcode}: ${response.data.errmsg}`))
          }
        } else {
          reject(Error(`${response.status}: ${response.statusText}`))
        }
      })
      .catch(reject)
  })
}

const getNewJsAPITicket = (accessToken) => {
  console.log('[getNewJsAPITicket]')
  return new Promise((resolve, reject) => {
    axios.get(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`)
      .then(response => {
        if (response.status === 200) {
          if (response.data.ticket) {
            resolve(response.data.ticket)
          } else {
            reject(Error(`${response.data.errcode}: ${response.data.errmsg}`))
          }
        } else {
          reject(Error(`${response.status}: ${response.statusText}`))
        }
      }).catch(reject)
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
  const res = await db
    .collection('mobius_mp_api_ticket')
    .where({
      version: _.eq('latest')
    })
    .get()
  console.log(`[getAPITicketDoc]：${JSON.stringify(res)}`)
  return res.data[0]
}
const getCachedAccessToken = async () => {
  if (!record) {
    record = await _getAPITicketDoc()
  }
  console.log(`[getCachedAccessToken]：${JSON.stringify(record.access_token)}`)
  return record.access_token
}
const getCachedJsAPITicket = async () => {
  if (!record) {
    record = await _getAPITicketDoc()
  }
  console.log(`[getCachedJsAPITicket]：${JSON.stringify(record.jsapi_ticket)}`)
  return record.jsapi_ticket
}
const setAccessToken = async accessToken => {
  const res = await db.collection('mobius_mp_api_ticket')
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
  const res = await db.collection('mobius_mp_api_ticket')
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
  const accessToken = await getCachedAccessToken()
  console.log(new Date().getTime())
  console.log(accessToken.expires_at)
  console.log(new Date().getTime() > accessToken.expires_at)
  if (new Date().getTime() > accessToken.expires_at) {
    const newAccessToken = await getNewAccessToken(SECRET)
    const isSuccess = await setAccessToken(newAccessToken)
    if (isSuccess) {
      record = null
    }
    return getAccessToken()
  } else {
    return accessToken.value
  }
}
const getJsAPITicket = async () => {
  const jsAPITicket = await getCachedJsAPITicket()
  console.log(new Date().getTime())
  console.log(jsAPITicket.expires_at)
  console.log(new Date().getTime() > jsAPITicket.expires_at)
  if (new Date().getTime() > jsAPITicket.expires_at) {
    const newJsAPITicket = await getNewJsAPITicket(await getAccessToken())
    const isSuccess = await setJsAPITicket(newJsAPITicket)
    if (isSuccess) {
      record = null
    }
    return getJsAPITicket()
  } else {
    return jsAPITicket.value
  }
}

exports.main = async (event, context) => {
  const { action, payload: { type, url } } = JSON.parse(event.body)
  console.log(`[main] env -> ${tcb.getCurrentEnv()}, vars -> ${JSON.stringify(process.env)}`)
  console.log(`[main] action -> ${action}, type -> ${type}, url -> ${url}`)
  const res = await getJsAPITicket().then(ticket => {
    return sign(ticket, event.headers.referer || url || '')
  })
  return makeSuccessResponse({ [type]: res })
}
