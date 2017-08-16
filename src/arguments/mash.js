const chalk = require('chalk')
const pointerOps = require('../modules/pointerOps')
const core = require('../core')()

/*********
*  MASH  *
*********/

module.exports = function mash(i, args){
  const head = args[i + 1] || ''
  let version = args[i + 2] || ''
  const errorMsg = chalk.red('mash expects the name of an existing save, e.g. ') + chalk.inverse('$ mu mash develop v3')
  const po = pointerOps()
  const handle = diff => {
    if(diff.nothingChanged){
      console.info(chalk.yellow('Warning: no changes detected. Mash cancelled.'))
    }else{
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
    console.info(chalk.green(`Repo ${head} ${version} mashed with ${po.head} ${po.version}`),chalk.yellow('Note: Mash unsaved!'))
  }

  if(head){
    version = version || 'v' + po.latest(head)
    if(po.exists(head, version)){
      core.difference(head, version, handle)
    }else{
      console.warn(chalk.red(`Error: ${head} ${version} does not exist.`))
    }
  }else{
    console.log(errorMsg)
  }
}
