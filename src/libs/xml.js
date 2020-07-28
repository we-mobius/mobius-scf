const { parseString } = require('xml2js')

const toJSON = xml => {
  return new Promise((resolve, reject) => {
    parseString(xml, { explicitArray: false, ignoreAttrs: true }, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

module.exports = {
  toJSON
}
