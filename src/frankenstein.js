const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

module.exports = cwd => {

  const ROOT = '.mu'
  const insert = (string, index, substr) => string.slice(0, index) + substr + string.slice(index)
  const reverted = str => {
    console.log(chalk.green('✓\t' + str))
  }
  const removed = str => {
    console.log(chalk.red('✗\t' + str))
  }

  return {
    undo: {
      deleted: writeFile,
      modified: writeFile,
      renamed: rename,
      added: remove
    }
  }

  function remove(file) {
    const status = fs.statSync(file)
    if (status && status.isFile()) {
      fs.removeSync(file)
      removed(file)
    }
  }

  function rename(oldpath, newPath) {
    fs.renameSync(newPath, oldpath)
  }

  function writeFile(file, filehash, mtime) {
    const fileArray = fs.readJsonSync(path.join(cwd, ROOT, 'disk_mem', 'files', insert(filehash, 2, '/')), 'utf8')
    let linehash, data = ''
    let firstLineHash = fileArray.pop()
    while (linehash = fileArray.pop()) {
      data = fs.readFileSync(path.join(cwd, ROOT, 'disk_mem', 'lines', insert(linehash, 2, '/')), 'utf8') + data
    }
    fs.outputFileSync(file, data)
    fs.utimesSync(file, +new Date(), mtime)

    reverted(file)
  }
}
