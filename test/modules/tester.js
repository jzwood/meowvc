const test = require('ava')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const helper = require('./helper')

module.exports = {
  cleanupTest,
  muSave,
  muStart,
  setupTest,
  mu: testMu
}

// runs $ mu <param> in test environment
function testMu(args) {
  // whack all references in require cache
  for (const req of Object.keys(require.cache)) {
    if (!(/node_modules/.test(req))) {
      delete require.cache[req]
    }
  }
  const mu = require('../../mu')
  return mu.call(null, args)
}

//runs mu start in the right place (local|dropbox)
function muStart(options, name = '', msg = '') {
  helper.print(`${ options.local ? chalk.inverse('MU START LOCAL ' + msg) : chalk.inverse('MU START DROPBOX ' + msg)}`)
  return testMu([options.quiet, 'start', options.local ? false : name].filter(Boolean))
}

function muSave(quiet) {
  return testMu([quiet, 'save', 'save message ' + helper.makeWord()])
}

async function emptyTestDir(remote, remove = false) {
  if (remote === '.mu' || remote.includes('Mu Repositories')) { // last rmrf failsafe
    await (remove ? fs.remove(remote) : fs.emptyDir(remote))
  }
}

async function getRemote(local, name) {
  muOps = require('../../src/modules/muOps')
  await muOps.update()
  return muOps._test.findRemotePath(local ? false : name)
}

async function setupTest(options, name) {
  const tempPath = path.join(process.cwd(), 'test', 'temp', name)
  await fs.emptyDir(tempPath)
  process.chdir(tempPath)

  name = path.join('test', name)
  const remote = await getRemote(options.local, name)
  await emptyTestDir(remote)

  if(!options.noMu){
    return muStart(options, name)
  }
}

async function cleanupTest(local, name) {
  name = path.join('test', name)
  const remote = await getRemote(local, name)
  await emptyTestDir(remote, true)
  helper.print(chalk.cyan('cleaning up...'))
  helper.print(chalk.yellow(remote), chalk.inverse('deleted'))
}
