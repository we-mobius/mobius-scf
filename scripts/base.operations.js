const makeMultiPlatformOperationCollection = ({
  ifanr = () => {},
  tencent = () => {}
} = {
  ifanr: () => {},
  tencent: () => {}
}) => {
  return platform => {
    if (platform === 'ifanr') {
      return ifanr
    } else if (platform === 'tencent') {
      return tencent
    }
  }
}

module.exports = {
  makeMultiPlatformOperationCollection
}
