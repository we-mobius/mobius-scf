const { axios } = require('../../../libs/axios.js')
const { MPAPI_REQUEST_TYPES, SECURITY_CHECK_REQUEST_TYPES } = require('../../../const/index.js')
const { makeSuccessResponse, isSuccessResponse, randomString } = require('../../../common/index.js')

const ENV_VARS = {
  accessTokenUrl: process.env.accessTokenUrl
}

const getAccessToken = () => {
  console.log('[getAccessToken]')
  const type = MPAPI_REQUEST_TYPES.getAccessToken
  return new Promise((resolve, reject) => {
    axios({
      url: ENV_VARS.accessTokenUrl,
      method: 'POST',
      data: {
        action: 'get',
        payload: { type }
      }
    }).then(response => {
      console.log(`[getAccessToken] response -> ${JSON.stringify(response.data)}`)
      if (response.status !== 200) {
        reject(Error(`${response.status}: ${response.statusText}`))
      }
      if (!isSuccessResponse(response.data)) {
        reject(Error(`${response.data.status}: ${response.data.status_message}`))
      }
      resolve(response.data.data[type].value)
    })
      .catch(reject)
  })
}

// @see:
//   & 小程序附赠: https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${accessToken}+
//       -> https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/sec-check/security.msgSecCheck.html
//   & 单独服务: https://api.weixin.qq.com/wxa/servicemarket?access_token=${accessToken}
//       -> https://developers.weixin.qq.com/miniprogram/dev/extended/service-market/intro.html#%E5%AE%89%E5%85%A8
const checkTextSecurity = ({ accessToken, text }) => {
  console.log(`[checkTextSecurity] accessToken -> ${accessToken}, text -> ${text}`)
  return new Promise((resolve, reject) => {
    axios({
      url: `https://api.weixin.qq.com/wxa/servicemarket?access_token=${accessToken}`,
      method: 'POST',
      data: {
        service: 'wxee446d7507c68b11',
        api: 'msgSecCheck',
        data: {
          Action: 'TextApproval',
          Text: text
        },
        client_msg_id: randomString(32)
      }
    }).then(response => {
      if (response.status !== 200) {
        reject(Error(`${response.status}: ${response.statusText}`))
      }
      console.log(`[checkTextSecurity] response -> ${JSON.stringify(response.data)}`)
      if (!response.data.data) {
        reject(Error(`${response.data.errcode}: ${response.data.errmsg}`))
      }
      resolve(JSON.parse(response.data.data).Response)
    })
      .catch(reject)
  })
}

const handlers = {
  [SECURITY_CHECK_REQUEST_TYPES.checkTextSecurity]: async ({ text }) => {
    const requestType = SECURITY_CHECK_REQUEST_TYPES.checkTextSecurity
    console.log(`[handlers][${requestType}] text -> ${text}`)
    const accessToken = await getAccessToken()
    console.log(`[handlers][${requestType}] accessToken -> ${JSON.stringify(accessToken)}`)
    const validity = await checkTextSecurity({ accessToken, text })
    // TODO: reject reflect to FailResponse & ErrorResponse
    return makeSuccessResponse({ [requestType]: validity })
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
