const { createHash } = require('crypto')

const encrypt = (algorithm, content) => {
  const hash = createHash(algorithm)
  hash.update(content, 'utf8')
  return hash.digest('hex')
}

const sha1 = (content) => encrypt('sha1', content)

const md5 = (content) => encrypt('md5', content)

module.exports = { sha1, md5, encrypt }
