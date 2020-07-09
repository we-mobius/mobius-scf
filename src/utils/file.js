const fs = require('fs')

function makeDirSync (path) {
  // path.sep 文件路径分隔符（mac 与 window 不同）
  // 转变成数组，如 ['a', 'b', 'c']
  const parts = path.split(path.sep)
  for (let i = 1; i <= parts.length; i++) {
    const current = parts.slice(0, i).join(path.sep)
    try {
      fs.accessSync(current)
    } catch (e) {
      fs.mkdirSync(current)
    }
  }
}

module.exports = {
  makeDirSync
}
