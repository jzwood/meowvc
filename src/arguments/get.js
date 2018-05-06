const chalk = require('chalk')
const po = require('../modules/pointerOps')
const core = require('../core')()

/********
*  GET  *
********/

module.exports = function get(i, args){
  const head = args[i + 1]
  let version = args[i + 2] || ''
  const errorMsg = chalk.red('get expects the name of an existing save, e.g. ') + chalk.inverse('$ mu get master')
  if(head){
    version = version || 'v' + po.latest(head)
    if(po.exists(head, version)){
      if(core.isUnchanged()){
        core.checkout({head, version})
        po.setPointer(head, version)
        po.incrementVersion()
        console.info(chalk.green(`Repo switched to ${head} ${version}`))
      }else {
        console.info(chalk.yellow('Warning: Save or undo changes before calling get'))
      }
    }else{
      console.warn(chalk.red(`Error: ${head} ${version} does not exist.`))
    }
  }else{
    console.log(errorMsg)
  }
}
