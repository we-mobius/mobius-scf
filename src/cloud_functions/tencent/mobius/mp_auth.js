const { axios } = require('../../../libs/axios.js')
const { makeSuccessResponse, makeFailResponse } = require('../../../common/index.js')
const tcb = require('tcb-admin-node')

const cloud = tcb.init({
  env: tcb.getCurrentEnv()
})
const db = cloud.database()
const _ = db.command

const ENV_VARS = {
  appId: process.env.appId,
  appSecret: process.env.appSecret
}

const getNewAuthAccessToken = ({ appId, appSecret, code }) => {
  console.log(`[getNewAuthAccessToken] appId -> ${appId}, code -> ${code}`)
  return new Promise((resolve, reject) => {
    axios.get(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`)
      .then(response => {
        if (response.status === 200) {
          console.log(`[getNewAuthAccessToken] raw res -> ${JSON.stringify(response.data)}`)
          if (response.data && !response.data.errcode) {
            resolve(response.data)
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
const refreshAccessToken = ({ appId, refreshToken }) => {
  console.log(`[refreshAccessToken] appId -> ${appId}, refreshToken -> ${refreshToken}`)
  return new Promise((resolve, reject) => {
    axios.get(`https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${appId}&grant_type=refresh_token&refresh_token=${refreshToken}`)
      .then(response => {
        if (response.status === 200) {
          console.log(`[refreshAccessToken] raw res -> ${JSON.stringify(response.data)}`)
          if (response.data && !response.data.errcode) {
            resolve(response.data)
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

const checkAccessToken = ({ accessToken, openid }) => {
  console.log(`[checkAccessToken] accessToken -> ${accessToken}, openid -> ${openid}`)
  return new Promise((resolve, reject) => {
    axios.get(`https://api.weixin.qq.com/sns/auth?access_token=${accessToken}&openid=${openid}`)
      .then(response => {
        if (response.status === 200 && response.data) {
          console.log(`[checkAccessToken] res -> ${response.data.errcode === 0}, raw -> ${JSON.stringify(response.data)}`)
          resolve(response.data.errcode === 0)
        } else {
          reject(Error(`${response.status}: ${response.statusText}`))
        }
      })
      .catch(reject)
  })
}
const getNewUserInfo = ({ openid, accessToken }) => {
  console.log(`[getNewUserInfo] openid -> ${openid}, accessToken -> ${accessToken}`)
  return new Promise((resolve, reject) => {
    axios.get(`https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`)
      .then(response => {
        if (response.status === 200) {
          console.log(`[getNewUserInfo] raw res -> ${JSON.stringify(response.data)}`)
          if (response.data && !response.data.errcode) {
            resolve(response.data)
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

const getCachedAccessToken = async ({ openid }) => {
  console.log(`[getCachedAccessToken] openid: ${openid}`)
  const res = await db
    .collection('mobius_mp_auth')
    .where({
      openid: _.eq(openid)
    })
    .get()
  console.log(`[getCachedAccessToken] raw res -> ${JSON.stringify(res.data)}`)
  return res.data[0] || null
}
const updateAccessToken = async (docId, accessToken) => {
  console.log(`[updateAccessToken] docId: ${docId}, accessToken -> ${JSON.stringify(accessToken)}`)
  const res = await db
    .collection('mobius_mp_auth')
    .doc(docId)
    .update({
      access_token: accessToken.access_token,
      access_token_expires_at: new Date().getTime() + 7000 * 1000,
      openid: accessToken.openid,
      refresh_token: accessToken.refresh_token,
      scope: accessToken.scope
    })
  return res.updated === 1
}
const setAccessToken = async (accessToken) => {
  console.log(`[setAccessToken] accessToken -> ${JSON.stringify(accessToken)}`)
  const res = await db
    .collection('mobius_mp_auth')
    .add({
      access_token: accessToken.access_token,
      access_token_expires_at: new Date().getTime() + 7000 * 1000,
      openid: accessToken.openid,
      refresh_token: accessToken.refresh_token,
      refresh_token_expires_at: new Date().getTime() + 29 * 24 * 3600 * 1000,
      scope: accessToken.scope
    })
  console.log(`[setAccessToken] res -> ${JSON.stringify(res)}`)
  return res.id
}

const getAccessToken = async ({ code, scope, appId, appSecret }) => {
  console.log(`[getAccessToken] code -> ${code}, scope -> ${scope}, appId -> ${appId}`)
  const newAuthAccessToken = await getNewAuthAccessToken({ code, appId, appSecret })
  let cachedAccessToken = await getCachedAccessToken({ openid: newAuthAccessToken.openid })
  if (cachedAccessToken) {
    console.log('[getAccessToken] update! update! update!')
    await updateAccessToken(cachedAccessToken._id, newAuthAccessToken)
  } else {
    console.log('[getAccessToken] set! set! set!')
    await setAccessToken(newAuthAccessToken)
  }
  cachedAccessToken = await getCachedAccessToken({ openid: newAuthAccessToken.openid })
  console.log(`[getAccessToken] raw res -> ${JSON.stringify(cachedAccessToken)}`)
  return cachedAccessToken
}
const getAuthState = async ({ code, scope, appId, appSecret }) => {
  const accessToken = await getAccessToken({ code, scope, appId, appSecret })
  return makeSuccessResponse({
    openid: accessToken.openid,
    expires_at: accessToken.refresh_token_expires_at,
    scope: accessToken.scope
  })
}
const getUserInfo = async ({ id, by, appId }) => {
  let res
  console.log(`[getUserInfo] id -> ${id}, by -> ${by}, appId -> ${appId}`)
  if (by !== 'openid') {
    res = makeFailResponse('Expected "by" param to be "openid"')
  }
  const accessToken = await getCachedAccessToken({ openid: id })
  if (!accessToken) {
    console.log('[getUserInfo] no cachedAccessToken found')
    res = makeFailResponse('Please use code to execute mp_auth first')
  }
  if (accessToken.refresh_token_expires_at > new Date().getTime()) {
    if (accessToken.access_token_expires_at > new Date().getTime()) {
      return makeSuccessResponse(
        await getNewUserInfo({ openid: id, accessToken: accessToken.access_token })
      )
    } else {
      console.log('[getUserInfo] access_token expired')
      const docId = accessToken._id
      const updateRes = await updateAccessToken(
        docId,
        await refreshAccessToken({ appId, refreshToken: accessToken.refresh_token })
      )
      if (updateRes) {
        res = await getUserInfo({ id, by, appId })
      } else {
        console.log('[getUserInfo] update access token failed')
        res = makeFailResponse('Update Access Token failed')
      }
    }
  } else {
    console.log('[getUserInfo] refresh_token expired')
    return makeFailResponse('Mp_auth expired, pls reauthorize')
  }
  return res
}

exports.main = async (event, context) => {
  console.log(`[main] env -> ${tcb.getCurrentEnv()}, vars -> ${JSON.stringify(process.env)}`)
  const { action, payload } = JSON.parse(event.body)
  const { type } = payload
  console.log(`[main] action -> ${action}, type -> ${type}, payload -> ${JSON.stringify(payload)}`)

  const handlers = {
    snsapi_base: async ({ code, scope } = payload) => { return await getAuthState({ code, scope, ...ENV_VARS }) },
    snsapi_userinfo: async ({ code, scope } = payload) => { return await getAuthState({ code, scope, ...ENV_VARS }) },
    user_info: async ({ id, by } = payload) => { return await getUserInfo({ id, by, appId: ENV_VARS.appId }) }
  }

  const res = await handlers[type]()
  if (res.status === 'success') {
    console.log('[main] restructure success response output')
    const data = res.data
    res.data = {
      [type]: data
    }
  }
  console.log(`[main] output -> ${JSON.stringify(res)}`)
  return res
}
