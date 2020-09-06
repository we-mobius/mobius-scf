const tcb = require('@cloudbase/node-sdk')

const cloud = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

module.exports = {
  tcb, cloud, db, _
}
