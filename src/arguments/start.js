const fs = require('fs-extra')
const chalk = require('chalk')
const eol = require('os').EOL

const pointerOps = require('../modules/pointerOps')
const muOps = require('../modules/muOps')

/**********
*  START  *
**********/

module.exports = function start(i, args){
  const name = args[i + 1]
  if (name) {
    let ancestor
    if (muOps.repoPath){
      console.warn(chalk.yellow('Warning: repo already setup'))
    } else if(ancestor = muOps.findMuidAncestor()) {
      console.warn(chalk.yellow('Warning: mu subdirectory. Please invoke mu from root:', ancestor))
    } else {
      muOps.setupRemote(name)
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
  }else{
    console.warn(chalk.yellow('start expects a project name, e.g.'), chalk.inverse('$ mu start my-web-app'))
  }
}
