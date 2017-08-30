const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

module.exports = {
  testMu, setupTest, removeFile, addFiles, newline, modFile, rename, verify
}

function testMu(){
  // whack all references in require cache
  for (const req of Object.keys(require.cache)) {
    if(!(/node_modules/.test(req))){
      delete require.cache[req]
    }
  }
  const mu = require('../mu')
  return mu.apply(null,arguments)
}

function setupTest(){
  const cwd = process.cwd()
  const cwdTemp = path.join(cwd, 'test','temp')
  fs.emptyDirSync(cwdTemp)
  process.chdir(cwdTemp)
}

function randomAscii(asciiLow, asciiHi, numOfChars){
  return String.fromCharCode.apply(undefined,Array(numOfChars).fill(0).map(i => asciiLow + ~~(Math.random() * (asciiHi - asciiLow))))
}

function newline(){
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
}

function verify(fpathMap){
  Object.keys(fpathMap).forEach(f => {
    const oldData = fpathMap[f]
    const newData = fs.readFileSync(f)
    let isEq = oldData.equals(newData) ? chalk.green('Yes!') : chalk.red('No')
    console.log(`old == new (${f})`, isEq)
  })
}

function rename(fpath){
  let fp = path.parse(fpath)
  const fpNew = path.join(fp.dir, makeWord(5) + fp.ext)
  fs.renameSync(fpath, fpNew)
  console.info(chalk.white(`=\t${fpath} > ${fpNew}`))
}

function makeWord(){
  return randomAscii(97,122,~~(3+Math.random()*3))
}

function addRandomFile(depth=1){
  const fpath = path.join(...Array(Math.max(1, depth)).fill('').map(makeWord)) + '.txt'
  let data = randomAscii(0,255,~~(Math.random() * 5000))
  fs.outputFileSync(fpath, data)
  data = fs.readFileSync(fpath)
  console.info(chalk.yellow(`+\t${fpath}`))
  return [fpath, data]
}

function modFile(fpath){
  const data = randomAscii(0,255,~~(Math.random() * 5000))
  fs.outputFileSync(fpath, data)
  console.info(chalk.cyan(`%\t${fpath}`))
}

function removeFile(fpath){
  fs.removeSync(fpath)
  console.info(chalk.red(`x\t${fpath}`))
}

function addFiles(num){
  let fpaths = {}
  for(let i=0; i<num; i++){
    let [fpath, data] = addRandomFile(~~(Math.random() * 5))
    fpaths[fpath] = data
  }
  return fpaths
}
