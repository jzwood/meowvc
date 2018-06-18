const fs = require('fs-extra')
const chalk = require('chalk')
const eol = require('os').EOL

const pointerOps = require('../modules/pointerOps')
const {print} = require('../utils/print')
const muOps = require('../modules/muOps')
const gl = require('../constant')

/**********
 *  START  *
 **********/

module.exports = async function start(i, args) {
  const remoteName = args[i + 1]
  if (muOps.isPath) {
    print(chalk.yellow('Warning: repo already setup'))
    return gl.exit.cannotExe
  }

  let ancestor = await muOps.start.findMuidAncestor()
  if (ancestor) {
    print(chalk.yellow('Warning: mu subdirectory. Please invoke mu from root:', ancestor))
    return gl.exit.cannotExe
  }

  await muOps.start.setupRemote(remoteName)
  await muOps.update()
  //init history folder
  await fs.ensureDir(muOps.path('history'))
  //init pointer
  await pointerOps.init()
  //init ignore
  if (!(await fs.pathExists(muOps.ignorePath))) {
    const recommendedIgnore = `node_modules${eol}^\\.`
    await fs.outputFile(muOps.ignorePath, recommendedIgnore, 'utf8')
  }
  print(chalk.green('setup done'))
  return gl.exit.success
}
