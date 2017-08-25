const fs = require('fs-extra')
const path = require('path')
const mu = require('../mu')

module.exports = {
  mu, setupTest, addFile
}

function setupTest(){
  const cwd = process.cwd(), root = '.mu'
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
  const fpath = path.join(...Array(Math.max(1, depth)).fill('').map(makeWord))
  const data = randomAscii(0,255,~~(Math.random() * 5000))
  fs.outputFileSync(fpath, data)
  return fpath
}

function addFiles(num){
  let fpaths = []
  for(let i=0; i<num; i++){
    fpaths.push(addFile(~~(Math.random() * 2)))
  }
}
