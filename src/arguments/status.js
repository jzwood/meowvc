const chalk = require('chalk')
const pointerOps = require('../modules/pointerOps')
const core = require('../core')()

/**********
*  STATE  *
**********/

module.exports = function status(){
  which()
  const handle = diff => {
    let data
    while(data = diff.modified.pop()) {
      console.info(chalk.cyan('+\t' + data[0]))
    }
    while(data = diff.added.pop()) {
      console.info(chalk.yellow('+\t' + data[0]))
    }
    while(data = diff.deleted.pop()) {
      console.info(chalk.red('+\t' + data[0]))
    }
  }
  core.difference(null, null, handle)
}

function which() {
  const po = pointerOps()
  const latest = po.latest()
  const output = Object.keys(po.branch).map(key => {
    return (key === po.head) ? chalk.green(key, `(v${Math.max(0, po.branch[key] - 1)}/${latest})`) : key
  }).join(' ')
  console.info(output)
}
