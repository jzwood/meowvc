/**
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

// fileDiff = {fp, currentHashsum, targetHashsum, isutf8, mtime}
function remove(fileDiff) {
  const status = fs.statSync(fileDiff.fp)
  if (status && status.isFile()) {
    fs.removeSync(fileDiff.fp)
    console.log(chalk.red('x\t' + fileDiff.fp))
  }
}

// fileDiff = {fp, currentHashsum, targetHashsum, isutf8, mtime}
function writeFile(fileDiff) {

  const getUtf8Data = () => {
    const fileArray = fs.readJsonSync(muOps.path('disk_mem', 'files', gl.insert(fileDiff.targetHashsum, 2, '/')), 'utf8')
    let linehash, data = ''; while (linehash = fileArray.pop()) {
      data = fs.readFileSync(muOps.path('disk_mem', 'lines', gl.insert(linehash, 2, '/')), 'utf8') + data
    }
    return data
  }

  const getBinaryData = () => fs.readFileSync(muOps.path('disk_mem', 'bin', gl.insert(fileDiff.targetHashsum, 2, '/')))

  const data = fileDiff.isutf8 ? getUtf8Data() : getBinaryData()
  fs.outputFileSync(fileDiff.fp, data)
  fs.utimesSync(fileDiff.fp, Date.now()/1000, fileDiff.mtime)

  console.log(chalk.green('✓\t' + fp))
}
