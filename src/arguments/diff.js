const fs = require('fs-extra')
const chalk = require('chalk')
const eol = require('os').EOL

const pointerOps = require('../modules/pointerOps')
const muOps = require('../modules/muOps')

const minimumEditDistance = require('minimum-edit-distance')

/*********
*  DIFF  *
*********/

module.exports = function diff(i, args){
  const [p1, p2=10] = args.slice(i + 1)

  console.info(p1,p2)
  // return 0

  const smaller = Math.min(p1.length, p2.length)
  const diffSize = 1000

  let index
  for(index=0; index<smaller; index+=diffSize){
    let difference = minimumEditDistance.diff(p1, p2)
    let backtrace = difference.backtrace
    displayDiff(p1, backtrace)
  }
  if(p1.length > p2.length){
    displayRemoved(p1.slice(i, p1.length-1))
  }else{
    displayAdded(p2.slice(i, p2.length-1))
  }

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
