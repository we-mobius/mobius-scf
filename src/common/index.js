const wepay = require('./wepay.js');

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

const isSuccessResponse = response => response.status === 'success'
const isFailResponse = response => response.status === 'fail'
const isErrorResponse = response => response.status === 'error'

const randomString = (length, chars) => {
  var result = '';
  chars = chars || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

module.exports = {
  ...wepay,
  makeSuccessResponse,
  makeFailResponse,
  makeErrorResponse,
  isSuccessResponse,
  isFailResponse,
  isErrorResponse,
  randomString
}
