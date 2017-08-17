const chalk = require('chalk')
const loader = require('../utils/loader')
const mod = loader.require('modules')
const core = require('../core')()

/*********
*  MASH  *
*********/

module.exports = function mash(i, args) {
  const head = args[i + 1] || ''
  let version = args[i + 2] || ''
  const po = mod.pointerOps()
  const handle = diff => {
    let data
    while (data = diff.deleted.pop()) {
      mod.fileOps.undelete(data)
    }
    return mod.handleConflicts(diff.modified)
  }

  if (head) {
    version = version || 'v' + po.latest(head)
    const exists = po.exists(head, version)
    const noChanges = core.difference(null, null, diff => diff.nothingChanged)
    if (exists && noChanges) {
      core.difference(head, version, handle)
      console.info(chalk.green(`Repo ${head} ${version} mashed with ${po.head} ${po.version}`), chalk.yellow('Note: Mash unsaved!'))
    } else if (exists && !noChanges) {
      console.info(chalk.yellow('Warning: Save or undo changes before calling mash'))
    } else {
      console.warn(chalk.red(`Error: ${head} ${version} does not exist.`))
    }
  } else {
    console.log(chalk.red('mash expects the name of an existing save, e.g. ') + chalk.inverse('$ mu mash develop v3'))
  }
}
