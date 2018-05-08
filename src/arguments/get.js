const chalk = require('chalk')
const po = require('../modules/pointerOps')
const gl = require('../constant')
const core = require('../core')()

/********
 *  GET  *
 ********/

module.exports = async function get(i, args) {
  const head = args[i + 1]
  let version = args[i + 2] || ''
  const errorMsg = chalk.red('get expects the name of an existing save, e.g. ') + chalk.inverse('$ mu get master')
  if (head) {
    version = version || 'v' + await po.latest(head)
    if (await po.exists(head, version)) {
      if (await core.isUnchanged()) {
        const result = await core.checkout({ head, version })
        po.setPointer(head, version)
        await po.incrementVersion()
        console.info(chalk.green(`Repo switched to ${head} ${version}`))
        return result
      }
      console.info(chalk.yellow('Warning: Save or undo changes before calling get'))
      return gl.exit.invalid
    }
    console.warn(chalk.red(`Error: ${head} ${version} does not exist.`))
    return gl.exit.cannotExe
  }
  console.log(errorMsg)
  return gl.exit.invalid
}
