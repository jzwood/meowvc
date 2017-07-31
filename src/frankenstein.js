const cwd = require('./sys/cwd')
const root = require('./sys/root')

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')



module.exports = {
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
    console.log(chalk.red('✗\t' + file))
  }
}

function rename(oldpath, newPath) {
  fs.renameSync(newPath, oldpath)
}

function writeFile(file, filehash, mtime) {
  const insert = (string, index, substr) => string.slice(0, index) + substr + string.slice(index)
  const fileArray = fs.readJsonSync(path.join(cwd, root, 'disk_mem', 'files', insert(filehash, 2, '/')), 'utf8')
  let linehash, data = ''
  let firstLineHash = fileArray.pop()
  while (linehash = fileArray.pop()) {
    data = fs.readFileSync(path.join(cwd, root, 'disk_mem', 'lines', insert(linehash, 2, '/')), 'utf8') + data
  }
  fs.outputFileSync(file, data)
  fs.utimesSync(file, +new Date(), mtime)

  console.log(chalk.green('✓\t' + file))
}
