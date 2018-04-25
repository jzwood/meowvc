const pointerOps = require('../modules/pointerOps')
const metaOps = require('../modules/metaOps')

/************
*  HISTORY  *
************/

module.exports = function history(i, args) {
  const limit = args[i + 1] || Infinity
  const head = pointerOps().head
  return metaOps(head).list(limit)
}
