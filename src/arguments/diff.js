const fs = require('fs-extra')
const chalk = require('chalk')
const eol = require('os').EOL

const pointerOps = require('../modules/pointerOps')
const muOps = require('../modules/muOps')
const treeOps = require('../modules/treeOps')
const fileOps = require('../modules/fileOps')
const isUtf8 = require('is-utf8')
const get = require('../utils/get')

/*********
*  DIFF  *
*********/

module.exports = function diff(i, args) {
  const file = args[i + 1]

  if (fs.existsSync(file)) {
    const f1 = fs.readFileSync(file)
    if(isUtf8(f1)){
      const f2 = fileOps.getFileMostRecentSave(file) || ''
      return fileOps.fdiff(f1.toString('utf8'), f2.toString('utf8'))
    }
    console.warn(chalk.yellow('Halting: It\'s a bad idea to diff binary files'))
    return 1
  }


  // let pattern = args[i + 1]
  // if (pattern) {
  //   pattern = new RegExp(pattern.trim())
  //
  //   const handle = diff => {
  //     let data
  //     while(data = diff.modified.pop()) {
  //       console.info(chalk.cyan('%\t' + data.fp))
  //     }
  //     while(data = diff.added.pop()) {
  //       console.info(chalk.yellow('+\t' + data.fp))
  //     }
  //     while(data = diff.deleted.pop()) {
  //       console.info(chalk.red('x\t' + data.fp))
  //     }
  //   }
  //
  //   core.difference(null, null, handle, pattern)
  // } else {
  //   console.warn(chalk.red('diff expects a filename or pattern, e.g.') + chalk.inverse('$ mu diff path/to/file.txt'))
  // }
}
