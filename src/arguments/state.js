const chalk = require('chalk')
const pointerOps = require('../modules/pointerOps')
const gl = require('../constant')
const core = require('../core')()

/**********
*  STATUS  *
**********/

module.exports = function state(){
  const po = pointerOps()
  const latest = po.latest()
  console.info(chalk.green(po.head, `(v${gl.vnorm(po.version)}/${latest})`))

  const handle = diff => {
    let data
    while(data = diff.modified.pop()) {
      console.info(chalk.cyan('%\t' + data.fp))
    }
    while(data = diff.added.pop()) {
      console.info(chalk.yellow('+\t' + data.fp))
    }
    while(data = diff.deleted.pop()) {
      console.info(chalk.red('x\t' + data.fp))
    }
  }
  core.difference({handle})
}
