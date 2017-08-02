const chalk = require('chalk')
const pointerOps = require('../pointerOps')
const core = require('../core')()

// + 1

/**********
*  STATE  *
**********/

module.exports = function state(){
  which()
  core.state()
}

function which() {
  const po = pointerOps()
  const latest = po.latest()
  const output = Object.keys(po.branch).map(key => {
    return (key === po.head) ? chalk.green(key, `(v${Math.max(0, po.branch[key] - 1)}/${latest})`) : key
  }).join(' ')
  console.info(output)
}
