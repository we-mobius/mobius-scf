const { axios } = require('../../../libs/axios.js')
const { BOARD_REQUEST_TYPES, SECURITY_CHECK_REQUEST_TYPES } = require('../../../const/index.js')
const { makeSuccessResponse, makeFailResponse, isSuccessResponse } = require('../../../common/index.js')
const { db, _ } = require('../../../common/index.js')

const ENV_VARS = {
  postsCollectionName: 'mobius_board_posts',
  securityCheckUrl: process.env.securityCheckUrl
}

const checkSecurity = ({ text }) => {
  console.log(`[checkSecurity] text -> ${text}`)
  const type = SECURITY_CHECK_REQUEST_TYPES.checkTextSecurity
  return new Promise((resolve, reject) => {
    axios({
      url: ENV_VARS.securityCheckUrl,
      method: 'POST',
      data: {
        action: 'get',
        payload: { type, text }
      }
    }).then(response => {
      if (response.status !== 200) {
        reject(Error(`${response.status}: ${response.statusText}`))
      }
      console.log(`[checkSecurity] response -> ${JSON.stringify(response.data)}`)
      if (!isSuccessResponse(response.data)) {
        reject(Error(`${response.data.status}: ${response.data.status_message}`))
      }
      resolve(response.data.data[type])
    })
      .catch(reject)
  })
}

const getPosts = async ({ timeRange, num }) => {
  console.log(`[getPosts] timeRange: ${timeRange}, num -> ${num}`)
  const [top, bottom] = timeRange
  const whereCondition = top && bottom ? { publish_time: _.lt(top).and(_.gt(bottom)) }
    : top ? { publish_time: _.lt(top) }
      : bottom ? { publish_time: _.gt(bottom) } : { publish_time: _.lt(+new Date()) }
  console.log(`[getPosts] whereCondition: ${JSON.stringify(whereCondition)}`)
  const res = await db
    .collection(ENV_VARS.postsCollectionName)
    .where(whereCondition)
    .limit(num)
    .orderBy('publish_time', 'desc')
    .get()
  console.log(`[getPosts] raw res -> ${JSON.stringify(res)}`)
  return res.data || []
}

const createPost = async ({ openid, tags, title, detail, tel, wechat, qq }) => {
  console.log(`[createPost] openid -> ${openid}, tags -> ${tags}, title -> ${title}, detail -> ${detail}, tel -> ${tel}, wechat -> ${wechat}, qq -> ${qq}`)
  const res = await db
    .collection(ENV_VARS.postsCollectionName)
    .add({ openid, tags, title, detail, publish_time: +new Date(), tel: tel || '', wechat: wechat || '', qq: qq || '' })

  console.log(`[createPost] res -> ${JSON.stringify(res)}`)
  return { id: res.id }
}

const handlers = {
  [BOARD_REQUEST_TYPES.getPosts]: async ({ timeRange, num }) => {
    const requestType = BOARD_REQUEST_TYPES.getPosts
    console.log(`[handlers][${requestType}] timeRange -> ${timeRange}, num -> ${num}`)

    const res = await getPosts({ timeRange, num }).then(posts => {
      if (posts) {
        return makeSuccessResponse({ [requestType]: posts })
      } else {
        return makeFailResponse('Can not find posts in database')
      }
    })

    return res
  },
  [BOARD_REQUEST_TYPES.createPost]: async ({ openid, tags, title, detail, tel, wechat, qq }) => {
    const requestType = BOARD_REQUEST_TYPES.createPost
    console.log(`[handlers][${requestType}] openid -> ${openid}, tags -> ${tags}, title -> ${title}, detail -> ${detail}, tel -> ${tel}, wechat -> ${wechat}, qq -> ${qq}`)
    const titleValidity = await checkSecurity({ text: title }).then(res => {
      console.log(`[handlers][${requestType}] titleValidity -> ${JSON.stringify(res)}`)
      return res.EvilTokens.length === 0
    })
    console.log(`[createPost] titleValidity -> ${titleValidity}`)
    const detailValidity = await checkSecurity({ text: detail }).then(res => {
      console.log(`[handlers][${requestType}] detailValidity -> ${JSON.stringify(res)}`)
      return res.EvilTokens.length === 0
    })
    console.log(`[createPost] detailValidity -> ${detailValidity}`)
    if (!titleValidity && !detailValidity) {
      return makeFailResponse('标题和内容中含有不当信息，请重新组织措辞。')
    }
    if (!titleValidity) {
      return makeFailResponse('标题中含有不当信息，请重新组织措辞。')
    }
    if (!detailValidity) {
      return makeFailResponse('内容中含有不当信息，请重新组织措辞。')
    }
    console.log('[createPost] post content valid!')
    const res = await createPost({ openid, tags, title, detail, tel, wechat, qq })
    return makeSuccessResponse({ [requestType]: res })
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
