const { makeSuccessResponse } = require('../../../common/index.js')

const main = async (event, context) => {
  const { body } = event
  const { action, payload } = JSON.parse(body)
  const { type } = payload
  console.log(`[main] action -> ${action}, type -> ${type}`)
  console.log(`[main] payload -> ${JSON.stringify(payload)}`)

  return makeSuccessResponse({ [type]: {} })
}

exports.main = main
