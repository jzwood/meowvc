/*
 *  FILE OPERATION: WRITING / REMOVING
 */

const fs = require('fs-extra')
const chalk = require('chalk')
const gl = require('../constant')
const muOps = require('./muOps')

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
    console.log(chalk.red('x\t' + fp))
  }
}

function writeFile([fp, hashsum, isutf8, mtime]) {

  const getUtf8Data = () => {
    const fileArray = fs.readJsonSync(muOps.path('disk_mem', 'files', gl.insert(hashsum, 2, '/')), 'utf8')
    let linehash, data = ''; while (linehash = fileArray.pop()) {
      data = fs.readFileSync(muOps.path('disk_mem', 'lines', gl.insert(linehash, 2, '/')), 'utf8') + data
    }
    return data
  }

  const getBinaryData = () => fs.readFileSync(muOps.path('disk_mem', 'bin', gl.insert(hashsum, 2, '/')))

  const data = isutf8 ? getUtf8Data() : getBinaryData()
  fs.outputFileSync(fp, data)
  fs.utimesSync(fp, Date.now()/1000, mtime)

  console.log(chalk.green('✓\t' + fp))
}
