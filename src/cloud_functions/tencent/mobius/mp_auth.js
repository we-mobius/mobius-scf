const { axios } = require('../../../libs/axios.js')
const { makeSuccessResponse, makeFailResponse } = require('../../../common/index.js')
const { tcb, db, _ } = require('../../../common/tcb.js')
const { MPAUTH_REQUEST_TYPES } = require('../../../const/index.js')

const isError = err => Object.prototype.toString.call(err) === '[object Error]'

const ENV_VARS = {
  appId: process.env.appId,
  appSecret: process.env.appSecret,
  apiCollectionName: 'mobius_mp_auth'
}

// @see: https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html
const getNewAuthAccessToken = ({ appId, appSecret, code }) => {
  console.log(`[getNewAuthAccessToken] appId -> ${appId}, code -> ${code}`)
  return new Promise((resolve, reject) => {
    axios.get(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`)
      .then(response => {
        if (response.status !== 200) {
          reject(Error(`${response.status}: ${response.statusText}`))
        }
        console.log(`[getNewAuthAccessToken] raw response.data -> ${JSON.stringify(response.data)}`)
        if (!response.data || !!response.data.errcode) {
          reject(Error(`${response.data.errcode}: ${response.data.errmsg}`))
        }
        resolve(response.data)
      })
      .catch(reject)
  })
}
const refreshAccessToken = ({ appId, refreshToken }) => {
  console.log(`[refreshAccessToken] appId -> ${appId}, refreshToken -> ${refreshToken}`)
  return new Promise((resolve, reject) => {
    axios.get(`https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${appId}&grant_type=refresh_token&refresh_token=${refreshToken}`)
      .then(response => {
        if (response.status !== 200) {
          reject(Error(`${response.status}: ${response.statusText}`))
        }
        console.log(`[refreshAccessToken] raw response.data -> ${JSON.stringify(response.data)}`)
        if (!response.data || !!response.data.errcode) {
          reject(Error(`${response.data.errcode}: ${response.data.errmsg}`))
        }
        resolve(response.data)
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
        if (response.status !== 200) {
          reject(Error(`${response.status}: ${response.statusText}`))
        }
        console.log(`[getNewUserInfo] raw response.data -> ${JSON.stringify(response.data)}`)
        if (!response.data || !!response.data.errcode) {
          reject(Error(`${response.data.errcode}: ${response.data.errmsg}`))
        }
        resolve(response.data)
      })
      .catch(reject)
  })
}

const getCachedAccessToken = async ({ openid }) => {
  console.log(`[getCachedAccessToken] openid: ${openid}`)
  const res = await db
    .collection(ENV_VARS.apiCollectionName)
    .where({
      openid: _.eq(openid)
    })
    .get()
  console.log(`[getCachedAccessToken] raw res.data -> ${JSON.stringify(res.data)}`)
  return res.data[0] || null
}
const updateAccessToken = async (docId, accessToken) => {
  console.log(`[updateAccessToken] docId: ${docId}, accessToken -> ${JSON.stringify(accessToken)}`)
  const res = await db
    .collection(ENV_VARS.apiCollectionName)
    .doc(docId)
    .update({
      access_token: accessToken.access_token,
      access_token_expires_at: new Date().getTime() + 7000 * 1000,
      openid: accessToken.openid,
      refresh_token: accessToken.refresh_token,
      scope: accessToken.scope
    })
  console.log(`[updateAccessToken] res -> ${JSON.stringify(res)}`)
  return res.updated === 1
}
const setAccessToken = async (accessToken) => {
  console.log(`[setAccessToken] accessToken -> ${JSON.stringify(accessToken)}`)
  const res = await db
    .collection(ENV_VARS.apiCollectionName)
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
const removeRecord = async (docId) => {
  console.log(`[removeRecord] docId: ${docId}`)
  const res = await db.collection(ENV_VARS.apiCollectionName).doc(docId).remove()
  console.log(`[removeRecord] res -> ${JSON.stringify(res)}`)
  return res.deleted === 1
}

const getAccessToken = async ({ code, scope, appId, appSecret }) => {
  console.log(`[getAccessToken] code -> ${code}, scope -> ${scope}, appId -> ${appId}`)
  // NOTE: 因为没有 openid 无法进行后续操作，所以客户端每次发起认证都必须获取一次新的 accessToken
  const newAuthAccessToken = await getNewAuthAccessToken({ code, appId, appSecret })
  let cachedAccessToken = await getCachedAccessToken({ openid: newAuthAccessToken.openid })
  if (cachedAccessToken) {
    console.log('[getAccessToken] remove then set!')
    await removeRecord(cachedAccessToken._id)
  }
  console.log('[getAccessToken] set! set! set!')
  await setAccessToken(newAuthAccessToken)
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
  console.log(`[getUserInfo] id -> ${id}, by -> ${by}, appId -> ${appId}`)
  // 需提供目标用户 openid
  if (by !== 'openid') {
    return makeFailResponse('Expected "by" param to be "openid"')
  }
  const accessToken = await getCachedAccessToken({ openid: id })
  // 未授权
  if (!accessToken) {
    console.log('[getUserInfo] no cachedAccessToken found')
    return makeFailResponse('Please use code to execute mp_auth first')
  }
  if (accessToken.scope.indexOf('snsapi_userinfo') < 0) {
    console.log(`[getUserInfo] do not has proper authorization scope, "snsapi_userinfo" required, but had ${accessToken.scope} `)
    return makeFailResponse(`Please use proper authorization scope to auth first, "snsapi_userinfo" required, now is ${accessToken.scope}`)
  }
  // refreshToken 过期
  if (accessToken.refresh_token_expires_at < new Date().getTime()) {
    console.log('[getUserInfo] refresh_token expired')
    return makeFailResponse('Mp_auth expired, pls reauthorize')
  }
  // accessToken 过期
  if (accessToken.access_token_expires_at < new Date().getTime()) {
    console.log('[getUserInfo] access_token expired')
    const docId = accessToken._id
    const refreshedAccessToken = await refreshAccessToken({ appId, refreshToken: accessToken.refresh_token })
    if (isError(refreshedAccessToken)) {
      return makeFailResponse('Refresh access token failed')
    }
    const updateRes = await updateAccessToken(docId, refreshedAccessToken)
    if (!updateRes) {
      console.log('[getUserInfo] update access token failed')
      return makeFailResponse('Update Access Token failed')
    }
    return await getUserInfo({ id, by, appId })
  }
  return await getNewUserInfo({ openid: id, accessToken: accessToken.access_token })
}

const handlers = {
  [MPAUTH_REQUEST_TYPES.snsapiBase]: async ({ code, scope }) => {
    const requestType = MPAUTH_REQUEST_TYPES.snsapiBase
    console.log(`[handlers][${requestType}]`)
    return await getAuthState({ code, scope, ...ENV_VARS })
  },
  [MPAUTH_REQUEST_TYPES.snsapiUserinfo]: async ({ code, scope }) => {
    const requestType = MPAUTH_REQUEST_TYPES.snsapiUserinfo
    console.log(`[handlers][${requestType}]`)
    return await getAuthState({ code, scope, ...ENV_VARS })
  },
  [MPAUTH_REQUEST_TYPES.userInfo]: async ({ id, by }) => {
    const requestType = MPAUTH_REQUEST_TYPES.userInfo
    console.log(`[handlers][${requestType}]`)
    return await getUserInfo({ id, by, appId: ENV_VARS.appId })
  }
}

exports.main = async (event, context) => {
  const { action, payload } = JSON.parse(event.body)
  const { type } = payload
  console.log(`[main] env -> ${tcb.SYMBOL_CURRENT_ENV.toString()}, vars -> ${JSON.stringify(process.env)}`)
  console.log(`[main] action -> ${action}, type -> ${type}, payload -> ${JSON.stringify(payload)}`)

  // const handlers = {
  //   snsapi_base: async ({ code, scope } = payload) => { return await getAuthState({ code, scope, ...ENV_VARS }) },
  //   snsapi_userinfo: async ({ code, scope } = payload) => { return await getAuthState({ code, scope, ...ENV_VARS }) },
  //   user_info: async ({ id, by } = payload) => { return await getUserInfo({ id, by, appId: ENV_VARS.appId }) }
  // }

  const res = await handlers[type](payload)
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
