const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const root = require('../sys/root')
const cwd = require('../sys/cwd')
const pointerOps = require('../pointerOps')

// + 1

/**********
*  START  *
**********/

module.exports = function start(){
  //checks to see if any parent of cwd has .mu directory
  const isSubDir = () => {
    const parentDirs = cwd.split(path.sep)
    while (parentDirs) {
      parentDirs.pop()
      const parentPath = path.join(...parentDirs, root)
      if (fs.existsSync(parentPath)) {
        return true
      }
    }
    return false
  }

  if (fs.existsSync(utils.dest())) {
    console.warn(chalk.yellow('Warning: repo already setup'))
  } else if(isSubDir()) {
    console.warn(chalk.yellow('Warning: mu subdirectory. Please invoke mu from root:', parentPath))
  } else {
    //init history folder
    fs.ensureDirSync(utils.dest('history'))
    //init pointer
    pointerOps()
    //init ignore
    const dest = fpath => path.join(cwd, root, fpath)
    if (!fs.existsSync(dest('_ignore'))) {
      fs.outputFileSync(dest('_ignore'), 'node_modules\n^\\.', 'utf8')
    }
    console.info(chalk.green('setup done'))
  }
}
