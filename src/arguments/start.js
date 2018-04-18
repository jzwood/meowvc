const fs = require('fs-extra')
const chalk = require('chalk')
const eol = require('os').EOL

const pointerOps = require('../modules/pointerOps')
const muOps = require('../modules/muOps')
const gl = require('../constant')

/**********
*  START  *
**********/

module.exports = function start(i, args){
  const remoteName = args[i + 1]
  let ancestor
  if (muOps.repoPath){
    console.warn(chalk.yellow('Warning: repo already setup'))
    return gl.exit.cannotExe
  } else if(ancestor = muOps.findMuidAncestor()) {
    console.warn(chalk.yellow('Warning: mu subdirectory. Please invoke mu from root:', ancestor))
    return gl.exit.cannotExe
  } else {
    muOps.setupRemote(remoteName)
    //init history folder
    fs.ensureDirSync(muOps.path('history'))
    //init pointer
    pointerOps()
    //init ignore
    if (!fs.existsSync(muOps.path('_ignore'))) {
      fs.outputFileSync(muOps.path('_ignore'), `node_modules${eol}^\\.`, 'utf8')
    }
    console.info(chalk.green('setup done'))
    return gl.exit.success
  }
}
