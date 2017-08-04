/*
 *  FS WRITING / REMOVING
 */

const fs = require('fs-extra')
const chalk = require('chalk')
const gl = require('../constant')

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

function writeFile(file, filehash, encoding, mtime) {
  const insert = (string, index, substr) => string.slice(0, index) + substr + string.slice(index)
  const fileArray = fs.readJsonSync(gl.dest('disk_mem', 'files', insert(filehash, 2, '/')), 'utf8')
  let linehash, data = ''
  let firstLineHash = fileArray.pop()
  while (linehash = fileArray.pop()) {
    data = fs.readFileSync(gl.dest('disk_mem', 'lines', insert(linehash, 2, '/')), encoding) + data
  }
  fs.outputFileSync(file, data, encoding)
  fs.utimesSync(file, +new Date(), mtime)

  console.log(chalk.green('✓\t' + file))
}
