const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const gl = require('../constant')
const pointerOps = require('../modules/pointerOps')

/**********
*  START  *
**********/

module.exports = function start(){
  //checks to see if any parent of cwd has .mu directory
  const isSubDir = () => {
    const parentDirs = gl.cwd.split(path.sep)
    while (parentDirs.length) {
      parentDirs.pop()
      const parentPath = path.join(...parentDirs, gl.root)
      if (fs.existsSync(parentPath)) {
        return true
      }
    }
    return false
  }

  if (fs.existsSync(gl.dest())) {
    console.warn(chalk.yellow('Warning: repo already setup'))
  } else if(isSubDir()) {
    console.warn(chalk.yellow('Warning: mu subdirectory. Please invoke mu from root:', parentPath))
  } else {
    //init history folder
    fs.ensureDirSync(gl.dest('history'))
    //init pointer
    pointerOps()
    //init ignore
    if (!fs.existsSync(gl.dest('_ignore'))) {
      fs.outputFileSync(gl.dest('_ignore'), 'node_modules\n^\\.', 'utf8')
    }
    console.info(chalk.green('setup done'))
  }
}
