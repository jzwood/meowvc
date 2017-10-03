const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

module.exports = {
  testMu, setupTest, cleanupTest, removeFile, addFiles, newline, modFile, rename, verify, muStart, muSave
}

// runs $ mu <param> in test environment
function testMu(){
  // whack all references in require cache
  for (const req of Object.keys(require.cache)) {
    if(!(/node_modules/.test(req))){
      delete require.cache[req]
    }
  }
  const mu = require('../mu')
  return mu.apply(null, arguments)
}

function parseFlags(flags = []){
  const local = flags.some(f => f.startsWith('-') && f.includes('l'))
  const preserve = flags.some(f => f.startsWith('-') && f.includes('p'))
  return {local, preserve}
}

function setupTest(flags, name){
  name = path.join('test', name)
  const local = parseFlags(flags).local

  const remote = getRemote(local ? null : name)
  emptyTestDir(remote)

  const tempPath = path.join(process.cwd(), 'test', 'temp')
  fs.emptyDirSync(tempPath)
  process.chdir(tempPath)
  muStart(local, name)
}

//runs mu start in the right place (local|dropbox)
function muStart(isLocal, name){
  if(name){
    console.info(`${ isLocal ? chalk.inverse('MU START LOCAL') : chalk.inverse('MU START DROPBOX')}`)
    isLocal ? testMu(['start']) : testMu(['start', name])
  }else{
    throw 'muStart param <name> not found'
  }
}

function muSave(){
  testMu(['save','save message ' + makeWord()])
}

function emptyTestDir(remote, remove=false){
  if(/\.mu|Mu Repositories/.test(remote)){ // last rmrf failsafe
    if(remove){
      fs.removeSync(remote)
    }else{
      fs.emptyDirSync(remote)
    }
  }
}

function getRemote(name){
  const muOps = require('../src/modules/muOps')
  muOps.setupRemote(name)
  return muOps.path()
}

function cleanupTest(flags, name){
  name = path.join('test', name)
  const pf = parseFlags(flags)

  const remote = getRemote(pf.local ? null : name)
  if(!pf.preserve){
    emptyTestDir(remote, remove=true)
  }

  if(pf.preserve){
    console.info(chalk.yellow(remote), chalk.inverse('preserved'))
  }else{
    console.info(chalk.cyan('cleaning up...'))
    console.info(chalk.yellow(remote), chalk.inverse('deleted'))
  }
}

function randomAscii(validIndices, numOfChars){
  const getValidIndex = () => validIndices[~~(validIndices.length * Math.random())]
  return String.fromCharCode.apply(undefined, Array(numOfChars).fill(0).map(getValidIndex))
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
  return randomAscii(range(97, 122), ~~(3+Math.random()*3))
}

function range(lo, hi){
  return Array(hi - lo).fill(0).map((_, i) => i + lo)
}

function safeInds(newLineFreq=0.1){
  const nls = Array(~~(newLineFreq * (127-32))).fill(10)
  return range(32, 127).concat(nls)
}

function allInds(){
  return range(0, 256)
}

function coinFlip(){
  return (+new Date()) % 2
}

function addRandomFile(depth=1){
  const fpath = path.join(...Array(Math.max(1, depth)).fill('').map(makeWord)) + '.txt'
  const inds = coinFlip() ? allInds() : safeInds()
  let data = randomAscii(inds, ~~(Math.random() * 1000))
  fs.outputFileSync(fpath, data)
  data = fs.readFileSync(fpath)
  console.info(chalk.yellow(`+\t${fpath}`))
  return [fpath, data]
}

function modFile(fpath){
  const inds = coinFlip ? allInds() : safeInds()
  const data = randomAscii(inds,~~(Math.random() * 1000))
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
