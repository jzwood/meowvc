const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

/*********** THE FOLLOWING FUNCTIONS ARE FOR FILE TESTING ***********/

module.exports = {
  addFiles,
  makeWord,
  modFile,
  newline,
  removeFile,
  rename,
  verify
}

function _randomAscii(validIndices, numOfChars) {
  const getValidIndex = () => validIndices[~~(validIndices.length * Math.random())]
  return String.fromCharCode.apply(undefined, Array(numOfChars).fill(0).map(getValidIndex))
}

function newline() {
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
}

async function verify(t, fpathMap) {
  const fpathArray = Object.entries(fpathMap)
  for(const [name, oldBuffer] of fpathArray){
    const newBuffer = await fs.readFile(name)
    t.deepEqual(oldBuffer, newBuffer)
  }
}

function rename(fpath) {
  let fp = path.parse(fpath)
  const fpNew = path.join(fp.dir, makeWord(5) + fp.ext)
  fs.renameSync(fpath, fpNew)
  console.info(chalk.white(`=\t${fpath} > ${fpNew}`))
}

function makeWord(len) {
  len = len || ~~(3+Math.random() * 3)
  return _randomAscii(_range(97, 122), len)
}

function _range(lo, hi) {
  return Array(hi - lo).fill(0).map((_, i) => i + lo)
}

function safeInds(newLineFreq = 0.1) {
  const nls = Array(~~(newLineFreq * (127 - 32))).fill(10)
  return _range(32, 127).concat(nls)
}

function allInds() {
  return _range(0, 256)
}

function coinFlip() {
  return (+new Date()) % 2
}

function addRandomFile(depth = 1) {
  const fpath = path.join(...Array(Math.max(1, depth)).fill('').map(makeWord)) + '.txt'
  const inds = coinFlip() ? allInds() : safeInds()
  let data = _randomAscii(inds, ~~(Math.random() * 1000))
  fs.outputFileSync(fpath, data)
  data = fs.readFileSync(fpath)
  console.info(chalk.yellow(`+\t${fpath}`))
  return [fpath, data]
}

function modFile(fpath) {
  const inds = coinFlip ? allInds() : safeInds()
  const data = _randomAscii(inds, ~~(Math.random() * 1000))
  fs.outputFileSync(fpath, data)
  console.info(chalk.cyan(`%\t${fpath}`))
}

function removeFile(fpath) {
  fs.removeSync(fpath)
  console.info(chalk.red(`x\t${fpath}`))
}

function addFiles(num) {
  let fpaths = {}
  for (let i = 0; i < num; i++) {
    let [fpath, data] = addRandomFile(~~(Math.random() * 5))
    fpaths[fpath] = data
  }
  return fpaths
}

