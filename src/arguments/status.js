const chalk = require('chalk')
const pointerOps = require('../modules/pointerOps')
const core = require('../core')()

/**********
*  STATUS  *
**********/

module.exports = function status(){
  const po = pointerOps()
  const latest = po.latest()
  console.info(chalk.green(po.head, `(v${Math.max(0, po.version - 1)}/${latest})`))

  const handle = diff => {
    let data
    while(data = diff.modified.pop()) {
      console.info(chalk.cyan('%\t' + data[0]))
    }
    while(data = diff.added.pop()) {
      console.info(chalk.yellow('+\t' + data[0]))
    }
    while(data = diff.deleted.pop()) {
      console.info(chalk.red('x\t' + data[0]))
    }
  }
  core.difference(null, null, handle)
}
