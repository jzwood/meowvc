/*
*  LOCAL/DROPBOX MU OPERATIONS
*/

const fs = require('fs-extra')
const os = require('os')
const path = require('path')

const cwd = process.cwd()

const MU = {
  muid: '.muid',
  local: '.mu',
  remote: 'Mu Repositories',
  get muidPath() {
    return path.join(cwd, this.muid)
  }
}

const muOps = {
  setupRemote,
  findMuidAncestor,
  repoPath: getRepoPath(),
  path() {
    return path.join(this.repoPath, ...arguments)
  }
}

function setupRemote(name) {
  const dropboxPath = getDropboxPath()
  let repoPath = dropboxPath ? path.join(dropboxPath, name) : MU.local
  fs.ensureDirSync(repoPath)
  fs.writeFileSync(MU.muidPath, repoPath)
  muOps.repoPath = getRepoPath()
}

function findMuidAncestor() {
  const parentPath = cwd.split(path.sep)
  while (parentPath.length) {
    parentPath.pop()
    if (fs.existsSync(path.join(...parentPath, MU.muid))) {
      return parentPath
    }
  }
  return null
}

function getDropboxPath() {
  const home = os.homedir()
  const dropboxConfigPath = path.join(home, '.dropbox', 'info.json')
  if (!fs.existsSync(dropboxConfigPath)) {
    return false
  }

  const dropboxConfig = fs.readJsonSync(dropboxConfigPath)
  const dropBoxPath = dropboxConfig.personal.path

  if (!fs.existsSync(dropBoxPath)) {
    return false
  }

  const dropboxProjects = path.join(dropBoxPath, MU.remote)
  fs.ensureDirSync(dropboxProjects)
  return dropboxProjects
}

function getRepoPath() {
  let repoPath
  if (fs.existsSync(MU.muidPath)) {
    let repoPath = fs.readFileSync(MU.muidPath, 'utf8')
    if (!fs.existsSync(repoPath)) {
      repoPath = MU.local
      fs.writeJsonSync(MU.muidPath, MU.local)
    }
    return repoPath
  }
  return ''
}

module.exports = muOps
