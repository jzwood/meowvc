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
  helper.print(`${ isLocal ? chalk.inverse('MU START LOCAL ' + msg) : chalk.inverse('MU START DROPBOX ' + msg)}`)
  isLocal ? testMu(['start']) : testMu(['start', name])
}

function muSave() {
  testMu(['save', 'save message ' + helper.makeWord()])
}

async function emptyTestDir(remote, remove = false) {
  if (/\.mu\\|Mu Repositories/.test(remote)) { // last rmrf failsafe
    await (remove ? fs.remove(remote) : fs.emptyDir(remote))
  }
}

function getRemote(isLocal, name) {
  const muOps = require('../../src/modules/muOps')
  return muOps.findRemotePath(isLocal ? false : name)
}

async function setupTest(flags, name) {
  const local = parseFlags(flags).local

  const tempPath = path.join(process.cwd(), 'test', 'temp')
  await fs.emptyDir(tempPath)
  process.chdir(tempPath)

  name = path.join('test', name)
  const remote = getRemote(local, name)
  await emptyTestDir(remote)

  muStart(local, name)
}

async function cleanupTest(flags, name) {
  name = path.join('test', name)
  const {local, preserve} = parseFlags(flags)

  const remote = getRemote(local, name)

  if (preserve) {
    helper.print(chalk.yellow(remote), chalk.inverse('preserved'))
  } else {
    await emptyTestDir(remote, remove = true)
    helper.print(chalk.cyan('cleaning up...'))
    helper.print(chalk.yellow(remote), chalk.inverse('deleted'))
  }
}
