const { md5 } = require('../libs/crypto.js')

const concatParams = params => {
  var keys = Object.keys(params)
  keys = keys.sort()
  var sortedParams = {}
  keys.forEach(function (key) {
    sortedParams[key] = params[key]
  })

  var string = ''
  for (var k in sortedParams) {
    string += '&' + k + '=' + sortedParams[k]
  }
  string = string.substr(1)
  return string
}
const xmlify = params => {
  let content = ''
  Object.keys(params).forEach(key => {
    content += `<${key}><![CDATA[${params[key]}]]></${key}>`
  })
  return `<xml>${content}</xml>`
}

const wepaySign = ({ params, apiKey }, { isXmlify = true }) => {
  console.log(`[wepaySign] params -> ${JSON.stringify(params)}`)
  console.log(`[wepaySign] options: isXmlify -> ${isXmlify}`)
  const stringToSign = `${concatParams(params)}&key=${apiKey}`
  console.log(`[wepaySign] stringToSign -> ${stringToSign}`)
  const sign = md5(stringToSign).toUpperCase()
  console.log(`[wepaySign] sign -> ${sign}`)
  const newParams = { ...params, sign }
  console.log(`[wepaySign] newParams: ${JSON.stringify(newParams)}`)
  if (isXmlify) {
    return xmlify(newParams)
  } else {
    return newParams
  }
}
const isValidWepaySign = ({ params, sign, apiKey }) => {
  if (!sign) {
    const { sign: tempSign, ...tempParams } = params
    params = tempParams
    sign = tempSign
  }

  const stringToSign = `${concatParams(params)}&key=${apiKey}`
  const checkSign = md5(stringToSign).toUpperCase()
  console.log(`[isValidWepaySign] checkSign: ${checkSign}`)
  console.log(`[isValidWepaySign] originSign: ${sign}`)
  return checkSign === sign
}

module.exports = {
  concatParams,
  xmlify,
  wepaySign,
  isValidWepaySign
}
