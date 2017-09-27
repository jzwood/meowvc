const chalk = require('chalk')
const metaOps = require('../modules/metaOps')

/************
*  HISTORY  *
************/

module.exports = function history(i, args) {
  const head = args[i + 1]
  if (head) {
    let limit = args[i + 2]
    metaOps(head).list(limit)
  }else{
    console.log(chalk.red('history expects a saved repo name, e.g. ') + chalk.inverse('$ mu history master'))
  }
}
