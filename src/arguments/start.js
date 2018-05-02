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
  if (muOps.isPath) {
    console.warn(chalk.yellow('Warning: repo already setup'))
    return gl.exit.cannotExe
  } else {
    let ancestor = await muOps.start.findMuidAncestor()
    if (ancestor) {
      console.warn(chalk.yellow('Warning: mu subdirectory. Please invoke mu from root:', ancestor))
      return gl.exit.cannotExe
    } else {
      await muOps.start.setupRemote(remoteName)
      await muOps.update()
      //init history folder
      await fs.ensureDir(muOps.path('history'))
      //init pointer
      pointerOps()
      //init ignore
      if (!(await fs.pathExists(muOps.ignorePath))) {
        const recommendedIgnore = `node_modules${eol}^\\.`
        await fs.outputFile(muOps.ignorePath, recommendedIgnore, 'utf8')
      }
      console.info(chalk.green('setup done'))
      return gl.exit.success
    }
  }
}

