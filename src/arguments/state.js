const chalk = require('chalk')
const pointerOps = require('../modules/pointerOps')
const core = require('../core')()
const {print} = require('../utils/print')
const gl = require('../constant')

/**********
*  STATUS  *
**********/

module.exports = async function state(){
  const po = pointerOps
  const latest = await po.latest()
  print(chalk.green(po.head, `(v${gl.vnorm(po.version)}/${latest})`))

  const handle = diff => {
    const modified = diff.modified
    const added = diff.added
    const deleted = diff.deleted

    modified.map(data => {
      print(chalk.cyan('%\t' + data.fp))
    })
    added.map(data => {
      print(chalk.yellow('+\t' + data.fp))
    })
    deleted.map(data => {
      print(chalk.red('x\t' + data.fp))
    })
    return {modified, added, deleted}
  }
  return core.difference({handle})
}
