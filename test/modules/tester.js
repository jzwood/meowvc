const test = require('ava')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const helper = require('./helper')

module.exports = {
  cleanupTest,
  muSave,
  muStart,
  parseFlags,
  setupTest,
  testMu
}

// runs $ mu <param> in test environment
function testMu() {
  // whack all references in require cache
  for (const req of Object.keys(require.cache)) {
    if (!(/node_modules/.test(req))) {
      delete require.cache[req]
    }
  }
  const mu = require('../../mu')
  return mu.apply(null, arguments)
}

function parseFlags(flags = []) {
  const local = flags.some(f => f.startsWith('-') && f.includes('l'))
  const preserve = flags.some(f => f.startsWith('-') && f.includes('p'))
  return {
    local,
    preserve
  }
}

//runs mu start in the right place (local|dropbox)
function muStart(isLocal, name = '', msg = '') {
  console.info(`${ isLocal ? chalk.inverse('MU START LOCAL ' + msg) : chalk.inverse('MU START DROPBOX ' + msg)}`)
  isLocal ? testMu(['start']) : testMu(['start', name])
}

function muSave() {
  testMu(['save', 'save message ' + helper.makeWord()])
}

function emptyTestDir(remote, remove = false) {
  if (/\.mu|Mu Repositories/.test(remote)) { // last rmrf failsafe
    if (remove) {
      fs.removeSync(remote)
    } else {
      fs.emptyDirSync(remote)
    }
  }
}

function getRemote(isLocal, name) {
  const muOps = require('../../src/modules/muOps')
  return muOps.findRemotePath(isLocal ? false : name)
}

function setupTest(flags, name) {
  const local = parseFlags(flags).local

  const tempPath = path.join(process.cwd(), 'test', 'temp')
  fs.emptyDirSync(tempPath)
  process.chdir(tempPath)

  name = path.join('test', name)
  const remote = getRemote(local, name)
  emptyTestDir(remote)

  muStart(local, name)
}

function cleanupTest(flags, name) {
  name = path.join('test', name)
  const local = parseFlags(flags).local
  const preserve = parseFlags(flags).preserve

  const remote = getRemote(local, name)
  if (!preserve) {
    emptyTestDir(remote, remove = true)
  }

  if (preserve) {
    console.info(chalk.yellow(remote), chalk.inverse('preserved'))
  } else {
    console.info(chalk.cyan('cleaning up...'))
    console.info(chalk.yellow(remote), chalk.inverse('deleted'))
  }
}

