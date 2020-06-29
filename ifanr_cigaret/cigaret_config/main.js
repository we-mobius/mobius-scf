function makeResponse(content) {
  return {
    content: JSON.stringify(content),
    content_type: 'application/json',
    status_code: 200
  }
}

async function getConfig(options) {
  try {
    let { id } = options.token.data
    let config

    // cigaret_config: 100645
    const ConfigTable = new BaaS.TableObject('cigaret_config')
    const query = new BaaS.Query()

    query.compare('unique_id', '=', id)

    let finds = await ConfigTable.setQuery(query).find()

    if (finds.status === 200 && finds.data.meta.total_count > 0) {
      config = finds.data.objects[0].config
    } else {
      config = null
    }

    return {
      id,
      config
    }
  } catch (err) {
    throw err
  }
}

async function setConfig(options) {
  try {
    let { id } = options.token.data
    let payload = options.payload
    let res

    // cigaret_config: 100645
    const ConfigTable = new BaaS.TableObject('cigaret_config')

    const query = new BaaS.Query()
    query.compare('unique_id', '=', id)
    let finds = await ConfigTable.setQuery(query).find()
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
    } else {
      res = { status: finds.status }
    }

    delete res.headers
    return res
  } catch (err) {
    throw err
  }
}

const commandHandler = async (options) => {
  let { action } = options
  let res
  switch (action) {
    case 'get':
      res = await getConfig(options)
      break
    case 'set':
      res = await setConfig(options)
      break
  }
  return res
}

exports.main = async function mainFn(event) {
  // const command = {
  //   action: 'get',
  //   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImVtYWlsIjoia2NpZ2FyZXRAb3V0bG9vay5jb20iLCJpZCI6IjVlZDRjMTlkMzcwZTg1MjI0Mjk2MDQ1NSIsImNsaWVudElkIjoiNWVhMGZjZTQ1MWJiOGQ5NDlmN2UxNzAxIn0sImlhdCI6MTU5MTI4MzY4NywiZXhwIjoxNTkyNTc5Njg3fQ.RHr0lRB0iVvpnJp0AgNiyqOgtWw9zk9nRpiuRxL-hQ8',
  //   payload: {
  //     config: {
  //       hello: ' world!!',
  //       name: 'cigaret'
  //     }
  //   }
  // }
  const command = event.data
  let result

  // NOTE: Do not use object format data in avoid of axios's default encode behaviour to params
  let authState = await BaaS.request.get(`https://users.authing.cn/authing/token?access_token=${command.token}`)
    .then(res => {
      return res.data
    })
  // id: 5ed4c19d370e852242960455

  if (authState.status === true) {
    result = await commandHandler({ ...command, token: authState.token })
  } else {
    result = authState
  }
  return makeResponse(result)
}
