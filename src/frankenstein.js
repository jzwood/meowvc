const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

module.exports = cwd => {

  const ROOT = '.mu'
  const insert = (string, index, substr) => string.slice(0, index) + substr + string.slice(index)

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
    }
  }

  function rename(oldpath, newPath) {
    fs.renameSync(newPath, oldpath)
  }

  function writeFile(file, filehash) {
    const fileArray = fs.readJsonSync(path.join(cwd, ROOT, 'disk_mem', 'files', insert(filehash, 2, '/')), 'utf8')
    let linehash, data = ''
    while (linehash = fileArray.pop()) {
      data += fs.readFileSync(path.join(cwd, ROOT, 'disk_mem', 'lines', insert(linehash, 2, '/')), 'utf8')
    }
    fs.outputFileSync(file, data)
  }
}
