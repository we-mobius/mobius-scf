const makeBaseResponse = status => {
  return {
    status: status,
    status_message: '',
    data: {}
  }
}

const makeSuccessResponse = data => {
  const response = makeBaseResponse('success')
  response.data = data
  return response
}

const makeFailResponse = fail => {
  const response = makeBaseResponse('fail')
  response.status_message = fail
  return response
}

const makeErrorResponse = err => {
  const response = makeBaseResponse('error')
  response.status_message = err
  return response
}

module.exports = {
  makeSuccessResponse,
  makeFailResponse,
  makeErrorResponse
}
