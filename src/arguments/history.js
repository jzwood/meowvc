const pointerOps = require('../modules/pointerOps')
const metaOps = require('../modules/metaOps')

/************
*  HISTORY  *
************/

module.exports = function history(i, args) {
  const head = args[i + 1] || pointerOps().head
  const limit = args[i + 2] || Infinity
  metaOps(head).list(limit)
}
