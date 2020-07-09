const {
  makeSuccessResponse,
  makeFailResponse,
  makeErrorResponse
} = require('../../../common/index.js')

const TABLE_NAME = 'mobius_config'

// eslint-disable-next-line no-undef
const IfanrBaaS = BaaS

const makeIfanrResponse = content => {
  return {
    content: JSON.stringify(content),
    content_type: 'application/json',
    status_code: 200
  }
}

const getConfig = async options => {
  try {
    const { id } = options.token.data
    let config

    const ConfigTable = new IfanrBaaS.TableObject(TABLE_NAME)
    const query = new IfanrBaaS.Query()

    query.compare('unique_id', '=', id)

    const finds = await ConfigTable.setQuery(query).find()

    if (finds.status === 200 && finds.data.meta.total_count > 0) {
      config = finds.data.objects[0].config
    } else {
      config = null
    }

    return makeSuccessResponse({ id, config })
  } catch (err) {
    return makeErrorResponse(err)
  }
}

const setConfig = async options => {
  try {
    const { id } = options.token.data
    const payload = options.payload
    let res

    const ConfigTable = new IfanrBaaS.TableObject(TABLE_NAME)

    const query = new IfanrBaaS.Query()
    query.compare('unique_id', '=', id)
    const finds = await ConfigTable.setQuery(query).find()
    if (finds.status === 200) {
      if (finds.data.meta.total_count > 0) {
        const recordId = finds.data.objects[0]._id
        const record = ConfigTable.getWithoutData(recordId)
        record.set({ ...payload })
        res = await record.update()
      } else {
        const record = ConfigTable.create()
        record.set({ ...payload, unique_id: id })
        res = await record.save()
      }
      delete res.headers
      res = makeSuccessResponse(res)
    } else {
      res = makeFailResponse(finds.status)
    }
    return res
  } catch (err) {
    return makeErrorResponse(err)
  }
}

const commandHandler = async (options) => {
  const { action } = options
  let res
  switch (action) {
    case 'get':
      res = await getConfig(options)
      break
    case 'set':
      res = await setConfig(options)
      break
    default:
      res = makeFailResponse('Expected an "action" param witch should be "get" or "set"')
      break
  }
  return res
}

const main = async event => {
  // const command = {
  //   action: 'get',
  //   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImVtYWlsIjoia2NpZ2FyZXRAb3V0bG9vay5jb20iLCJpZCI6IjVlZDRjMTlkMzcwZTg1MjI0Mjk2MDQ1NSIsImNsaWVudElkIjoiNWVhMGZjZTQ1MWJiOGQ5NDlmN2UxNzAxIn0sImlhdCI6MTU5MTI4MzY4NywiZXhwIjoxNTkyNTc5Njg3fQ.RHr0lRB0iVvpnJp0AgNiyqOgtWw9zk9nRpiuRxL-hQ8',
  //   payload: {
  //     config: {
  //       hello: 'Hello Mobius!',
  //     }
  //   }
  // }
  const command = event.data
  let result

  // NOTE: Do not use object format data in avoid of axios's default encode behaviour to params
  const authState = await IfanrBaaS.request.get(`https://users.authing.cn/authing/token?access_token=${command.token}`)
    .then(res => {
      return res.data
    })

  if (authState.status === true) {
    result = await commandHandler({ ...command, token: authState.token })
  } else {
    result = makeFailResponse(authState)
  }
  return makeIfanrResponse(result)
}

module.exports = {
  main: main
}
