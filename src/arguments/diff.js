const fs = require('fs-extra')
const chalk = require('chalk')
const eol = require('os').EOL

const pointerOps = require('../modules/pointerOps')
const muOps = require('../modules/muOps')

/*********
*  DIFF  *
*********/

module.exports = function diff(i, args){
  const [p1, p2=10] = args.slice(i + 1)

  console.info(p1,p2)
  return 0

  let ancestor
  if (muOps.repoPath){
    console.warn(chalk.yellow('Warning: repo already setup'))
  } else if(ancestor = muOps.findMuidAncestor()) {
    console.warn(chalk.yellow('Warning: mu subdirectory. Please invoke mu from root:', ancestor))
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
  }
}
