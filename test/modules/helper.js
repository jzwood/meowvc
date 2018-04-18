const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

/*********** THE FOLLOWING FUNCTIONS ARE FOR FILE TESTING ***********/

let QUIET = true

module.exports = {
  addFiles,
  makeWord,
  modFile,
  newline,
  verboseLogging,
  print,
  removeFiles,
  rename,
  verify
}

function verboseLogging(verbose=true){
  QUIET = !verbose
}

function print(msg){
  if(!QUIET){
    console.log(msg)
  }
}

function _randomAscii(validIndices, numOfChars) {
  const getValidIndex = () => validIndices[~~(validIndices.length * Math.random())]
  return String.fromCharCode.apply(undefined, Array(numOfChars).fill(0).map(getValidIndex))
}

function newline() {
  print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
}

//verifies name:buffer map matches initial
async function verify(t, fpathMap) {
  const fpathBuffers = Object.values(fpathMap)
  const newfpathBuffers = await Promise.all(Object.keys(fpathMap).map(name => fs.readFile(name)))
  t.deepEqual(fpathBuffers, newfpathBuffers)
}

function rename(fpath) {
  let fp = path.parse(fpath)
  const fpNew = path.join(fp.dir, makeWord(5) + fp.ext)
  fs.renameSync(fpath, fpNew)
  print(chalk.white(`=\t${fpath} > ${fpNew}`))
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

function _coinFlip() {
  return (+new Date()) % 2
}

//depth is positive integer
function _getRandomFileData(depth = 1) {
  const fpath = path.join(...Array(Math.max(1, depth)).fill('').map(makeWord)) + '.txt'
  const inds = _coinFlip() ? allInds() : safeInds()
  const data = _randomAscii(inds, ~~(Math.random() * 1000))
  const buffer = Buffer.from(data)
  //await fs.outputFile(fpath, data)
  print(chalk.yellow(`+\t${fpath}`))
  return [fpath, buffer]
}

function modFile(fpath) {
  const inds = _coinFlip ? allInds() : safeInds()
  const data = _randomAscii(inds, ~~(Math.random() * 1000))
  fs.outputFileSync(fpath, data)
  print(chalk.cyan(`%\t${fpath}`))
}

// fpath = file name
async function removeFiles(fpaths) {
  await Promise.all(fpaths.map(f => fs.remove(f)))
  fpaths.forEach(f => {
    print(chalk.red(`x\t${f}`))
  })
}

async function addFiles(num) {
  const fpaths = {}
  const newFiles = []
  while(num--){
    const [fpath, buffer] = data = _getRandomFileData(~~(Math.random() * 5))
    fpaths[fpath] = buffer
    newFiles.push(data)
  }
  await Promise.all(newFiles.map(([fpath, buffer]) => fs.outputFile(fpath, buffer)))
  return fpaths
}

