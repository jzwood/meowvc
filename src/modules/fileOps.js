/*
 *  FILE OPERATION: WRITING / REMOVING
 */

const fs = require('fs-extra')
const chalk = require('chalk')
const gl = require('../constant')

module.exports = {
  overwrite: writeFile,
  undelete: writeFile,
  unmodify: writeFile,
  unadd: remove
}

function remove([fp, hashsum, isutf8, mtime]) {
  const status = fs.statSync(fp)
  if (status && status.isFile()) {
    fs.removeSync(fp)
    console.log(chalk.red('✗\t' + fp))
  }
}

function writeFile([fp, hashsum, isutf8, mtime]) {

  const getUtf8Data = () => {
    const fileArray = fs.readJsonSync(gl.dest('disk_mem', 'files', gl.insert(hashsum, 2, '/')), 'utf8')
    let linehash, data = ''; while (linehash = fileArray.pop()) {
      data = fs.readFileSync(gl.dest('disk_mem', 'lines', gl.insert(linehash, 2, '/')), 'utf8') + data
    }
    return data
  }

  const getBinaryData = () => fs.readFileSync(gl.dest('disk_mem', 'bin', gl.insert(hashsum, 2, '/')))

  const data = isutf8 ? getUtf8Data() : getBinaryData()
  fs.outputFileSync(fp, data)
  fs.utimesSync(fp, +new Date(), mtime)

  console.log(chalk.green('✓\t' + fp))
}
