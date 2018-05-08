const chalk = require('chalk')
const loader = require('../utils/loader')
const mod = loader.require('modules')
const gl = require('../constant')
const core = require('../core')()

/*********
 *  MASH  *
 *********/

module.exports = async function mash(i, args) {
  const head = args[i + 1] || ''

  if (head) {
    const po = mod.pointerOps
    let version = args[i + 2] || 'v' + await po.latest(head)

    const handle = diff => {
      let data; while (data = diff.deleted.pop()) {
        mod.fileOps.undelete(data)
      }

      const conflicts = diff.modified
      const mergeHead = head
      const mergeVersion = version
      const currentHead = po.head
      const currentVersion = 'v' + gl.vnorm(po.version)

      return mod.handleConflicts({ conflicts, mergeHead, mergeVersion, currentHead, currentVersion })
    }

    const exists = await po.exists(head, version)
    const isUnchanged = core.isUnchanged()
    if (exists && isUnchanged) {
      return core.difference({ head, version, handle })
    }

    if (exists && !isUnchanged) {
      console.info(chalk.yellow('Warning: Save or undo changes before calling mash'))
      return gl.exit.cannotExe
    }

    console.warn(chalk.red(`Error: ${head} ${version} does not exist.`))
    return gl.exit.invalid
  }

  console.log(chalk.red('mash expects the name of an existing save, e.g. ') + chalk.inverse('$ mu mash develop v3'))
  return gl.exit.invalid
}

