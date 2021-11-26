/**
 *  FILE OPERATION: WRITING / REMOVING
 */

const minimumEditDistance = require('minimum-edit-distance')
const eol = require('os').EOL
const fs = require('fs-extra')
const chalk = require('chalk')
const gl = require('../constant')
const {print} = require('../utils/print')
const muOps = require('./muOps')
const po = require('./pointerOps')
const treeOps = require('./treeOps')

module.exports = {
  overwrite: writeFile,
  undelete: writeFile,
  unmodify: writeFile,
  unadd: remove,
  getFileMostRecentSave,
  retrieveData,
  fdiff
}

function fdiff(str1, str2, fast=false) {

  const splitIt = str => {
    return str.split(eol).reduce((acc, substr) => {
      return acc.concat(eol, ...substr.split(/(?=\s)/))
    },[])
  }

  const [p1, p2] = [str1, str2].map(splitIt)

  const max = Math.max(p1.length, p2.length)

  const diffSize = fast ? 100 : 1000

  const diff = []
  for (let i = 0; i < max; i += diffSize) {
    Array.prototype.push.apply(diff, getDiff(p1.slice(i, i + diffSize), p2.slice(i, i + diffSize)))
  }
  const diffString = diff.join('')
  return diffString

  function getDiff(p1, p2) {
    const backtrace = minimumEditDistance.diff(p1, p2, Infinity).backtrace
    let pointer = p2.length
    let diff = []
    const added = str => chalk.bold(chalk.green(str))
    const deleted = str => chalk.underline(chalk.red(str))
    backtrace.forEach(instr => {
      const getNum = i => {
        let num = i.match(/\d+/)
        return num ? parseInt(num[0], 10) : 1
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

async function getFileMostRecentSave(fp) {
  const currentTree = await treeOps.getSavedData(po.head)

  const hashes = Object.keys(currentTree.dat)
  let hash; while (hash = hashes.pop()){
    const data = currentTree.dat[hash]
    const isutf8 = data[0]
    if(Object.keys(data[2]).some(k => (k === fp)) && isutf8){
      return retrieveData({'targetHashsum': hash})
    }
  }
  return false
}

async function remove({fp}) {
  const status = await fs.stat(fp)
  if (status && status.isFile()) {
    await fs.remove(fp)
    print(chalk.red(`x\t${fp}`))
  }
}

async function retrieveData({targetHashsum}){
  return fs.readFile(muOps.path('disk_mem', 'bin', gl.insert(targetHashsum, 2, '/')))
}

function getReadStream({targetHashsum}) {
  return fs.createReadStream(muOps.path('disk_mem', 'bin', gl.insert(targetHashsum, 2, '/')))
}

async function writeFile({fp, targetHashsum, mtime}) {
  const readStream = getReadStream({targetHashsum})
  const writeStream = fs.createWriteStream(fp)

  readStream.pipe(writeStream)
  await (new Promise(resolve => {
    writeStream.on('finish', resolve)
  }))
  await fs.utimes(fp, Date.now()/1000, mtime)

  print(chalk.green(`✓\t${fp}`))
}
