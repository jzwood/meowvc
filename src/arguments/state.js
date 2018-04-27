const chalk = require('chalk')
const pointerOps = require('../modules/pointerOps')
const core = require('../core')()
const gl = require('../constant')

/**********
*  STATUS  *
**********/

module.exports = function state(){
  const po = pointerOps()
  const latest = po.latest()
  console.info(chalk.green(po.head, `(v${gl.vnorm(po.version)}/${latest})`))

  const handle = diff => {
    const modified = diff.modified
    const added = diff.added
    const deleted = diff.deleted

    modified.map(data => {
      console.info(chalk.cyan('%\t' + data.fp))
    })
    added.map(data => {
      console.info(chalk.yellow('+\t' + data.fp))
    })
    deleted.map(data => {
      console.info(chalk.red('x\t' + data.fp))
    })
    return {modified, added, deleted}
  }
  return core.difference({handle})
}
