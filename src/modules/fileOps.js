/**
 *  FILE OPERATION: WRITING / REMOVING
 */

const fs = require('fs-extra')
const chalk = require('chalk')
const gl = require('../constant')
const muOps = require('./muOps')
const minimumEditDistance = require('minimum-edit-distance')

module.exports = {
  overwrite: writeFile,
  undelete: writeFile,
  unmodify: writeFile,
  unadd: remove,
  getFileMostRecentSave,
  fdiff
}


function fdiff(str1, str2, fast=false) {

  const p1 = str1.split(/(?= |\n)/)
  const p2 = str2.split(/(?= |\n)/)

  const max = Math.max(p1.length, p2.length)

  const diffSize = fast ? 100 : 1000

  const diff = []
  for (let i = 0; i < max; i += diffSize) {
    Array.prototype.push.apply(diff, getDiff(p1.slice(i, i + diffSize), p2.slice(i, i + diffSize)))
  }
  const diffString = diff.join('')
  console.log(diffString)
  return getDiff

  function getDiff(p1, p2) {
    const backtrace = minimumEditDistance.diff(p1, p2, Infinity).backtrace
    let pointer = p2.length
    let diff = []
    const added = str => chalk.bold(chalk.green(str))
    const deleted = str => chalk.dim(chalk.red(str))
    backtrace.forEach(instr => {
      const getNum = i => {
        let num = i.match(/[0-9]+/)
        return num ? parseInt(num[0]) : 1
      }
      if (instr[0] === 'i') {
        diff.unshift(added(instr.slice(1)))
      } else {
        const num = getNum(instr)
        pointer -= num
        const p2Slice = p2.slice(pointer, pointer + num).join('')
        diff.unshift(instr[0] === 'd' ? deleted(p2Slice) : p2Slice)
      }
    })
    return diff
  }
}

function getFileMostRecentSave(fp){
  const po = pointerOps()
  const currentTree = treeOps.getSavedData(po.head)

  const hashes = Object.keys(currentTree.dat)
  let hash; while (hash = hashes.pop()){
    const fileDiff = currentTree[hash]
    if(Object.keys(fileDiff[2])[0] === fp && fileDiff[0]){
      return retrieveData(fileDiff)
    }
  }
  return false
}

// fileDiff = {fp, currentHashsum, targetHashsum, isutf8, mtime}
function remove(fileDiff) {
  const status = fs.statSync(fileDiff.fp)
  if (status && status.isFile()) {
    fs.removeSync(fileDiff.fp)
    console.log(chalk.red('x\t' + fileDiff.fp))
  }
}

function retrieveData(fileDiff){
  const getUtf8Data = () => {
    const fileArray = fs.readJsonSync(muOps.path('disk_mem', 'files', gl.insert(fileDiff.targetHashsum, 2, '/')), 'utf8')
    let linehash, data = ''; while (linehash = fileArray.pop()) {
      data = fs.readFileSync(muOps.path('disk_mem', 'lines', gl.insert(linehash, 2, '/')), 'utf8') + data
    }
    return data
  }

  const getBinaryData = () => fs.readFileSync(muOps.path('disk_mem', 'bin', gl.insert(fileDiff.targetHashsum, 2, '/')))

  return fileDiff.isutf8 ? getUtf8Data() : getBinaryData()
}

// fileDiff = {fp, currentHashsum, targetHashsum, isutf8, mtime}
function writeFile(fileDiff) {
  fs.outputFileSync(fileDiff.fp, retrieveData(fileDiff))
  fs.utimesSync(fileDiff.fp, Date.now()/1000, fileDiff.mtime)

  console.log(chalk.green('✓\t' + fileDiff.fp))
}
