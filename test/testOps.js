const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

module.exports = {
  testMu, setupTest, addFile, removeFile, addFiles
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

function makeWord(){
  return randomAscii(97,122,~~(3+Math.random()*3))
}

function addFile(depth=1){
  const fpath = path.join(...Array(Math.max(1, depth)).fill('').map(makeWord)) + '.txt'
  const data = randomAscii(0,255,~~(Math.random() * 5000))
  fs.outputFileSync(fpath, data)
  console.info(chalk.cyan(`+\t${fpath}`))
  return fpath
}

function removeFile(fpath){
  fs.removeSync(fpath)
  console.info(chalk.magenta(`x\t${fpath}`))
}

function addFiles(num){
  let fpaths = []
  for(let i=0; i<num; i++){
    fpaths.push(addFile(~~(Math.random() * 5)))
  }
  return fpaths
}
