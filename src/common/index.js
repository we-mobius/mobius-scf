const wepay = require('./wepay.js')
const tcb = require('./tcb.js')

const makeBaseResponse = status => {
  return {
    status: status,
    status_message: '',
    data: {}
  }
}

const makeSuccessResponse = data => {
  const response = makeBaseResponse('success')
  response.data = { ...response.data, ...data }
  return response
}

const makeFailResponse = (fail, data) => {
  const response = makeBaseResponse('fail')
  response.status_message = fail
  response.data = { ...response.data, ...data }
  return response
}

const makeErrorResponse = (err, data) => {
  const response = makeBaseResponse('error')
  response.status_message = err
  response.data = { ...response.data, ...data }
  return response
}

const isSuccessResponse = response => response.status === 'success'
const isFailResponse = response => response.status === 'fail'
const isErrorResponse = response => response.status === 'error'

const randomString = (length, chars) => {
  var result = ''
  chars = chars || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

module.exports = {
  ...wepay,
  ...tcb,
  makeSuccessResponse,
  makeFailResponse,
  makeErrorResponse,
  isSuccessResponse,
  isFailResponse,
  isErrorResponse,
  randomString
}
