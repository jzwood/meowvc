const chalk = require('chalk')
const pointerOps = require('../modules/pointerOps')
const core = require('../core')()

/********
*  GET  *
********/

module.exports = function get(i, args){
  console.log('get', i)
  const head = args[i + 1] || ''
  let version = args[i + 2] || ''
  const errorMsg = chalk.red('get expects the name of an existing save, e.g. ') + chalk.inverse('$ mu get master')
  const po = pointerOps()
  if(head){
    version = version || po.latest(head)
    if(po.exists(head, version)){
      core.checkout(head, version)
      po.setPointer(head, version)
      po.update()
    }else{
      console.warn(chalk.red(`Error: ${head} ${version} does not exist.`))
    }
  }else{
    console.log(errorMsg)
  }
}
