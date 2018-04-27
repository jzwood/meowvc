const fs = require('fs-extra')
const chalk = require('chalk')
const eol = require('os').EOL

const pointerOps = require('../modules/pointerOps')
const muOps = require('../modules/muOps')
const gl = require('../constant')

/**********
 *  START  *
 **********/

module.exports = async function start(i, args) {
  const remoteName = args[i + 1]
  if (muOps.path()) {
    console.warn(chalk.yellow('Warning: repo already setup'))
    return gl.exit.cannotExe
  } else {
    let ancestor = await muOps.findMuidAncestor()
    if (ancestor) {
      console.warn(chalk.yellow('Warning: mu subdirectory. Please invoke mu from root:', ancestor))
      return gl.exit.cannotExe
    } else {
      await muOps.setupRemote(remoteName)
      //init history folder
      await fs.ensureDir(muOps.path('history'))
      //init pointer
      pointerOps()
      //init ignore
      if (!(await fs.pathExists(muOps.path('_ignore')))) {
        await fs.outputFile(muOps.path('_ignore'), `node_modules${eol}^\\.`, 'utf8')
      }
      console.info(chalk.green('setup done'))
      return gl.exit.success
    }
  }
}

